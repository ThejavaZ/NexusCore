<?php

use App\Models\User;
use App\Services\EmailApiService;

beforeEach(function () {
    $this->user = User::factory()->staff()->create();
    $this->mock(EmailApiService::class, function ($mock) {
        $mock->shouldReceive('sendWelcomeEmail')->andReturn(['success' => true, 'message' => 'ok']);
        $mock->shouldReceive('sendOrderConfirmation')->andReturn(['success' => true, 'message' => 'ok']);
        $mock->shouldReceive('sendInvoiceEmail')->andReturn(['success' => true, 'message' => 'ok']);
    });
});

test('las notificaciones requieren autenticación', function () {
    $this->postJson('/api/v1/notifications/welcome', [
        'email' => 'test@nexuscore.test',
        'name' => 'Test',
    ])->assertUnauthorized();
});

test('las notificaciones requieren rol staff', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer, 'sanctum')
        ->postJson('/api/v1/notifications/welcome', [
            'email' => 'test@nexuscore.test',
            'name' => 'Test',
        ])
        ->assertForbidden();
});

test('send welcome valida datos requeridos', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/notifications/welcome', [
            'email' => 'invalid',
        ]);

    $response->assertStatus(422);
});

test('send welcome funciona con datos válidos', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/notifications/welcome', [
            'email' => 'test@nexuscore.test',
            'name' => 'Test User',
        ]);

    $response->assertOk();
});

test('send order confirmation valida items', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/notifications/order-confirmation', [
            'email' => 'test@nexuscore.test',
            'order_number' => 'INV-001',
            'total' => 500,
            'items' => [],
        ]);

    $response->assertStatus(422);
});

test('send order confirmation funciona', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/notifications/order-confirmation', [
            'email' => 'test@nexuscore.test',
            'order_number' => 'INV-001',
            'total' => 500,
            'items' => [
                ['name' => 'Producto', 'quantity' => 1, 'price' => 500],
            ],
        ]);

    $response->assertOk();
});

test('send invoice funciona', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/notifications/invoice', [
            'email' => 'test@nexuscore.test',
            'invoice_number' => 'INV-001',
            'date' => '2026-01-01',
            'total' => 580,
        ]);

    $response->assertOk();
});
