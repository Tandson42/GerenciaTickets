<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketResolvedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Ticket $ticket
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Chamado #{$this->ticket->id} foi resolvido")
            ->greeting("Olá, {$notifiable->name}!")
            ->line("O chamado \"{$this->ticket->titulo}\" foi marcado como resolvido.")
            ->line("Resolvido em: {$this->ticket->resolved_at->format('d/m/Y H:i')}")
            ->line('Obrigado por utilizar nosso sistema de chamados!');
    }
}
