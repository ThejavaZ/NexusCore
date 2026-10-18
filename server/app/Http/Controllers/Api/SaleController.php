<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sale::with('details');

        if ($request->filled('from')) {
            $query->where('sale_date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->where('sale_date', '<=', $request->to);
        }

        $sales = $query->latest('sale_date')->paginate(15);

        return response()->json($sales);
    }

    public function show(Sale $sale): JsonResponse
    {
        $sale->load('details');

        return response()->json(['sale' => $sale]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email',
            'payment_method' => 'required|in:cash,card,transfer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            $sale = DB::transaction(function () use ($data) {
                $subtotal = collect($data['items'])->sum(
                    fn ($item) => $item['quantity'] * $item['unit_price']
                );
                $taxAmount = $subtotal * 0.16;
                $totalAmount = $subtotal + $taxAmount;

                $sale = Sale::create([
                    'invoice_number' => Sale::generateInvoiceNumber(),
                    'sale_date' => now(),
                    'customer_name' => $data['customer_name'],
                    'customer_phone' => $data['customer_phone'] ?? null,
                    'customer_email' => $data['customer_email'] ?? null,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                    'payment_method' => $data['payment_method'],
                ]);

                foreach ($data['items'] as $item) {
                    $sale->details()->create([
                        'product_id' => $item['product_id'],
                        'product_name' => Product::find($item['product_id'])->name,
                        'unit_price' => $item['unit_price'],
                        'quantity' => $item['quantity'],
                        'total_price' => $item['quantity'] * $item['unit_price'],
                    ]);
                }

                return $sale;
            });

            return response()->json([
                'message' => 'Venta registrada exitosamente',
                'sale' => $sale->load('details'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear venta', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Error al registrar la venta',
            ], 500);
        }
    }

    public function chart(): JsonResponse
    {
        $sales = DB::table('sales')
            ->selectRaw('DATE(sale_date) as date, COUNT(*) as total, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($sales);
    }
}
