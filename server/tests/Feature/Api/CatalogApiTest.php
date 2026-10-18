<?php

use App\Models\Category;
use App\Models\Product;

function makeProduct(array $overrides = []): Product
{
    $category = Category::create([
        'name' => 'Tarjetas de Video',
        'slug' => 'tarjetas-de-video',
        'description' => 'Hardware gráfico',
        'is_active' => true,
    ]);

    return Product::create(array_merge([
        'name' => 'RTX 5090',
        'slug' => 'rtx-5090',
        'description' => 'Tarjeta de video de gama alta',
        'category_id' => $category->id,
        'stock' => 5,
        'min_stock' => 2,
        'price' => 30000.00,
        'cost' => 25000.00,
        'is_active' => true,
    ], $overrides));
}

test('el catálogo público lista productos activos', function () {
    makeProduct();

    $response = $this->getJson('/api/v1/products');

    $response
        ->assertOk()
        ->assertJsonPath('data.0.name', 'RTX 5090');
});

test('el catálogo excluye productos inactivos', function () {
    makeProduct(['is_active' => false]);

    $response = $this->getJson('/api/v1/products');

    $response->assertOk()->assertJsonCount(0, 'data');
});

test('el catálogo filtra productos por categoría', function () {
    makeProduct();

    $response = $this->getJson('/api/v1/products?category_id=999');

    $response->assertOk()->assertJsonCount(0, 'data');
});

test('se muestra un producto por su slug', function () {
    makeProduct();

    $response = $this->getJson('/api/v1/products/rtx-5090');

    $response
        ->assertOk()
        ->assertJsonPath('data.name', 'RTX 5090')
        ->assertJsonPath('data.stock', 5);
});

test('un slug inexistente devuelve 404', function () {
    $response = $this->getJson('/api/v1/products/no-existe');

    $response->assertNotFound();
});

test('el catálogo devuelve categorías activas', function () {
    Category::create(['name' => 'Procesadores', 'slug' => 'procesadores', 'is_active' => true]);
    Category::create(['name' => 'Oculta', 'slug' => 'oculta', 'is_active' => false]);

    $response = $this->getJson('/api/v1/categories');

    $response->assertOk()->assertJsonCount(1, 'data');
});
