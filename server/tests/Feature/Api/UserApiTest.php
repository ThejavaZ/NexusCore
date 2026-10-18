<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('el listado de usuarios requiere admin', function () {
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertForbidden();
});

test('un admin lista usuarios activos', function () {
    User::factory()->count(2)->create();
    User::factory()->inactive()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson('/api/v1/users');

    // admin + 2 users = 3 (inactive excluded)
    $response->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(3, 'data.data');
});

test('un admin crea un usuario', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'Nuevo Usuario',
            'email' => 'nuevo@nexuscore.test',
            'password' => 'Str0ng!Pass',
            'role' => 'staff',
        ]);

    $response->assertStatus(201)->assertJsonPath('data.email', 'nuevo@nexuscore.test');
    $this->assertDatabaseHas('users', ['email' => 'nuevo@nexuscore.test', 'role' => 'staff']);
});

test('crear usuario valida rol inválido', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'X',
            'email' => 'x@nexuscore.test',
            'password' => 'Str0ng!Pass',
            'role' => 'superadmin',
        ]);

    $response->assertStatus(422);
});

test('crear usuario valida email duplicado', function () {
    User::factory()->create(['email' => 'dup@nexuscore.test']);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->postJson('/api/v1/users', [
            'name' => 'X',
            'email' => 'dup@nexuscore.test',
            'password' => 'Str0ng!Pass',
            'role' => 'customer',
        ]);

    $response->assertStatus(422);
});

test('un admin ve el detalle de un usuario', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->getJson("/api/v1/users/{$user->id}");

    $response->assertOk()->assertJsonPath('data.id', $user->id);
});

test('un admin actualiza un usuario', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/v1/users/{$user->id}", [
            'name' => 'Actualizado',
            'role' => 'staff',
        ]);

    $response->assertOk()->assertJsonPath('data.name', 'Actualizado');
    $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'staff']);
});

test('un admin desactiva un usuario', function () {
    $user = User::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->admin, 'sanctum')
        ->putJson("/api/v1/users/{$user->id}", ['is_active' => false]);

    $response->assertOk();
    $this->assertDatabaseHas('users', ['id' => $user->id, 'is_active' => false]);
});

test('un admin elimina un usuario', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/v1/users/{$user->id}");

    $response->assertOk()->assertJsonPath('success', true);
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('no se puede eliminar la propia cuenta', function () {
    $response = $this->actingAs($this->admin, 'sanctum')
        ->deleteJson("/api/v1/users/{$this->admin->id}");

    $response->assertStatus(422);
    $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
});
