<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category_id',
        'stock',
        'min_stock',
        'price',
        'cost',
        'image_url',
        'is_active',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    /**
     * Un producto pertenece a una categoría.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Un pequeño "Scope" para que en el frontend de Next.js
    // solo salgan los productos que sí tienen stock
    public function scopeWithStock($query)
    {
        return $query->where('stock', '>', 0);
    }
}
