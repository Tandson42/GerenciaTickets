<?php

namespace App\Http\Requests;

use App\Enums\TicketPrioridade;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'min:5', 'max:120'],
            'descricao' => ['required', 'string', 'min:20'],
            'prioridade' => ['required', Rule::enum(TicketPrioridade::class)],
            'responsavel_id' => ['nullable', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'O título é obrigatório.',
            'titulo.min' => 'O título deve ter no mínimo 5 caracteres.',
            'titulo.max' => 'O título deve ter no máximo 120 caracteres.',
            'descricao.required' => 'A descrição é obrigatória.',
            'descricao.min' => 'A descrição deve ter no mínimo 20 caracteres.',
            'prioridade.required' => 'A prioridade é obrigatória.',
            'prioridade.enum' => 'A prioridade deve ser BAIXA, MEDIA ou ALTA.',
        ];
    }
}
