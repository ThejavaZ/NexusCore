<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Inventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'price',
        'stock',
        'description',
    ];

    protected static function booted()
    {
        static::created(function ($inventory) {
            Log::info('Producto registrado en inventario: '.$inventory->name);
        });

        static::updated(function ($inventory) {

            if ($inventory->wasChanged('price')) {
                Log::info('Precio actualizado', [
                    'producto_id' => $inventory->id,
                    'nombre' => $inventory->name,
                    'precio_anterior' => $inventory->getOriginal('price'),
                    'precio_nuevo' => $inventory->price,
                ]);
            }
        });
    }

    public static function listar()
    {
        return self::select('id', 'name', 'category', 'price', 'stock')
            ->orderBy('name')
            ->paginate(10);
    }

    public static function actualizarPrecio(int $id, float $precio): self
    {
        $producto = self::findOrFail($id);
        $producto->price = $precio;
        $producto->save();

        return $producto;
    }

    public static function registrarRestock(int $id, int $cantidad): self
    {
        $producto = self::findOrFail($id);
        $producto->stock += $cantidad;
        $producto->save();

        return $producto;
    }

    public static function ajustarStock(int $id, int $cantidad): self
    {
        $producto = self::findOrFail($id);
        $producto->stock = $cantidad;
        $producto->save();
        Log::info('Stock ajustado manualmente: '.$producto->name.' → '.$cantidad.' unidades');

        return $producto;
    }
}
