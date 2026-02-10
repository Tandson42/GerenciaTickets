<?php

namespace Database\Factories;

use App\Enums\TicketPrioridade;
use App\Enums\TicketStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TicketFactory extends Factory
{
    public function definition(): array
    {
        $status = fake()->randomElement(TicketStatus::cases());

        return [
            'titulo' => fake()->sentence(rand(3, 8)),
            'descricao' => fake()->paragraph(rand(2, 5)),
            'status' => $status,
            'prioridade' => fake()->randomElement(TicketPrioridade::cases()),
            'solicitante_id' => User::factory(),
            'responsavel_id' => fake()->boolean(60) ? User::factory() : null,
            'resolved_at' => $status === TicketStatus::RESOLVIDO ? fake()->dateTimeBetween('-30 days', 'now') : null,
        ];
    }

    public function aberto(): static
    {
        return $this->state(fn () => [
            'status' => TicketStatus::ABERTO,
            'resolved_at' => null,
        ]);
    }

    public function emAndamento(): static
    {
        return $this->state(fn () => [
            'status' => TicketStatus::EM_ANDAMENTO,
            'resolved_at' => null,
        ]);
    }

    public function resolvido(): static
    {
        return $this->state(fn () => [
            'status' => TicketStatus::RESOLVIDO,
            'resolved_at' => now(),
        ]);
    }

    public function alta(): static
    {
        return $this->state(fn () => [
            'prioridade' => TicketPrioridade::ALTA,
        ]);
    }

    public function media(): static
    {
        return $this->state(fn () => [
            'prioridade' => TicketPrioridade::MEDIA,
        ]);
    }

    public function baixa(): static
    {
        return $this->state(fn () => [
            'prioridade' => TicketPrioridade::BAIXA,
        ]);
    }
}
