<?php

use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;

function makeCoupon(array $overrides = []): Coupon
{
    return Coupon::create(array_merge([
        'code' => 'TEST10',
        'type' => 'percent',
        'value' => 10,
        'is_active' => true,
    ], $overrides));
}

test('un cupón de porcentaje aplica descuento y recalcula IVA', function () {
    $product = Product::factory()->withStock(10)->create(['price' => 500]);
    makeCoupon();

    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => 'Con Cupón',
        'payment_method' => 'cash',
        'coupon_code' => 'test10',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.subtotal', '500.00')
        ->assertJsonPath('data.discount_amount', '50.00')
        ->assertJsonPath('data.tax_amount', '72.00')
        ->assertJsonPath('data.total_amount', '522.00');

    expect(Coupon::first()->used_count)->toBe(1);
    $this->assertDatabaseHas('sales', ['customer_name' => 'Con Cupón']);
});

test('un cupón de monto fijo respeta el mínimo', function () {
    $product = Product::factory()->withStock(10)->create(['price' => 600]);
    makeCoupon(['code' => 'BAJON50', 'type' => 'fixed', 'value' => 50, 'min_amount' => 500]);

    $response = $this->postJson('/api/v1/orders', [
        'customer_name' => 'Fijo',
        'payment_method' => 'cash',
        'coupon_code' => 'BAJON50',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.discount_amount', '50.00')
        ->assertJsonPath('data.total_amount', '638.00');
});

test('el cupón inválido, expirado o agotado rechaza el pedido', function () {
    $product = Product::factory()->withStock(10)->create();

    $this->postJson('/api/v1/orders', [
        'customer_name' => 'X',
        'payment_method' => 'cash',
        'coupon_code' => 'NOEXISTE',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertStatus(422)->assertJsonPath('message', 'Cupón inválido');

    makeCoupon(['code' => 'VENCIDO', 'expires_at' => now()->subDay()]);
    $this->postJson('/api/v1/orders', [
        'customer_name' => 'X',
        'payment_method' => 'cash',
        'coupon_code' => 'VENCIDO',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertStatus(422)->assertJsonPath('message', 'El cupón ha expirado');

    makeCoupon(['code' => 'AGOTADO', 'usage_limit' => 1, 'used_count' => 1]);
    $this->postJson('/api/v1/orders', [
        'customer_name' => 'X',
        'payment_method' => 'cash',
        'coupon_code' => 'AGOTADO',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertStatus(422)->assertJsonPath('message', 'El cupón ya fue agotado');
});

test('el cupón respeta el monto mínimo del pedido', function () {
    $product = Product::factory()->withStock(10)->create(['price' => 100]);
    makeCoupon(['code' => 'MIN500', 'min_amount' => 500]);

    $this->postJson('/api/v1/orders', [
        'customer_name' => 'Poco',
        'payment_method' => 'cash',
        'coupon_code' => 'MIN500',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertStatus(422);
});

test('el endpoint público de validación previsualiza el descuento', function () {
    makeCoupon(['code' => 'PREV10', 'value' => 10]);

    $this->getJson('/api/v1/coupons/validate?code=prev10&subtotal=200')
        ->assertOk()
        ->assertJsonPath('data.code', 'PREV10')
        ->assertJsonPath('data.discount', 20);

    $this->getJson('/api/v1/coupons/validate?code=nada&subtotal=200')->assertNotFound();
});

test('solo admin puede gestionar cupones', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff, 'sanctum')->postJson('/api/v1/admin/coupons', [
        'code' => 'STAFFX',
        'type' => 'percent',
        'value' => 5,
    ])->assertForbidden();

    $admin = User::factory()->admin()->create();
    $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/coupons', [
        'code' => 'nuevo5',
        'type' => 'percent',
        'value' => 5,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.code', 'NUEVO5');

    $this->actingAs($admin, 'sanctum')->putJson("/api/v1/admin/coupons/{$response->json('data.id')}", [
        'code' => 'NUEVO5',
        'type' => 'percent',
        'value' => 8,
        'is_active' => false,
    ])->assertOk()->assertJsonPath('data.value', '8.00');

    $this->actingAs($admin, 'sanctum')
        ->deleteJson("/api/v1/admin/coupons/{$response->json('data.id')}")
        ->assertOk();

    $this->assertDatabaseMissing('coupons', ['code' => 'NUEVO5']);
});

test('sin cupón los totales no cambian', function () {
    $product = Product::factory()->withStock(5)->create(['price' => 100]);

    $this->postJson('/api/v1/orders', [
        'customer_name' => 'Sin Cupón',
        'payment_method' => 'cash',
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ])->assertStatus(201)
        ->assertJsonPath('data.discount_amount', '0.00')
        ->assertJsonPath('data.total_amount', '232.00');
});
