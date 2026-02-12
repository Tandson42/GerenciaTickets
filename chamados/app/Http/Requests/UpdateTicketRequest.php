<?php

namespace App\Http\Requests;

use App\Enums\TicketPrioridade;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        // If trying to update responsavel_id, only admin can do it
        if ($this->has('responsavel_id') && !auth()->user()->isAdmin()) {
            return false;
        }
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['sometimes', 'required', 'string', 'min:5', 'max:120'],
            'descricao' => ['sometimes', 'required', 'string', 'min:20'],
            'prioridade' => ['sometimes', 'required', Rule::enum(TicketPrioridade::class)],
            'responsavel_id' => ['nullable', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.min' => 'O título deve ter no mínimo 5 caracteres.',
            'titulo.max' => 'O título deve ter no máximo 120 caracteres.',
            'descricao.min' => 'A descrição deve ter no mínimo 20 caracteres.',
            'prioridade.enum' => 'A prioridade deve ser BAIXA, MEDIA ou ALTA.',
        ];
    }
}
