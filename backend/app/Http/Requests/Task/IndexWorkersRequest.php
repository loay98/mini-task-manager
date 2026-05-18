<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class IndexWorkersRequest extends FormRequest
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
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['sometimes', 'nullable', 'in:id,name,created_at'],
            'sort_order' => ['sometimes', 'nullable', 'in:asc,desc'],
        ];
    }
}
