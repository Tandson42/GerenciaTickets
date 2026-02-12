<?php

use App\Models\Ticket;
use App\Models\TicketLog;
use App\Models\User;

test('unauthenticated user cannot access tickets listing', function () {
    $response = $this->getJson('/api/tickets');

    $response->assertStatus(401);
});

test('authenticated user can access tickets listing', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/tickets');

    $response->assertStatus(200);
});

test('patch status creates log and sets resolved_at when resolvido', function () {
    $user = User::factory()->create();
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
    expect($ticket->resolved_at)->toBeNull();

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
    expect($ticket->resolved_at)->not->toBeNull();

    // Verify total number of logs
    expect(TicketLog::where('ticket_id', $ticket->id)->count())->toBe(2);
});

test('user can create a ticket', function () {
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
});

test('only solicitante or admin can delete ticket', function () {
    $owner = User::factory()->create(['role' => 'user']);
    $otherUser = User::factory()->create(['role' => 'user']);
    $admin = User::factory()->create(['role' => 'admin']);

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
});

test('ticket listing supports filters', function () {
    $user = User::factory()->create();

    Ticket::factory()->aberto()->alta()->create(['solicitante_id' => $user->id]);
    Ticket::factory()->aberto()->baixa()->create(['solicitante_id' => $user->id]);
    Ticket::factory()->resolvido()->alta()->create(['solicitante_id' => $user->id]);

    // Filter by status
    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/tickets?status=ABERTO');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(2);

    // Filter by prioridade
    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/tickets?prioridade=ALTA');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(2);

    // Filter by both
    $response = $this->actingAs($user, 'sanctum')
        ->getJson('/api/tickets?status=ABERTO&prioridade=ALTA');

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1);
});

test('ticket listing supports text search', function () {
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
    expect($response->json('data'))->toHaveCount(1);
});

test('ticket creation validation', function () {
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
});
