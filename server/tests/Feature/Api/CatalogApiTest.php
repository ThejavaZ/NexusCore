<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;

test('el catálogo público lista productos activos', function () {
    Product::factory()->create(['name' => 'RTX 5090', 'is_active' => true]);

    $response = $this->getJson('/api/v1/products');

    $response
        ->assertOk()
        ->assertJsonPath('data.data.0.name', 'RTX 5090');
});

test('el catálogo excluye productos inactivos', function () {
    Product::factory()->inactive()->create();

    $response = $this->getJson('/api/v1/products');

    $response->assertOk()->assertJsonCount(0, 'data.data');
});

test('el catálogo filtra productos por categoría', function () {
    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);
    Product::factory()->create();

    $response = $this->getJson("/api/v1/products?category_id={$category->id}");

    $response->assertOk()->assertJsonCount(1, 'data.data');
});

test('el catálogo busca productos por nombre', function () {
    Product::factory()->create(['name' => 'RTX 5090']);
    Product::factory()->create(['name' => 'RX 7900']);

    $response = $this->getJson('/api/v1/products?search=RTX');

    $response->assertOk()->assertJsonCount(1, 'data.data');
});

test('se muestra un producto por su slug', function () {
    Product::factory()->create(['name' => 'RTX 5090', 'slug' => 'rtx-5090']);

    $response = $this->getJson('/api/v1/products/rtx-5090');

    $response
        ->assertOk()
        ->assertJsonPath('data.name', 'RTX 5090');
});

test('un slug inexistente devuelve 404', function () {
    $response = $this->getJson('/api/v1/products/no-existe');

    $response->assertNotFound();
});

test('el catálogo devuelve categorías activas', function () {
    Category::factory()->create(['name' => 'Procesadores', 'is_active' => true]);
    Category::factory()->create(['name' => 'Oculta', 'is_active' => false]);

    $response = $this->getJson('/api/v1/categories');

    $response->assertOk()->assertJsonCount(1, 'data');
});

/*
|--------------------------------------------------------------------------
| Admin CRUD
|--------------------------------------------------------------------------
*/

test('un staff puede crear un producto', function () {
    $user = User::factory()->staff()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/admin/products', [
        'name' => 'RTX 5090',
        'sku' => 'SKU-RTX5090',
        'category_id' => $category->id,
        'stock' => 10,
        'min_stock' => 2,
        'price' => 30000,
        'cost' => 25000,
    ]);

    $response->assertStatus(201)->assertJsonPath('data.name', 'RTX 5090');
    $this->assertDatabaseHas('products', ['sku' => 'SKU-RTX5090']);
});

test('crear producto genera un movimiento de stock inicial', function () {
    $user = User::factory()->staff()->create();
    $category = Category::factory()->create();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/admin/products', [
        'name' => 'RTX 5090',
        'sku' => 'SKU-RTX5090',
        'category_id' => $category->id,
        'stock' => 10,
        'min_stock' => 2,
        'price' => 30000,
        'cost' => 25000,
    ]);

    $this->assertDatabaseHas('stock_movements', [
        'type' => 'initial',
        'quantity' => 10,
        'stock_before' => 0,
        'stock_after' => 10,
    ]);
});

test('crear producto valida SKU duplicado', function () {
    $user = User::factory()->staff()->create();
    $category = Category::factory()->create();
    Product::factory()->create(['sku' => 'SKU-DUP']);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/admin/products', [
        'name' => 'Otro',
        'sku' => 'SKU-DUP',
        'category_id' => $category->id,
        'stock' => 5,
        'min_stock' => 1,
        'price' => 100,
        'cost' => 80,
    ]);

    $response->assertStatus(422);
});

test('un staff puede actualizar un producto', function () {
    $user = User::factory()->staff()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/admin/products/{$product->id}", [
        'name' => 'RTX 5090 Ti',
        'price' => 35000,
    ]);

    $response->assertOk()->assertJsonPath('data.name', 'RTX 5090 Ti');
});

test('un staff puede desactivar un producto', function () {
    $user = User::factory()->staff()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/admin/products/{$product->id}");

    $response->assertOk();
    $this->assertDatabaseHas('products', ['id' => $product->id, 'is_active' => false]);
});

test('un staff puede ajustar stock', function () {
    $user = User::factory()->staff()->create();
    $product = Product::factory()->withStock(10)->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/admin/products/{$product->id}/adjust-stock", [
            'quantity' => 5,
            'reason' => 'Reposición de almacén',
        ]);

    $response->assertOk()->assertJsonPath('data.stock', 15);
});

test('ajuste de stock no permite stock negativo', function () {
    $user = User::factory()->staff()->create();
    $product = Product::factory()->withStock(3)->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/admin/products/{$product->id}/adjust-stock", [
            'quantity' => -10,
            'reason' => 'Error',
        ]);

    $response->assertStatus(422);
});

test('el listado admin incluye productos inactivos', function () {
    $user = User::factory()->staff()->create();
    Product::factory()->create(['is_active' => true]);
    Product::factory()->inactive()->create();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/admin/products');

    $response->assertOk()->assertJsonCount(2, 'data.data');
});

test('el listado admin filtra por low_stock', function () {
    $user = User::factory()->staff()->create();
    Product::factory()->create(['stock' => 0, 'min_stock' => 5]);
    Product::factory()->create(['stock' => 50, 'min_stock' => 5]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/admin/products?low_stock=true');

    $response->assertOk()->assertJsonCount(1, 'data.data');
});

/*
|--------------------------------------------------------------------------
| Admin CRUD — categorías
|--------------------------------------------------------------------------
*/

test('un staff puede crear una categoría', function () {
    $user = User::factory()->staff()->create();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/admin/categories', [
        'name' => 'Tarjetas de Video',
        'description' => 'Hardware gráfico',
    ]);

    $response->assertStatus(201)->assertJsonPath('data.name', 'Tarjetas de Video');
});

test('un staff puede actualizar una categoría', function () {
    $user = User::factory()->staff()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->putJson("/api/v1/admin/categories/{$category->id}", [
        'name' => 'GPUs',
    ]);

    $response->assertOk()->assertJsonPath('data.name', 'GPUs');
});

test('no se elimina una categoría con productos', function () {
    $user = User::factory()->staff()->create();
    $category = Category::factory()->create();
    Product::factory()->create(['category_id' => $category->id]);

    $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/admin/categories/{$category->id}");

    $response->assertStatus(422);
});

test('se elimina una categoría vacía', function () {
    $user = User::factory()->staff()->create();
    $category = Category::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/admin/categories/{$category->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('las rutas admin de catálogo requieren staff', function () {
    $user = User::factory()->create(); // customer

    $this->actingAs($user, 'sanctum')->getJson('/api/v1/admin/products')->assertForbidden();
    $this->actingAs($user, 'sanctum')->postJson('/api/v1/admin/categories', [])->assertForbidden();
});
