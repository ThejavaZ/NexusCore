<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RepairStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = [

        'repair_id',
        'status_from',
        'status_to',
        'notes',
        'changed_by',
        'email_sent',
    ];

    protected $casts = [
        'email_sent' => 'boolean',
    ];

    public function repair()
    {
        return $this->belongsTo(Repair::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
