<?php

use App\Models\Repair;
use App\Models\User;
use App\Services\EmailApiService;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->mock(EmailApiService::class, function ($mock) {
        $mock->shouldReceive('sendRegistrationEmail')->andReturn(['success' => true, 'message' => 'ok']);
        $mock->shouldReceive('sendStatusChangeEmail')->andReturn(['success' => true, 'message' => 'ok']);
    });
});

test('se puede registrar una reparación válida', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/repairs', [
            'customer_name' => 'Ramón Viera',
            'customer_email' => 'ramon@nexuscore.test',
            'customer_phone' => '6621234567',
            'device_type' => 'Laptop',
            'brand' => 'Dell',
            'model' => 'Inspiron 15',
            'serial_number' => 'SN-00000001',
            'issue_description' => 'No enciende',
            'estimated_cost' => 500.00,
        ]);

    $response
        ->assertStatus(201)
        ->assertJsonPath('repair.status', 'pending');

    $this->assertDatabaseHas('repairs', [
        'customer_email' => 'ramon@nexuscore.test',
        'status' => 'pending',
    ]);
});

test('registro de reparación valida datos obligatorios', function () {
    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson('/api/v1/repairs', [
            'customer_email' => 'correo-invalido',
            'device_type' => '',
        ]);

    $response->assertStatus(422);
});

test('el número de reparación se genera secuencialmente', function () {
    Repair::factory()->create(['repair_number' => 'RRP-00042']);

    expect(Repair::generateRepairNumber())->toBe('RRP-00043');
});

test('se puede listar reparaciones', function () {
    Repair::factory()->count(3)->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/repairs');

    $response->assertOk();
});

test('las reparaciones se filtran por estado', function () {
    Repair::factory()->pending()->count(2)->create();
    Repair::factory()->completed()->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->getJson('/api/v1/repairs?status=pending');

    $response->assertOk();
});

test('cambiar estado genera historial', function () {
    $repair = Repair::factory()->pending()->create();

    $response = $this->actingAs($this->user, 'sanctum')
        ->postJson("/api/v1/repairs/{$repair->id}/change-status", [
            'status' => 'diagnosed',
            'notes' => 'Diagnóstico completado',
        ]);

    $response->assertOk()->assertJsonPath('repair.status', 'diagnosed');

    $this->assertDatabaseHas('repair_status_histories', [
        'repair_id' => $repair->id,
        'status_to' => 'diagnosed',
    ]);
});

test('el listado de reparaciones requiere autenticación', function () {
    $response = $this->getJson('/api/v1/repairs');

    $response->assertUnauthorized();
});
