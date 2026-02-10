<?php

namespace App\Enums;

enum TicketStatus: string
{
    case ABERTO = 'ABERTO';
    case EM_ANDAMENTO = 'EM_ANDAMENTO';
    case RESOLVIDO = 'RESOLVIDO';

    public function label(): string
    {
        return match ($this) {
            self::ABERTO => 'Aberto',
            self::EM_ANDAMENTO => 'Em Andamento',
            self::RESOLVIDO => 'Resolvido',
        };
    }
}
