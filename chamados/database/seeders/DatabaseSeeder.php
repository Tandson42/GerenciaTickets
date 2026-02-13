<?php

namespace Database\Seeders;

use App\Enums\TicketPrioridade;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;


class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        // Create regular user
        $user = User::factory()->create([
            'name' => 'Usuário Comum',
            'email' => 'user@example.com',
            'password' => 'password123',
            'role' => 'user',
        ]);

        $users = [$admin, $user];

        // Create 10 sample tickets with varied statuses and priorities
        $statuses = TicketStatus::cases();
        $prioridades = TicketPrioridade::cases();

        for ($i = 0; $i < 10; $i++) {
            $status = $statuses[$i % count($statuses)];
            $prioridade = $prioridades[$i % count($prioridades)];
            $solicitante = $users[$i % 2];
            $responsavel = $i > 3 ? $users[($i + 1) % 2] : null;

            Ticket::factory()->create([
                'status' => $status,
                'prioridade' => $prioridade,
                'solicitante_id' => $solicitante->id,
                'responsavel_id' => $responsavel?->id,
                'resolved_at' => $status === TicketStatus::RESOLVIDO ? now() : null,
            ]);
        }
    }
}
