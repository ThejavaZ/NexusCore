<?php

use App\Models\Product;
use App\Models\User;

test('un invitado puede crear un pedido sin autenticación', function () {
    $product = Product::factory()->withStock(10)->create(['price' => 500, 'cost' => 300]);

    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => 'Cliente Invitado',
        'customer_email' => 'invitado@ejemplo.com',
        'payment_method' => 'card',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 3],
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.customer_name', 'Cliente Invitado')
        ->assertJsonPath('data.details.0.quantity', 3);

    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 7]);
});

test('el pedido como invitado calcula totales con IVA', function () {
    $product = Product::factory()->withStock(10)->create(['price' => 100]);

    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => 'IVA Test',
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.subtotal', '200.00')
        ->assertJsonPath('data.tax_amount', '32.00')
        ->assertJsonPath('data.total_amount', '232.00');
});

test('un cliente autenticado también puede crear pedidos', function () {
    $customer = User::factory()->create();
    $product = Product::factory()->withStock(5)->create();

    $response = $this->actingAs($customer, 'sanctum')->postJson('/api/v1/orders', [
        'customer_name' => $customer->name,
        'customer_email' => $customer->email,
        'payment_method' => 'transfer',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('sales', [
        'customer_email' => $customer->email,
        'created_by' => $customer->id,
    ]);
});

test('el pedido rechaza stock insuficiente', function () {
    $product = Product::factory()->withStock(2)->create();

    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => 'Sin Stock',
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5],
        ],
    ]);

    $response->assertStatus(422);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 2]);
});

test('el pedido valida método de pago y datos mínimos', function () {
    $this->postJson('/api/v1/orders', [
        'customer_name' => 'X',
        'payment_method' => 'bitcoin',
        'items' => [['product_id' => 999, 'quantity' => 1]],
    ])->assertStatus(422);

    $this->postJson('/api/v1/orders', [
        'payment_method' => 'cash',
        'items' => [],
    ])->assertStatus(422);
});
