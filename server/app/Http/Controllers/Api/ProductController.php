<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Traemos productos activos con su categoría
        // Agregamos un pequeño filtro opcional por categoría
        $query = Product::with('category:id,name')->where('is_active', true);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $products = $query->get();

        return response()->json([
            'success' => true,
            'count' => $products->count(),
            'data' => $products,
        ]);
    }

    public function show($slug): JsonResponse
    {
        $product = Product::with('category')->where('slug', $slug)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }
}
