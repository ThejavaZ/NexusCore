<?php

use App\Models\Product;
use App\Models\Sale;

function stripeHeader(string $payload, string $secret): string
{
    $ts = time();

    return 't='.$ts.',v1='.hash_hmac('sha256', "{$ts}.{$payload}", $secret);
}

function makeCardOrder(array $overrides = []): Sale
{
    $product = Product::factory()->withStock(10)->create(['price' => 200, 'cost' => 100]);

    $response = test()->postJson('/api/v1/orders', array_merge([
        'customer_name' => 'Cliente Stripe',
        'customer_email' => 'cliente@ejemplo.com',
        'payment_method' => 'card',
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ], $overrides));

    $response->assertStatus(201);

    return Sale::findOrFail($response->json('data.id'));
}

test('un pedido con tarjeta queda pendiente de pago y devuelve URL de pago', function () {
    $sale = makeCardOrder();

    expect($sale->status->value)->toBe('pending_payment')
        ->and($sale->stripe_session_id)->toStartWith('cs_fake_');

    $this->assertDatabaseHas('products', ['id' => $sale->details()->first()->product_id, 'stock' => 8]);
});

test('el pago simulado confirma el pedido como pagado', function () {
    $sale = makeCardOrder();

    $response = $this->postJson('/api/v1/payments/fake/confirm', [
        'session_id' => $sale->stripe_session_id,
    ]);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.status', 'paid');

    expect($sale->fresh()->status->value)->toBe('paid');
});

test('confirmar un pago con sesión inexistente devuelve 404', function () {
    $this->postJson('/api/v1/payments/fake/confirm', ['session_id' => 'cs_fake_nope'])
        ->assertNotFound();
});

test('el confirmado simulado no existe con driver stripe', function () {
    $sale = makeCardOrder();
    config(['payments.driver' => 'stripe']);

    $this->postJson('/api/v1/payments/fake/confirm', ['session_id' => $sale->stripe_session_id])
        ->assertNotFound();
});

test('pedido con efectivo se marca pagado de inmediato', function () {
    $product = Product::factory()->withStock(5)->create();

    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => 'Efectivo',
        'payment_method' => 'cash',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.status', 'paid')
        ->assertJsonPath('data.payment_url', null);
});

test('webhook de pago completado marca la venta como pagada', function () {
    config(['payments.stripe.webhook_secret' => 'whsec_test_123']);
    $sale = makeCardOrder();

    $payload = json_encode([
        'type' => 'checkout.session.completed',
        'data' => ['object' => [
            'id' => $sale->stripe_session_id,
            'metadata' => ['sale_id' => (string) $sale->id],
        ]],
    ]);

    $this->call('POST', '/api/v1/stripe/webhook', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_STRIPE_SIGNATURE' => stripeHeader($payload, 'whsec_test_123'),
    ], $payload)->assertOk();

    expect($sale->fresh()->status->value)->toBe('paid');
});

test('webhook con firma inválida se rechaza', function () {
    config(['payments.stripe.webhook_secret' => 'whsec_test_123']);
    makeCardOrder();

    $payload = json_encode(['type' => 'checkout.session.completed', 'data' => ['object' => []]]);

    $this->call('POST', '/api/v1/stripe/webhook', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_STRIPE_SIGNATURE' => 't=1,v1=firma_mala',
    ], $payload)->assertStatus(400);
});

test('webhook de sesión expirada cancela la venta y restaura stock', function () {
    config(['payments.stripe.webhook_secret' => 'whsec_test_123']);
    $sale = makeCardOrder();
    $detail = $sale->details()->first();

    $payload = json_encode([
        'type' => 'checkout.session.expired',
        'data' => ['object' => [
            'id' => $sale->stripe_session_id,
            'metadata' => ['sale_id' => (string) $sale->id],
        ]],
    ]);

    $this->call('POST', '/api/v1/stripe/webhook', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_STRIPE_SIGNATURE' => stripeHeader($payload, 'whsec_test_123'),
    ], $payload)->assertOk();

    expect($sale->fresh()->status->value)->toBe('cancelled');
    $this->assertDatabaseHas('products', ['id' => $detail->product_id, 'stock' => 10]);
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $detail->product_id,
        'type' => 'restock',
        'reference' => $sale->invoice_number.' (cancelado)',
    ]);
});

test('con driver stripe sin claves el pedido falla y no deja stock fantasma', function () {
    config(['payments.driver' => 'stripe', 'payments.stripe.secret' => null]);
    $product = Product::factory()->withStock(10)->create();

    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => 'Sin Pasarela',
        'payment_method' => 'card',
        'items' => [['product_id' => $product->id, 'quantity' => 3]],
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('success', false);

    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 10]);
    $this->assertDatabaseHas('sales', [
        'customer_name' => 'Sin Pasarela',
        'status' => 'cancelled',
    ]);
});

test('el pedido se puede consultar públicamente por session_id', function () {
    $sale = makeCardOrder();

    $this->getJson('/api/v1/orders/by-session/'.$sale->stripe_session_id)
        ->assertOk()
        ->assertJsonPath('data.invoice_number', $sale->invoice_number)
        ->assertJsonPath('data.status', 'pending_payment');

    $this->getJson('/api/v1/orders/by-session/cs_fake_inexistente')->assertNotFound();
});
