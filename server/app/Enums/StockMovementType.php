<?php

namespace App\Enums;

enum StockMovementType: string
{
    case Initial = 'initial';
    case Purchase = 'purchase';
    case Sale = 'sale';
    case Adjustment = 'adjustment';
    case Restock = 'restock';

    public function label(): string
    {
        return match ($this) {
            self::Initial => 'Inicial',
            self::Purchase => 'Compra',
            self::Sale => 'Venta',
            self::Adjustment => 'Ajuste',
            self::Restock => 'Reposición',
        };
    }

    public function isEntry(): bool
    {
        return in_array($this, [self::Initial, self::Purchase, self::Restock]);
    }
}
