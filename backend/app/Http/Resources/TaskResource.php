<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $this->status,
            'assignee_id' => $this->assignee_id,
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
