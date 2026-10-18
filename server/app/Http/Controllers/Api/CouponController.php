<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $coupons = Coupon::latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $coupons,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $coupon = Coupon::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Cupón creado',
            'data' => $coupon,
        ], 201);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $data = $this->validated($request, $coupon);

        $coupon->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cupón actualizado',
            'data' => $coupon,
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cupón eliminado',
        ]);
    }

    /**
     * Public — previsualiza el descuento de un cupón en el checkout.
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => 'required|string|max:40',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper(trim($data['code'])))
            ->where('is_active', true)
            ->first();

        if (! $coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Cupón no encontrado',
            ], 404);
        }

        $error = $this->unusableReason($coupon, (float) $data['subtotal']);
        if ($error !== null) {
            return response()->json([
                'success' => false,
                'message' => $error,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'code' => $coupon->code,
                'type' => $coupon->type->value,
                'value' => (float) $coupon->value,
                'discount' => $coupon->computeDiscount((float) $data['subtotal']),
            ],
        ]);
    }

    /**
     * Devuelve el motivo por el que un cupón no puede usarse, o null si es válido.
     */
    public static function unusableReason(Coupon $coupon, float $subtotal): ?string
    {
        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return 'El cupón ha expirado';
        }

        if ($coupon->usage_limit !== null && $coupon->used_count >= $coupon->usage_limit) {
            return 'El cupón ya fue agotado';
        }

        if ($coupon->min_amount !== null && $subtotal < (float) $coupon->min_amount) {
            return 'Este cupón requiere un mínimo de $'.number_format((float) $coupon->min_amount, 2);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Coupon $coupon = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:40', 'alpha_dash', $coupon ? 'unique:coupons,code,'.$coupon->id : 'unique:coupons,code'],
            'type' => 'required|in:percent,fixed',
            'value' => 'required|numeric|min:0.01',
            'min_amount' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        $data['code'] = strtoupper($data['code']);
        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
