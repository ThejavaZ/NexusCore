<?php

namespace App\Enums;

enum RepairStatus: string
{
    case Pending = 'pending';
    case Diagnosed = 'diagnosed';
    case Approved = 'approved';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendiente',
            self::Diagnosed => 'Diagnosticado',
            self::Approved => 'Aprobado',
            self::InProgress => 'En Reparación',
            self::Completed => 'Completado',
            self::Delivered => 'Entregado',
            self::Cancelled => 'Cancelado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'yellow',
            self::Diagnosed => 'blue',
            self::Approved => 'purple',
            self::InProgress => 'orange',
            self::Completed => 'green',
            self::Delivered => 'gray',
            self::Cancelled => 'red',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Delivered, self::Cancelled]);
    }
}
