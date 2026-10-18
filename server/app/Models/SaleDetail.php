<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleDetail extends Model
{
    protected $fillable = [
        'sale_id',
        'inventory_id',
        'product_name',
        'unit_price',
        'quantity',
        'total_price',
    ];

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }
}
