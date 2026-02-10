<?php

namespace App\Models;

use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'de',
        'para',
        'user_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'de' => TicketStatus::class,
            'para' => TicketStatus::class,
            'created_at' => 'datetime',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
