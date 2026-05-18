<?php

namespace App\Http\Requests\Worker;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWorkerRequest extends FormRequest
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
        $workerId = $this->route('worker')?->id;

        return [
            'name' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($workerId)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'max:255'],
        ];
    }
}
