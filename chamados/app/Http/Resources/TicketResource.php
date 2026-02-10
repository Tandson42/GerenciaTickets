<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'prioridade' => $this->prioridade->value,
            'prioridade_label' => $this->prioridade->label(),
            'solicitante' => new UserResource($this->whenLoaded('solicitante')),
            'responsavel' => new UserResource($this->whenLoaded('responsavel')),
            'resolved_at' => $this->resolved_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'logs' => TicketLogResource::collection($this->whenLoaded('logs')),
        ];
    }
}
