<?php

namespace App\Http\Controllers\Api;

use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Public catalog — active products only, paginated.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category:id,name,slug')
            ->where('is_active', true)
            ->orderByDesc('id');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"));
        }

        $products = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Admin/staff product list — includes inactive, paginated.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Product::with('category:id,name,slug')->orderByDesc('id');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->boolean('low_stock')) {
            $query->whereColumn('stock', '<=', 'min_stock');
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $products = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Public product detail by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $product = Product::with('category')->where('slug', $slug)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * Admin/staff product detail by ID.
     */
    public function showById(Product $product): JsonResponse
    {
        $product->load('category');

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:50|unique:products,sku',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'cost' => 'required|numeric|min:0',
            'image_url' => 'nullable|url|max:2048',
            'is_active' => 'boolean',
        ]);

        $data['slug'] = Str::slug($data['name']).'-'.Str::lower(Str::random(6));
        $data['is_active'] = $data['is_active'] ?? true;

        $product = Product::create($data);

        StockMovement::create([
            'product_id' => $product->id,
            'type' => StockMovementType::Initial,
            'quantity' => $product->stock,
            'stock_before' => 0,
            'stock_after' => $product->stock,
            'unit_cost' => $product->cost,
            'reference' => 'Producto creado',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'data' => $product,
        ], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => "sometimes|string|max:50|unique:products,sku,{$product->id}",
            'description' => 'nullable|string',
            'category_id' => 'sometimes|exists:categories,id',
            'min_stock' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'cost' => 'sometimes|numeric|min:0',
            'image_url' => 'nullable|url|max:2048',
            'is_active' => 'sometimes|boolean',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']).'-'.Str::lower(Str::random(6));
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'data' => $product->fresh('category'),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Producto desactivado exitosamente',
        ]);
    }

    /**
     * Manual stock adjustment (admin/staff).
     */
    public function adjustStock(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'quantity' => 'required|integer|not_in:0',
            'reason' => 'required|string|max:255',
        ]);

        $newStock = $product->stock + $data['quantity'];

        if ($newStock < 0) {
            return response()->json([
                'success' => false,
                'message' => "Stock insuficiente. Stock actual: {$product->stock}",
            ], 422);
        }

        $stockBefore = $product->stock;
        $product->stock = $newStock;
        $product->save();

        StockMovement::create([
            'product_id' => $product->id,
            'type' => StockMovementType::Adjustment,
            'quantity' => $data['quantity'],
            'stock_before' => $stockBefore,
            'stock_after' => $newStock,
            'unit_cost' => $product->cost,
            'reference' => $data['reason'],
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock ajustado exitosamente',
            'data' => $product->fresh(),
        ]);
    }
}
