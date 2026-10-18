<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

function makeOrderFor(User $user, array $overrides = []): Sale
{
    $product = Product::factory()->withStock(5)->create();

    $sale = Sale::create(array_merge([
        'invoice_number' => Sale::generateInvoiceNumber(),
        'sale_date' => now(),
        'customer_name' => $user->name,
        'customer_email' => $user->email,
        'subtotal' => 100,
        'tax_amount' => 16,
        'total_amount' => 116,
        'payment_method' => 'cash',
        'status' => 'paid',
        'created_by' => $user->id,
    ], $overrides));

    $sale->details()->create([
        'product_id' => $product->id,
        'product_name' => $product->name,
        'unit_price' => 100,
        'quantity' => 1,
        'total_price' => 100,
    ]);

    return $sale;
}

test('un cliente ve solo sus pedidos', function () {
    $customer = User::factory()->create();
    $other = User::factory()->create();

    $mine = makeOrderFor($customer);
    makeOrderFor($other);

    $response = $this->actingAs($customer, 'sanctum')->getJson('/api/v1/orders/mine');

    $response->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.id', $mine->id);
});

test('los pedidos de invitado con el mismo email aparecen como propios', function () {
    $customer = User::factory()->create();
    $guestSale = makeOrderFor(User::factory()->create(), [
        'customer_email' => $customer->email,
        'created_by' => null,
    ]);

    $this->actingAs($customer, 'sanctum')->getJson('/api/v1/orders/mine')
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.id', $guestSale->id);
});

test('orders/mine requiere autenticación', function () {
    $this->getJson('/api/v1/orders/mine')->assertUnauthorized();
});

test('un cliente puede ver el detalle de su pedido', function () {
    $customer = User::factory()->create();
    $sale = makeOrderFor($customer);

    $this->actingAs($customer, 'sanctum')->getJson("/api/v1/orders/mine/{$sale->id}")
        ->assertOk()
        ->assertJsonPath('data.invoice_number', $sale->invoice_number)
        ->assertJsonCount(1, 'data.details');
});

test('no se puede ver el pedido de otro usuario', function () {
    $customer = User::factory()->create();
    $sale = makeOrderFor(User::factory()->create());

    $this->actingAs($customer, 'sanctum')->getJson("/api/v1/orders/mine/{$sale->id}")
        ->assertNotFound();
});
