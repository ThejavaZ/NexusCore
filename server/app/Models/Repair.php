<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Repair extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'repair_number',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'device_type',
        'brand',
        'model',
        'serial_number',
        'issue_description',
        'technician_notes',
        'estimated_cost',
        'final_cost',
        'status',
        'received_at',
        'estimated_delivery',
        'delivered_at',
        'assigned_to',
        'customer_notified',
        'last_notification_at',
    ];

    protected $casts = [
        'received_at' => 'date',
        'estimated_delivery' => 'date',
        'delivered_at' => 'date',
        'last_notification_at' => 'datetime',
        'customer_notified' => 'boolean',
        'estimated_cost' => 'decimal:2',
        'final_cost' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(RepairStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->whereIn('status', ['diagnosed', 'approved', 'in_progress']);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Pendiente',
            'diagnosed' => 'Diagnosticado',
            'approved' => 'Aprobado',
            'in_progress' => 'En Reparación',
            'completed' => 'Completado',
            'delivered' => 'Entregado',
            'cancelled' => 'Cancelado',
            default => 'Desconocido',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'yellow',
            'diagnosed' => 'blue',
            'approved' => 'purple',
            'in_progress' => 'orange',
            'completed' => 'green',
            'delivered' => 'gray',
            'cancelled' => 'red',
            default => 'gray',
        };
    }

    public static function generateRepairNumber(): string
    {
        $lastRepair = static::withTrashed()->orderBy('id', 'desc')->first();
        $number = $lastRepair ? intval(substr($lastRepair->repair_number, 4)) + 1 : 1;

        return 'RRP-'.str_pad((string) $number, 5, '0', STR_PAD_LEFT);
    }
}
