<?php

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->staff = User::factory()->staff()->create();
});

test('el historial de stock requiere autenticación', function () {
    $this->getJson('/api/v1/admin/stock-movements')->assertUnauthorized();
});

test('staff y admin pueden ver el historial de stock', function () {
    $this->actingAs($this->staff, 'sanctum')
        ->getJson('/api/v1/admin/stock-movements')
        ->assertOk()
        ->assertJsonPath('success', true);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/admin/stock-movements')
        ->assertOk();
});

test('clientes no pueden ver el historial de stock', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer, 'sanctum')
        ->getJson('/api/v1/admin/stock-movements')
        ->assertForbidden();
});

test('lista movimientos paginados con producto y creador', function () {
    $product = Product::factory()->create();
    StockMovement::create([
        'product_id' => $product->id,
        'type' => StockMovementType::Adjustment,
        'quantity' => 5,
        'stock_before' => 10,
        'stock_after' => 15,
        'reference' => 'Revisión manual',
        'created_by' => $this->admin->id,
    ]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/admin/stock-movements');

    $response->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.product.name', $product->name)
        ->assertJsonPath('data.data.0.creator.id', $this->admin->id);
});

test('filtra movimientos por producto', function () {
    $productA = Product::factory()->create();
    $productB = Product::factory()->create();

    StockMovement::create([
        'product_id' => $productA->id,
        'type' => StockMovementType::Adjustment,
        'quantity' => 1,
        'stock_before' => 0,
        'stock_after' => 1,
        'created_by' => $this->admin->id,
    ]);
    StockMovement::create([
        'product_id' => $productB->id,
        'type' => StockMovementType::Sale,
        'quantity' => -1,
        'stock_before' => 1,
        'stock_after' => 0,
        'created_by' => $this->admin->id,
    ]);

    $this->actingAs($this->admin, 'sanctum')
        ->getJson("/api/v1/admin/stock-movements?product_id={$productA->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.product_id', $productA->id);
});
