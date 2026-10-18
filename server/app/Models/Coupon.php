<?php

namespace App\Models;

use App\Enums\CouponType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $code
 * @property CouponType $type
 * @property string $value
 * @property string|null $min_amount
 * @property bool $is_active
 * @property Carbon|null $expires_at
 * @property int|null $usage_limit
 * @property int $used_count
 */
class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_amount',
        'is_active',
        'expires_at',
        'usage_limit',
        'used_count',
    ];

    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'decimal:2',
            'min_amount' => 'decimal:2',
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
        ];
    }

    /**
     * @return HasMany<Sale, $this>
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function computeDiscount(float $subtotal): float
    {
        $discount = $this->type === CouponType::Percent
            ? $subtotal * (float) $this->value / 100
            : min((float) $this->value, $subtotal);

        return round($discount, 2);
    }
}
