<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Usage: ->middleware('role:admin') or ->middleware('role:admin,staff')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $allowed = array_map(
            fn (string $role) => UserRole::from($role)->value,
            $roles
        );

        if (! in_array($user->role->value, $allowed, true)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return $next($request);
    }
}
