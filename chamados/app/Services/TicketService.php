<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketLog;
use App\Models\User;
use App\Notifications\TicketResolvedNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TicketService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Ticket::with(['solicitante', 'responsavel']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['prioridade'])) {
            $query->where('prioridade', $filters['prioridade']);
        }

        if (!empty($filters['busca'])) {
            $busca = $filters['busca'];
            $query->where(function ($q) use ($busca) {
                $q->where('titulo', 'like', "%{$busca}%")
                  ->orWhere('descricao', 'like', "%{$busca}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function create(array $data, User $solicitante): Ticket
    {
        $data['solicitante_id'] = $solicitante->id;
        $data['status'] = TicketStatus::ABERTO->value;

        return Ticket::create($data);
    }

    public function update(Ticket $ticket, array $data): Ticket
    {
        // Prevent non-admin users from updating responsavel_id
        if (isset($data['responsavel_id']) && !auth()->user()->isAdmin()) {
            unset($data['responsavel_id']);
        }

        $ticket->update($data);
        return $ticket->fresh();
    }

    public function updateStatus(Ticket $ticket, TicketStatus $novoStatus, User $user): Ticket
    {
        return DB::transaction(function () use ($ticket, $novoStatus, $user) {
            $statusAnterior = $ticket->status;

            $updateData = ['status' => $novoStatus];

            if ($novoStatus === TicketStatus::RESOLVIDO) {
                $updateData['resolved_at'] = now();
            } elseif ($statusAnterior === TicketStatus::RESOLVIDO) {
                $updateData['resolved_at'] = null;
            }

            $ticket->update($updateData);

            TicketLog::create([
                'ticket_id' => $ticket->id,
                'de' => $statusAnterior->value,
                'para' => $novoStatus->value,
                'user_id' => $user->id,
                'created_at' => now(),
            ]);

            // Bonus: dispatch notification when resolved
            if ($novoStatus === TicketStatus::RESOLVIDO) {
                $ticket->solicitante->notify(new TicketResolvedNotification($ticket));
            }

            return $ticket->fresh();
        });
    }

    public function delete(Ticket $ticket): bool
    {
        return $ticket->delete();
    }
}
