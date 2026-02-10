<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'de' => $this->de?->value,
            'para' => $this->para->value,
            'user' => new UserResource($this->whenLoaded('user')),
            'user_id' => $this->user_id,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
