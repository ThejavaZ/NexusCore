<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentMethod;
use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Sale::with('details')->latest('sale_date');

        if ($request->filled('from')) {
            $query->where('sale_date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->where('sale_date', '<=', $request->date('to')->endOfDay());
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->string('payment_method'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(fn ($q) => $q
                ->where('invoice_number', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%"));
        }

        $sales = $query->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $sales,
        ]);
    }

    public function show(Sale $sale): JsonResponse
    {
        $sale->load('details');

        return response()->json([
            'success' => true,
            'data' => $sale,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_email' => 'nullable|email',
            'payment_method' => 'required|in:cash,card,transfer',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            $sale = DB::transaction(function () use ($data) {
                $items = collect($data['items'])->map(function ($item) {
                    $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                    if ($product->stock < $item['quantity']) {
                        throw new \RuntimeException("Stock insuficiente para {$product->name}");
                    }

                    return [
                        'product' => $product,
                        'quantity' => $item['quantity'],
                        'unit_price' => $product->price,
                    ];
                });

                $subtotal = $items->sum(fn ($i) => $i['quantity'] * $i['unit_price']);
                $taxAmount = $subtotal * 0.16;
                $totalAmount = $subtotal + $taxAmount;

                $sale = Sale::create([
                    'invoice_number' => Sale::generateInvoiceNumber(),
                    'sale_date' => now(),
                    'customer_name' => $data['customer_name'],
                    'customer_phone' => $data['customer_phone'] ?? null,
                    'customer_email' => $data['customer_email'] ?? null,
                    'subtotal' => $subtotal,
                    'tax_amount' => $taxAmount,
                    'total_amount' => $totalAmount,
                    'payment_method' => PaymentMethod::from($data['payment_method']),
                    'created_by' => auth()->id(),
                ]);

                foreach ($items as $item) {
                    $product = $item['product'];
                    $stockBefore = $product->stock;
                    $product->stock -= $item['quantity'];
                    $product->save();

                    $sale->details()->create([
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'unit_price' => $item['unit_price'],
                        'quantity' => $item['quantity'],
                        'total_price' => $item['quantity'] * $item['unit_price'],
                    ]);

                    StockMovement::create([
                        'product_id' => $product->id,
                        'type' => StockMovementType::Sale,
                        'quantity' => -$item['quantity'],
                        'stock_before' => $stockBefore,
                        'stock_after' => $product->stock,
                        'unit_cost' => $product->cost,
                        'reference' => $sale->invoice_number,
                        'created_by' => auth()->id(),
                    ]);
                }

                return $sale;
            });

            return response()->json([
                'success' => true,
                'message' => 'Venta registrada exitosamente',
                'data' => $sale->load('details'),
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al crear venta', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar la venta',
            ], 500);
        }
    }

    /**
     * Dashboard summary — totals, counts, top products.
     */
    public function summary(): JsonResponse
    {
        $todaySales = Sale::whereDate('sale_date', today())->count();
        $todayRevenue = Sale::whereDate('sale_date', today())->sum('total_amount');
        $monthRevenue = Sale::whereMonth('sale_date', now()->month)
            ->whereYear('sale_date', now()->year)
            ->sum('total_amount');
        $totalSales = Sale::count();

        $topProducts = DB::table('sale_details')
            ->selectRaw('product_name, SUM(quantity) as total_qty, SUM(total_price) as total_revenue')
            ->groupBy('product_name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'today_sales' => $todaySales,
                'today_revenue' => (float) $todayRevenue,
                'month_revenue' => (float) $monthRevenue,
                'total_sales' => $totalSales,
                'top_products' => $topProducts,
            ],
        ]);
    }

    /**
     * Revenue chart data grouped by date.
     */
    public function chart(): JsonResponse
    {
        $sales = DB::table('sales')
            ->selectRaw('DATE(sale_date) as date, COUNT(*) as total, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sales,
        ]);
    }
}
