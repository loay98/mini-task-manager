<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'status' => ['sometimes', Rule::in([TaskStatus::PENDING->value, TaskStatus::COMPLETED->value])],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
