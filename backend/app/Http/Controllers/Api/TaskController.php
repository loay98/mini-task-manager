<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class TaskController extends BaseApiController
{
    public function workers()
    {
        $workers = User::query()
            ->where('role', UserRole::WORKER->value)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return $this->success($workers, 'Workers fetched successfully.');
    }

    public function index(Request $request)
    {
        $tasks = Task::query()
            ->with('assignee:id,name,email,role')
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return $this->success([
            'items' => TaskResource::collection($tasks->items()),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ], 'Tasks fetched successfully.');
    }

    public function store(StoreTaskRequest $request)
    {
        $payload = $request->validated();

        if (! empty($payload['assignee_id'])) {
            $worker = User::query()
                ->where('id', $payload['assignee_id'])
                ->where('role', UserRole::WORKER->value)
                ->first();

            if (! $worker) {
                return $this->error('Selected assignee must be a worker.', 422, [
                    'assignee_id' => ['Selected assignee must be a worker.'],
                ]);
            }
        }

        $task = Task::query()->create($payload);
        $task->load('assignee:id,name,email,role');

        return $this->success(new TaskResource($task), 'Task created successfully.', 201);
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        $payload = $request->validated();

        if (array_key_exists('assignee_id', $payload) && ! empty($payload['assignee_id'])) {
            $worker = User::query()
                ->where('id', $payload['assignee_id'])
                ->where('role', UserRole::WORKER->value)
                ->first();

            if (! $worker) {
                return $this->error('Selected assignee must be a worker.', 422, [
                    'assignee_id' => ['Selected assignee must be a worker.'],
                ]);
            }
        }

        $task->update($payload);
        $task->load('assignee:id,name,email,role');

        return $this->success(new TaskResource($task), 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return $this->success(null, 'Task deleted successfully.');
    }
}
