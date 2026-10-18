<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('register retorna 201 con user y access_token', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Cliente Prueba',
        'email' => 'cliente@nexuscore.test',
        'password' => 'Str0ng!Pass',
        'password_confirmation' => 'Str0ng!Pass',
    ]);

    $response
        ->assertStatus(201)
        ->assertJsonPath('user.email', 'cliente@nexuscore.test')
        ->assertJsonStructure(['user', 'access_token', 'token_type']);

    $this->assertDatabaseHas('users', ['email' => 'cliente@nexuscore.test']);
});

test('register rechaza password débil', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Cliente Prueba',
        'email' => 'cliente2@nexuscore.test',
        'password' => '123',
        'password_confirmation' => '123',
    ]);

    $response->assertStatus(422);
});

test('login retorna 200 con access_token', function () {
    $user = User::factory()->create([
        'password' => Hash::make('Str0ng!Pass'),
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'Str0ng!Pass',
    ]);

    $response
        ->assertStatus(200)
        ->assertJsonPath('user.email', $user->email)
        ->assertJsonStructure(['user', 'access_token', 'token_type']);
});

test('login rechaza credenciales incorrectas', function () {
    $user = User::factory()->create([
        'password' => Hash::make('Str0ng!Pass'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401)->assertJson(['message' => 'Credenciales incorrectas']);
});

test('login genera token Sanctum en texto plano', function () {
    $user = User::factory()->create([
        'password' => Hash::make('Str0ng!Pass'),
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'Str0ng!Pass',
    ]);

    $token = $response->json('access_token');
    expect($token)->toBeString()->not->toBeEmpty();
    $this->assertDatabaseCount('personal_access_tokens', 1);
});

test('logout revoca el token actual', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/auth/logout');

    $response->assertOk();
});

test('auth/me retorna el usuario autenticado', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/auth/me');

    $response->assertOk()->assertJsonPath('user.email', $user->email);
});
