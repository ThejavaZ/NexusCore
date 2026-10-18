<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::where('is_active', true)->paginate(15);

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,staff,customer',
        ]);

        $data['password'] = bcrypt($data['password']);
        $data['is_active'] = true;

        $user = User::create($data);

        return response()->json(['user' => $user], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(['user' => $user]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => "sometimes|email|max:255|unique:users,email,{$user->id}",
            'role' => 'sometimes|in:admin,staff,customer',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($data);

        return response()->json(['user' => $user]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'Usuario eliminado exitosamente']);
    }
}
