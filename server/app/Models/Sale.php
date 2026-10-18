<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\SaleStatus;
use App\Enums\StockMovementType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $invoice_number
 * @property Carbon|null $sale_date
 * @property string $customer_name
 * @property string|null $customer_phone
 * @property string|null $customer_email
 * @property string $subtotal
 * @property string $tax_amount
 * @property string $total_amount
 * @property PaymentMethod $payment_method
 * @property SaleStatus $status
 * @property string|null $stripe_session_id
 * @property int|null $created_by
 */
class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'sale_date',
        'customer_name',
        'customer_phone',
        'customer_email',
        'subtotal',
        'tax_amount',
        'total_amount',
        'payment_method',
        'status',
        'stripe_session_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'sale_date' => 'datetime',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'payment_method' => PaymentMethod::class,
            'status' => SaleStatus::class,
        ];
    }

    /**
     * @return HasMany<SaleDetail, $this>
     */
    public function details(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function generateInvoiceNumber(): string
    {
        $lastSale = static::orderBy('id', 'desc')->first();
        $number = $lastSale ? intval(substr($lastSale->invoice_number, 4)) + 1 : 1;

        return 'INV-'.str_pad((string) $number, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Cancela una venta pendiente y devuelve el stock. Idempotente.
     */
    public function cancelAndRestore(): bool
    {
        return DB::transaction(function () {
            $sale = static::lockForUpdate()->findOrFail($this->id);

            if ($sale->status !== SaleStatus::PendingPayment) {
                return false;
            }

            $sale->status = SaleStatus::Cancelled;
            $sale->save();

            $sale->details()->with('product')->get()->each(function ($detail) use ($sale) {
                $product = Product::lockForUpdate()->find($detail->product_id);
                if (! $product) {
                    return;
                }

                $stockBefore = $product->stock;
                $product->stock += $detail->quantity;
                $product->save();

                StockMovement::create([
                    'product_id' => $product->id,
                    'type' => StockMovementType::Restock,
                    'quantity' => $detail->quantity,
                    'stock_before' => $stockBefore,
                    'stock_after' => $product->stock,
                    'unit_cost' => $product->cost,
                    'reference' => $sale->invoice_number.' (cancelado)',
                    'created_by' => $sale->created_by,
                ]);
            });

            return true;
        });
    }
}
