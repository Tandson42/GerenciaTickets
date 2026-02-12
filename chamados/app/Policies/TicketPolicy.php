<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    /**
     * Anyone authenticated can view tickets list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Anyone authenticated can view a ticket.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return true;
    }

    /**
     * Anyone authenticated can create a ticket.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Only the solicitante or an admin can update a ticket.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $user->id === $ticket->solicitante_id;
    }

    /**
     * Only the solicitante or an admin can update ticket status.
     */
    public function updateStatus(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $user->id === $ticket->solicitante_id;
    }

    /**
     * Only the solicitante or an admin can delete a ticket.
     */
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $user->id === $ticket->solicitante_id;
    }
}
