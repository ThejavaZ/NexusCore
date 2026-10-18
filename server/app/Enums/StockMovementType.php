<?php

namespace App\Enums;

enum StockMovementType: string
{
    case Purchase = 'purchase';
    case Sale = 'sale';
    case Adjustment = 'adjustment';
    case Restock = 'restock';

    public function label(): string
    {
        return match ($this) {
            self::Purchase => 'Compra',
            self::Sale => 'Venta',
            self::Adjustment => 'Ajuste',
            self::Restock => 'Reposición',
        };
    }

    public function isEntry(): bool
    {
        return in_array($this, [self::Purchase, self::Restock]);
    }
}
