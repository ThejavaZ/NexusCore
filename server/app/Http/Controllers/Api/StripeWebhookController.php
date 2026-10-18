<?php

namespace App\Http\Controllers\Api;

use App\Enums\SaleStatus;
use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    /**
     * Stripe webhook — verifica firma y confirma/cancela pedidos.
     */
    public function handle(Request $request): JsonResponse
    {
        $secret = config('payments.stripe.webhook_secret');
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');

        if (! $secret || ! $signature) {
            return response()->json(['success' => false, 'message' => 'Webhook no configurado'], 400);
        }

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (SignatureVerificationException $e) {
            return response()->json(['success' => false, 'message' => 'Firma inválida'], 400);
        }

        $type = $event->type;
        $session = $event->data->object;
        $saleId = $session->metadata->sale_id ?? null;

        match ($type) {
            'checkout.session.completed' => $this->complete($saleId),
            'checkout.session.expired' => $this->expire($saleId),
            default => null,
        };

        return response()->json(['success' => true]);
    }

    private function complete(?string $saleId): void
    {
        if (! $saleId) {
            return;
        }

        $sale = Sale::find($saleId);

        if ($sale && $sale->status === SaleStatus::PendingPayment) {
            $sale->update(['status' => SaleStatus::Paid]);
        }
    }

    private function expire(?string $saleId): void
    {
        if (! $saleId) {
            return;
        }

        $sale = Sale::find($saleId);

        if ($sale && $sale->status === SaleStatus::PendingPayment) {
            $sale->cancelAndRestore();
            Log::info("Pedido {$sale->invoice_number} cancelado por sesión de pago expirada");
        }
    }
}
