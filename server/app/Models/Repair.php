<?php

namespace App\Models;

use App\Enums\RepairStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $repair_number
 * @property int|null $user_id
 * @property string $customer_name
 * @property string|null $customer_email
 * @property string|null $customer_phone
 * @property string $device_type
 * @property string $brand
 * @property string $model
 * @property string $serial_number
 * @property string $issue_description
 * @property string|null $technician_notes
 * @property float|null $estimated_cost
 * @property float|null $final_cost
 * @property RepairStatus $status
 * @property Carbon|null $received_at
 * @property Carbon|null $estimated_delivery
 * @property Carbon|null $delivered_at
 * @property int|null $assigned_to
 * @property bool $customer_notified
 * @property Carbon|null $last_notification_at
 */
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

    protected function casts(): array
    {
        return [
            'status' => RepairStatus::class,
            'received_at' => 'date',
            'estimated_delivery' => 'date',
            'delivered_at' => 'date',
            'last_notification_at' => 'datetime',
            'customer_notified' => 'boolean',
            'estimated_cost' => 'decimal:2',
            'final_cost' => 'decimal:2',
        ];
    }

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

    public function scopeByStatus(Builder $query, RepairStatus $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', RepairStatus::Pending);
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->whereIn('status', [
            RepairStatus::Diagnosed,
            RepairStatus::Approved,
            RepairStatus::InProgress,
        ]);
    }

    public static function generateRepairNumber(): string
    {
        $lastRepair = static::withTrashed()->orderBy('id', 'desc')->first();
        $number = $lastRepair ? intval(substr($lastRepair->repair_number, 4)) + 1 : 1;

        return 'RRP-'.str_pad((string) $number, 5, '0', STR_PAD_LEFT);
    }
}
