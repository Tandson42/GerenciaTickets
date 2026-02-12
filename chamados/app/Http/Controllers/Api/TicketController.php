<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Http\Requests\UpdateTicketStatusRequest;
use App\Http\Resources\TicketResource;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketController extends Controller
{
    public function __construct(
        private readonly TicketService $ticketService
    ) {}

    /**
     * GET /api/tickets
     * List tickets with filters: status, prioridade, busca (text search).
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ticket::class);

        $filters = $request->only(['status', 'prioridade', 'busca', 'per_page']);
        $tickets = $this->ticketService->list($filters);

        return TicketResource::collection($tickets);
    }

    /**
     * POST /api/tickets
     * Create a new ticket.
     */
    public function store(StoreTicketRequest $request): JsonResponse
    {
        $this->authorize('create', Ticket::class);

        $ticket = $this->ticketService->create(
            $request->validated(),
            $request->user()
        );

        $ticket->load(['solicitante', 'responsavel']);

        return (new TicketResource($ticket))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/tickets/{ticket}
     * Show a single ticket.
     */
    public function show(Ticket $ticket): TicketResource
    {
        $this->authorize('view', $ticket);

        $ticket->load(['solicitante', 'responsavel', 'logs.user']);

        return new TicketResource($ticket);
    }

    /**
     * PUT/PATCH /api/tickets/{ticket}
     * Update a ticket (titulo, descricao, prioridade, responsavel_id).
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket): TicketResource
    {
        $this->authorize('update', $ticket);

        $ticket = $this->ticketService->update($ticket, $request->validated());
        $ticket->load(['solicitante', 'responsavel']);

        return new TicketResource($ticket);
    }

    /**
     * DELETE /api/tickets/{ticket}
     * Soft delete a ticket.
     */
    public function destroy(Ticket $ticket): JsonResponse
    {
        $this->authorize('delete', $ticket);

        $this->ticketService->delete($ticket);

        return response()->json([
            'message' => 'Chamado excluído com sucesso.',
        ]);
    }

    /**
     * PATCH /api/tickets/{ticket}/status
     * Update only the status and create a log entry.
     */
    public function updateStatus(UpdateTicketStatusRequest $request, Ticket $ticket): TicketResource
    {
        $this->authorize('updateStatus', $ticket);

        $novoStatus = TicketStatus::from($request->validated('status'));

        $ticket = $this->ticketService->updateStatus(
            $ticket,
            $novoStatus,
            $request->user()
        );

        $ticket->load(['solicitante', 'responsavel', 'logs.user']);

        return new TicketResource($ticket);
    }
}
