<?php

namespace App\Http\Controllers\Api;

use App\Enums\SaleStatus;
use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FakePaymentController extends Controller
{
    /**
     * Simula la aprobación de un pago (solo con PAYMENT_DRIVER=fake).
     */
    public function confirm(Request $request): JsonResponse
    {
        if (config('payments.driver') !== 'fake') {
            abort(404);
        }

        $data = $request->validate([
            'session_id' => 'required|string',
        ]);

        $sale = Sale::where('stripe_session_id', $data['session_id'])->firstOrFail();

        if ($sale->status === SaleStatus::PendingPayment) {
            $sale->update(['status' => SaleStatus::Paid]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pago confirmado',
            'data' => $sale->fresh(),
        ]);
    }
}
