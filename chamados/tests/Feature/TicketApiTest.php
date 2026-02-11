<?php

namespace Tests\Feature;

use App\Enums\TicketPrioridade;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: unauthenticated user cannot access ticket listing.
     */
    public function test_unauthenticated_user_cannot_access_tickets_listing(): void
    {
        $response = $this->getJson('/api/tickets');

        $response->assertStatus(401);
    }

    /**
     * Test: authenticated user can access ticket listing.
     */
    public function test_authenticated_user_can_access_tickets_listing(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/tickets');

        $response->assertStatus(200);
    }

    /**
     * Test: PATCH status creates a log entry and sets resolved_at when RESOLVIDO.
     */
    public function test_patch_status_creates_log_and_sets_resolved_at_when_resolvido(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        /** @var Ticket $ticket */
        $ticket = Ticket::factory()->aberto()->create([
            'solicitante_id' => $user->id,
        ]);

        // First, change to EM_ANDAMENTO
        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'status' => 'EM_ANDAMENTO',
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'EM_ANDAMENTO');

        // Verify log was created
        $this->assertDatabaseHas('ticket_logs', [
            'ticket_id' => $ticket->id,
            'de' => 'ABERTO',
            'para' => 'EM_ANDAMENTO',
            'user_id' => $user->id,
        ]);

        // Verify resolved_at is still null
        $ticket->refresh();
        $this->assertNull($ticket->resolved_at);

        // Now change to RESOLVIDO
        $response = $this->actingAs($user, 'sanctum')
            ->patchJson("/api/tickets/{$ticket->id}/status", [
                'status' => 'RESOLVIDO',
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.status', 'RESOLVIDO');

        // Verify log was created for this transition
        $this->assertDatabaseHas('ticket_logs', [
            'ticket_id' => $ticket->id,
            'de' => 'EM_ANDAMENTO',
            'para' => 'RESOLVIDO',
            'user_id' => $user->id,
        ]);

        // Verify resolved_at was set
        $ticket->refresh();
        $this->assertNotNull($ticket->resolved_at);

        // Verify total number of logs
        $this->assertCount(2, TicketLog::where('ticket_id', $ticket->id)->get());
    }

    /**
     * Test: user can create a ticket.
     */
    public function test_user_can_create_ticket(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tickets', [
                'titulo' => 'Problema no sistema de login',
                'descricao' => 'O sistema de login não está funcionando corretamente quando tento acessar.',
                'prioridade' => 'ALTA',
            ]);

        $response->assertStatus(201);
        $response->assertJsonPath('data.titulo', 'Problema no sistema de login');
        $response->assertJsonPath('data.status', 'ABERTO');
        $response->assertJsonPath('data.prioridade', 'ALTA');

        $this->assertDatabaseHas('tickets', [
            'titulo' => 'Problema no sistema de login',
            'solicitante_id' => $user->id,
        ]);
    }

    /**
     * Test: only solicitante or admin can delete a ticket.
     */
    public function test_only_solicitante_or_admin_can_delete_ticket(): void
    {
        /** @var User $owner */
        $owner = User::factory()->create(['role' => 'user']);
        /** @var User $otherUser */
        $otherUser = User::factory()->create(['role' => 'user']);
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);

        /** @var Ticket $ticket */
        $ticket = Ticket::factory()->aberto()->create([
            'solicitante_id' => $owner->id,
        ]);

        // Other user cannot delete
        $response = $this->actingAs($otherUser, 'sanctum')
            ->deleteJson("/api/tickets/{$ticket->id}");

        $response->assertStatus(403);

        // Owner can delete
        $response = $this->actingAs($owner, 'sanctum')
            ->deleteJson("/api/tickets/{$ticket->id}");

        $response->assertStatus(200);

        // Verify soft deleted
        $this->assertSoftDeleted('tickets', ['id' => $ticket->id]);

        // Create another ticket to test admin deletion
        $ticket2 = Ticket::factory()->aberto()->create([
            'solicitante_id' => $owner->id,
        ]);

        // Admin can delete
        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/tickets/{$ticket2->id}");

        $response->assertStatus(200);
        $this->assertSoftDeleted('tickets', ['id' => $ticket2->id]);
    }

    /**
     * Test: ticket listing supports filtering by status and prioridade.
     */
    public function test_ticket_listing_supports_filters(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        Ticket::factory()->aberto()->alta()->create(['solicitante_id' => $user->id]);
        Ticket::factory()->aberto()->baixa()->create(['solicitante_id' => $user->id]);
        Ticket::factory()->resolvido()->alta()->create(['solicitante_id' => $user->id]);

        // Filter by status
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/tickets?status=ABERTO');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));

        // Filter by prioridade
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/tickets?prioridade=ALTA');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));

        // Filter by both
        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/tickets?status=ABERTO&prioridade=ALTA');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /**
     * Test: ticket listing supports text search.
     */
    public function test_ticket_listing_supports_text_search(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        Ticket::factory()->create([
            'titulo' => 'Erro no módulo financeiro',
            'descricao' => 'Descrição detalhada do problema encontrado no sistema.',
            'solicitante_id' => $user->id,
        ]);

        Ticket::factory()->create([
            'titulo' => 'Solicitação de novo recurso',
            'descricao' => 'Precisamos de um novo relatório mensal completo.',
            'solicitante_id' => $user->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/tickets?busca=financeiro');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /**
     * Test: validation rules are enforced on ticket creation.
     */
    public function test_ticket_creation_validation(): void
    {
        /** @var User $user */
        $user = User::factory()->create();

        // Missing required fields
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tickets', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['titulo', 'descricao', 'prioridade']);

        // Titulo too short
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tickets', [
                'titulo' => 'Ab',
                'descricao' => 'Esta é uma descrição válida com mais de vinte caracteres.',
                'prioridade' => 'ALTA',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['titulo']);

        // Descricao too short
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/tickets', [
                'titulo' => 'Título válido para o chamado',
                'descricao' => 'Curta demais',
                'prioridade' => 'ALTA',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['descricao']);
    }
}
