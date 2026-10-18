<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RepairStatusHistory extends Model
{
    protected $fillable = [
        'repair_id',
        'status_from',
        'status_to',
        'notes',
        'changed_by',
        'email_sent',
    ];

    protected function casts(): array
    {
        return [
            'email_sent' => 'boolean',
        ];
    }

    public function repair(): BelongsTo
    {
        return $this->belongsTo(Repair::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
