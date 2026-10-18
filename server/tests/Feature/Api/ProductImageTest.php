<?php

use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
    $this->customer = User::factory()->create();
    $this->product = Product::factory()->create(['image_url' => null]);
});

test('subir imagen requiere autenticación', function () {
    $this->postJson("/api/v1/admin/products/{$this->product->id}/image")
        ->assertUnauthorized();
});

test('clientes no pueden subir imágenes', function () {
    $this->actingAs($this->customer, 'sanctum')
        ->postJson("/api/v1/admin/products/{$this->product->id}/image")
        ->assertForbidden();
});

test('admin sube imagen de producto', function () {
    Storage::fake('public');

    $response = $this->actingAs($this->admin, 'sanctum')
        ->post("/api/v1/admin/products/{$this->product->id}/image", [
            'image' => UploadedFile::fake()->image('producto.jpg', 400, 400),
        ], ['Accept' => 'application/json']);

    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.image_url', fn ($url) => str_starts_with($url, '/storage/products/'));

    Storage::disk('public')->assertExists(
        str_replace('/storage/', '', $response->json('data.image_url'))
    );
});

test('subir imagen valida formato y tamaño', function () {
    Storage::fake('public');

    $this->actingAs($this->admin, 'sanctum')
        ->post("/api/v1/admin/products/{$this->product->id}/image", [
            'image' => UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('image');

    $this->actingAs($this->admin, 'sanctum')
        ->post("/api/v1/admin/products/{$this->product->id}/image", [
            'image' => UploadedFile::fake()->image('grande.jpg')->size(3000),
        ], ['Accept' => 'application/json'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('image');
});

test('subir imagen reemplaza la anterior y borra el archivo', function () {
    Storage::fake('public');

    $oldPath = UploadedFile::fake()->image('vieja.jpg')->store('products', 'public');
    $this->product->update(['image_url' => '/storage/'.$oldPath]);

    $this->actingAs($this->admin, 'sanctum')
        ->post("/api/v1/admin/products/{$this->product->id}/image", [
            'image' => UploadedFile::fake()->image('nueva.jpg'),
        ], ['Accept' => 'application/json'])
        ->assertOk();

    Storage::disk('public')->assertMissing($oldPath);
    $this->assertNotSame('/storage/'.$oldPath, $this->product->fresh()->image_url);
});

test('admin elimina imagen de producto', function () {
    Storage::fake('public');

    $path = UploadedFile::fake()->image('foto.jpg')->store('products', 'public');
    $this->product->update(['image_url' => '/storage/'.$path]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/v1/admin/products/{$this->product->id}/image");

    $response->assertOk()->assertJsonPath('data.image_url', null);
    Storage::disk('public')->assertMissing($path);
});
