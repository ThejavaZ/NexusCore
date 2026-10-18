<?php

namespace App\Services;

use App\Models\Sale;
use Illuminate\Support\Str;
use RuntimeException;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class PaymentService
{
    public function driver(): string
    {
        return config('payments.driver', 'stripe');
    }

    /**
     * Crea la sesión de pago y devuelve session_id + URL de redirección.
     *
     * @return array{session_id: string, payment_url: string}
     *
     * @throws RuntimeException
     */
    public function createCheckoutSession(Sale $sale): array
    {
        return $this->driver() === 'fake'
            ? $this->createFakeSession($sale)
            : $this->createStripeSession($sale);
    }

    /**
     * @return array{session_id: string, payment_url: string}
     */
    private function createFakeSession(Sale $sale): array
    {
        $sessionId = 'cs_fake_'.Str::random(32);

        return [
            'session_id' => $sessionId,
            'payment_url' => rtrim(config('payments.frontend_url'), '/')."/checkout/pay?session_id={$sessionId}",
        ];
    }

    /**
     * @return array{session_id: string, payment_url: string}
     *
     * @throws RuntimeException
     */
    private function createStripeSession(Sale $sale): array
    {
        $secret = config('payments.stripe.secret');

        if (! $secret) {
            throw new RuntimeException('Pasarela de pago no configurada (falta STRIPE_SECRET)');
        }

        try {
            Stripe::setApiKey($secret);

            $session = Session::create([
                'mode' => 'payment',
                'client_reference_id' => $sale->invoice_number,
                'customer_email' => $sale->customer_email,
                'metadata' => ['sale_id' => (string) $sale->id],
                'success_url' => rtrim(config('payments.frontend_url'), '/').'/checkout/success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => rtrim(config('payments.frontend_url'), '/').'/checkout?cancelled=1',
                'line_items' => $sale->details->map(fn ($detail) => [
                    'quantity' => $detail->quantity,
                    'price_data' => [
                        'currency' => config('payments.currency', 'usd'),
                        'unit_amount' => (int) round($detail->unit_price * 100),
                        'product_data' => [
                            'name' => $detail->product_name,
                        ],
                    ],
                ])->values()->all(),
            ]);
        } catch (\Throwable $e) {
            throw new RuntimeException('Error al crear la sesión de pago: '.$e->getMessage(), 0, $e);
        }

        return [
            'session_id' => $session->id,
            'payment_url' => $session->url,
        ];
    }
}
