<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->staff()->create();
});

test('el listado de ventas requiere autenticación', function () {
    $this->getJson('/api/v1/sales')->assertUnauthorized();
});

test('un staff puede listar ventas', function () {
    Sale::factory()->count(3)->create();

    $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/v1/sales');

    $response->assertOk()->assertJsonCount(3, 'data.data');
});

test('el listado filtra por método de pago', function () {
    Sale::factory()->create(['payment_method' => 'cash']);
    Sale::factory()->create(['payment_method' => 'card']);

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/sales?payment_method=cash');

    $response->assertOk()->assertJsonCount(1, 'data.data');
});

test('el listado busca por número de factura', function () {
    Sale::factory()->create(['invoice_number' => 'INV-0042']);

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/sales?search=INV-0042');

    $response->assertOk()->assertJsonCount(1, 'data.data');
});

test('se puede registrar una venta válida', function () {
    $product = Product::factory()->withStock(10)->create(['price' => 1000, 'cost' => 800]);

    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/sales', [
        'customer_name' => 'Juan Pérez',
        'customer_phone' => '5551234567',
        'customer_email' => 'juan@example.com',
        'payment_method' => 'cash',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.customer_name', 'Juan Pérez')
        ->assertJsonPath('data.details.0.quantity', 2);

    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 8]);
});

test('la venta descuenta stock y genera movimiento', function () {
    $product = Product::factory()->withStock(10)->create();

    $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/sales', [
        'customer_name' => 'María',
        'payment_method' => 'card',
        'items' => [['product_id' => $product->id, 'quantity' => 3]],
    ]);

    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 7]);
    $this->assertDatabaseHas('stock_movements', [
        'product_id' => $product->id,
        'type' => 'sale',
        'quantity' => -3,
        'stock_before' => 10,
        'stock_after' => 7,
    ]);
});

test('la venta falla si stock insuficiente', function () {
    $product = Product::factory()->withStock(2)->create();

    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/sales', [
        'customer_name' => 'Pedro',
        'payment_method' => 'cash',
        'items' => [['product_id' => $product->id, 'quantity' => 5]],
    ]);

    $response->assertStatus(422);
    $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 2]);
});

test('la venta calcula subtotal, IVA y total', function () {
    $product = Product::factory()->withStock(10)->create(['price' => 1000]);

    $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/v1/sales', [
        'customer_name' => 'Test',
        'payment_method' => 'cash',
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ]);

    $response->assertStatus(201);
    $sale = $response->json('data');
    expect((float) $sale['subtotal'])->toBe(2000.0);
    expect((float) $sale['tax_amount'])->toBe(320.0);
    expect((float) $sale['total_amount'])->toBe(2320.0);
});

test('se puede ver el detalle de una venta', function () {
    $sale = Sale::factory()->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson("/api/v1/sales/{$sale->id}");

    $response->assertOk()->assertJsonPath('data.id', $sale->id);
});

test('el resumen del dashboard devuelve totales', function () {
    Sale::factory()->count(2)->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/sales/summary');

    $response->assertOk()->assertJsonStructure([
        'data' => ['today_sales', 'today_revenue', 'month_revenue', 'total_sales', 'top_products'],
    ]);
});

test('el gráfico de ventas agrupa por fecha', function () {
    Sale::factory()->count(3)->create(['sale_date' => now()]);

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/sales/chart');

    $response->assertOk()->assertJsonCount(1, 'data');
});

test('un customer no puede acceder a ventas', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer, 'sanctum')->getJson('/api/v1/sales')->assertForbidden();
});
