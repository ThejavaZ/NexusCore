<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        // Solo enviamos categorías activas para el catálogo
        $categories = Category::where('is_active', true)->get(['id', 'name', 'slug']);

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
