<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    /**
     * Stock movement history — paginated, filterable (admin/staff).
     */
    public function index(Request $request): JsonResponse
    {
        $query = StockMovement::with(['product:id,name,slug', 'creator:id,name'])
            ->latest('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $movements = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $movements,
        ]);
    }
}
