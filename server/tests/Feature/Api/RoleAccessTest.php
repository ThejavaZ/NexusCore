<?php

use App\Models\User;

test('un customer no puede acceder a rutas de staff', function () {
    $user = User::factory()->create(); // role: customer

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/repairs')
        ->assertForbidden();
});

test('un customer no puede acceder a gestión de usuarios', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertForbidden();
});

test('un staff sí puede acceder a reparaciones', function () {
    $user = User::factory()->staff()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/repairs')
        ->assertOk();
});

test('un staff no puede gestionar usuarios', function () {
    $user = User::factory()->staff()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertForbidden();
});

test('un admin sí puede gestionar usuarios', function () {
    $user = User::factory()->admin()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/users')
        ->assertOk();
});

test('un customer sí puede ver su propio perfil', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('user.email', $user->email);
});
