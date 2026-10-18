<?php

namespace App\Http\Controllers\Api;

use App\Enums\RepairStatus;
use App\Http\Controllers\Controller;
use App\Models\Repair;
use App\Services\EmailApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RepairController extends Controller
{
    public function __construct(
        protected EmailApiService $emailService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Repair::with(['customer', 'technician'])->latest();

        if ($request->filled('status')) {
            $query->byStatus(RepairStatus::from($request->status));
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->integer('assigned_to'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q
                ->where('repair_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_email', 'like', "%{$search}%")
                ->orWhere('device_type', 'like', "%{$search}%"));
        }

        $repairs = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $repairs,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'required|string|max:20',
            'device_type' => 'required|string|max:100',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'serial_number' => 'nullable|string|max:100',
            'issue_description' => 'required|string',
            'estimated_cost' => 'nullable|numeric|min:0',
            'estimated_delivery' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        try {
            $repair = DB::transaction(function () use ($data) {
                $repair = Repair::create([
                    ...$data,
                    'repair_number' => Repair::generateRepairNumber(),
                    'received_at' => now(),
                    'status' => RepairStatus::Pending,
                ]);

                $repair->statusHistory()->create([
                    'status_to' => RepairStatus::Pending->value,
                    'notes' => 'Reparación registrada',
                    'changed_by' => auth()->id(),
                ]);

                return $repair;
            });

            $repair->load(['customer', 'technician']);
            $this->emailService->sendRegistrationEmail($repair);

            return response()->json([
                'success' => true,
                'message' => 'Reparación registrada exitosamente',
                'data' => $repair,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear reparación', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error al crear la reparación',
            ], 500);
        }
    }

    public function show(Repair $repair): JsonResponse
    {
        $repair->load(['customer', 'technician', 'statusHistory.user']);

        return response()->json([
            'success' => true,
            'data' => $repair,
        ]);
    }

    public function update(Request $request, Repair $repair): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => 'sometimes|string|max:255',
            'customer_email' => 'sometimes|email',
            'customer_phone' => 'sometimes|string|max:20',
            'technician_notes' => 'nullable|string',
            'estimated_cost' => 'nullable|numeric|min:0',
            'final_cost' => 'nullable|numeric|min:0',
            'estimated_delivery' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $repair->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Reparación actualizada exitosamente',
            'data' => $repair->load(['customer', 'technician']),
        ]);
    }

    public function destroy(Repair $repair): JsonResponse
    {
        $repair->delete();

        return response()->json([
            'success' => true,
            'message' => 'Reparación eliminada exitosamente',
        ]);
    }

    public function changeStatus(Request $request, Repair $repair): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:'.collect(RepairStatus::cases())->pluck('value')->implode(','),
            'notes' => 'nullable|string',
            'final_cost' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $oldStatus = $repair->status;
            $newStatus = RepairStatus::from($data['status']);
            $repair->status = $newStatus;

            if (isset($data['final_cost'])) {
                $repair->final_cost = $data['final_cost'];
            }

            if ($newStatus === RepairStatus::Delivered) {
                $repair->delivered_at = now();
            }

            $repair->save();

            $repair->statusHistory()->create([
                'status_from' => $oldStatus->value,
                'status_to' => $newStatus->value,
                'notes' => $data['notes'] ?? null,
                'changed_by' => auth()->id(),
            ]);

            DB::commit();

            $this->emailService->sendStatusChangeEmail($repair, $oldStatus->value, $newStatus->value);
            $repair->load(['customer', 'technician', 'statusHistory']);

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado exitosamente',
                'data' => $repair,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al cambiar estado de reparación', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error al cambiar el estado',
            ], 500);
        }
    }

    /**
     * Dashboard summary — count by status.
     */
    public function summary(): JsonResponse
    {
        $byStatus = Repair::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $pending = $byStatus->get('pending', 0);
        $inProgress = $byStatus->get('in_progress', 0)
            + $byStatus->get('diagnosed', 0)
            + $byStatus->get('approved', 0);
        $completed = $byStatus->get('completed', 0);
        $delivered = $byStatus->get('delivered', 0);

        return response()->json([
            'success' => true,
            'data' => [
                'pending' => $pending,
                'in_progress' => $inProgress,
                'completed' => $completed,
                'delivered' => $delivered,
                'total' => array_sum($byStatus->toArray()),
            ],
        ]);
    }
}
