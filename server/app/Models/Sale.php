<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
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
    ];

    public function details(): HasMany
    {
        return $this->hasMany(SaleDetail::class);
    }

    public static function generateInvoiceNumber(): string
    {
        $lastSale = static::orderBy('id', 'desc')->first();
        $number = $lastSale ? intval(substr($lastSale->invoice_number, 4)) + 1 : 1;

        return 'INV-'.str_pad((string) $number, 5, '0', STR_PAD_LEFT);
    }
}
