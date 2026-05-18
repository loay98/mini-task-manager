<?php

namespace App\Http\Requests\Task;

use App\Enums\TaskStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexTaskRequest extends FormRequest
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
            'search' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', Rule::in([TaskStatus::PENDING->value, TaskStatus::COMPLETED->value])],
            'assignee_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'assigned_by' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['sometimes', 'nullable', Rule::in(['id', 'title', 'created_at', 'updated_at', 'due_date'])],
            'sort_order' => ['sometimes', 'nullable', Rule::in(['asc', 'desc'])],
        ];
    }
}
