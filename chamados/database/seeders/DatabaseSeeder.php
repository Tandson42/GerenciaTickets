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
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create regular user
        $user = User::create([
            'name' => 'Usuário Comum',
            'email' => 'user@example.com',
            'password' => 'password123',
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $users = [$admin, $user];

        // Sample ticket data (no Faker dependency needed)
        $ticketData = [
            ['titulo' => 'Erro ao acessar o sistema',          'descricao' => 'Ao tentar fazer login, o sistema retorna uma página em branco. O problema ocorre em todos os navegadores testados.'],
            ['titulo' => 'Solicitação de novo recurso',         'descricao' => 'Seria útil ter um botão de exportação para PDF na listagem de chamados, facilitando o envio de relatórios.'],
            ['titulo' => 'Lentidão no carregamento',            'descricao' => 'As páginas estão demorando mais de 10 segundos para carregar, especialmente a tela de listagem de tickets.'],
            ['titulo' => 'Problema com permissões de usuário',  'descricao' => 'Usuários com perfil comum estão conseguindo acessar áreas restritas do painel administrativo.'],
            ['titulo' => 'Erro no envio de notificações',       'descricao' => 'As notificações por email não estão sendo enviadas quando um chamado é resolvido.'],
            ['titulo' => 'Atualização de dados cadastrais',     'descricao' => 'Preciso atualizar o email associado à minha conta, mas não encontro a opção nas configurações.'],
            ['titulo' => 'Bug no filtro de prioridade',         'descricao' => 'Ao selecionar o filtro de prioridade alta, o sistema exibe também os chamados de prioridade baixa.'],
            ['titulo' => 'Integração com sistema externo',      'descricao' => 'Necessitamos de uma integração com o sistema de RH para automatizar a criação de chamados de novos colaboradores.'],
            ['titulo' => 'Melhoria na interface mobile',        'descricao' => 'A interface no celular apresenta botões sobrepostos e texto cortado na tela de detalhes do chamado.'],
            ['titulo' => 'Relatório mensal de chamados',        'descricao' => 'Precisamos de um relatório mensal automático com estatísticas de chamados abertos, resolvidos e tempo médio de resolução.'],
        ];

        // Create 10 sample tickets with varied statuses and priorities
        $statuses = TicketStatus::cases();
        $prioridades = TicketPrioridade::cases();

        for ($i = 0; $i < 10; $i++) {
            $status = $statuses[$i % count($statuses)];
            $prioridade = $prioridades[$i % count($prioridades)];
            $solicitante = $users[$i % 2];
            $responsavel = $i > 3 ? $users[($i + 1) % 2] : null;

            Ticket::create([
                'titulo' => $ticketData[$i]['titulo'],
                'descricao' => $ticketData[$i]['descricao'],
                'status' => $status,
                'prioridade' => $prioridade,
                'solicitante_id' => $solicitante->id,
                'responsavel_id' => $responsavel?->id,
                'resolved_at' => $status === TicketStatus::RESOLVIDO ? now() : null,
            ]);
        }
    }
}
