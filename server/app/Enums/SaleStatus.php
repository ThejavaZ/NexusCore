<?php

namespace App\Enums;

enum SaleStatus: string
{
    case PendingPayment = 'pending_payment';
    case Paid = 'paid';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::PendingPayment => 'Pendiente de pago',
            self::Paid => 'Pagado',
            self::Cancelled => 'Cancelado',
        };
    }
}
