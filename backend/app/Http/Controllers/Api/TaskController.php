<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Requests\Task\IndexTaskRequest;
use App\Http\Requests\Task\IndexWorkersRequest;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Http\Resources\UserResource;
use App\Models\Task;
use App\Models\User;

class TaskController extends BaseApiController
{
    public function workers(IndexWorkersRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 10);

        $workers = User::query()
            ->where('role', UserRole::WORKER->value)
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->when(filled($validated['search'] ?? null), function ($query) use ($validated): void {
                $search = $validated['search'];
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(array_key_exists('sort_by', $validated) && $validated['sort_by'] !== '', function ($query) use ($validated): void {
                $sortBy = $validated['sort_by'];
                $sortOrder = $validated['sort_order'] ?? 'asc';
                // Sanitize sort column to allowed list to avoid SQL injection
                if (! in_array($sortBy, ['id', 'name', 'created_at'], true)) {
                    $sortBy = 'name';
                }
                $query->orderBy($sortBy, $sortOrder);
            }, function ($query) {
                $query->orderBy('name', 'asc');
            })
            ->paginate($perPage);

        return $this->paginatedResponse($workers, UserResource::class, 'Workers fetched successfully.');
    }

    public function index(IndexTaskRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 10);

        $tasks = Task::query()
            ->with('assignee:id,name,email,role', 'assignedBy:id,name,email,role')
            ->when(filled($validated['search'] ?? null), function ($query) use ($validated): void {
                $search = $validated['search'];
                // If search is purely numeric, search by ID
                if (ctype_digit((string) $search)) {
                    $query->where('id', (int) $search);
                    return;
                }

                $query->where(function ($builder) use ($search): void {
                    $builder->where('title', 'like', "%{$search}%")
                        ->orWhereHas('assignee', function ($assigneeQuery) use ($search): void {
                            $assigneeQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when(filled($validated['status'] ?? null), function ($query) use ($validated): void {
                $query->where('status', $validated['status']);
            })
            ->when(array_key_exists('assignee_id', $validated), function ($query) use ($validated): void {
                $query->where('assignee_id', $validated['assignee_id']);
            })
            ->when(array_key_exists('assigned_by', $validated), function ($query) use ($validated): void {
                $query->where('assigned_by', $validated['assigned_by']);
            })
            ->when(filled($validated['sort_by'] ?? null), function ($query) use ($validated): void {
                $sortBy = $validated['sort_by'];
                $sortOrder = $validated['sort_order'] ?? 'desc';
                $query->orderBy($sortBy, $sortOrder);
            }, function ($query) {
                $query->latest();
            })
            ->paginate($perPage);

        return $this->paginatedResponse($tasks, TaskResource::class, 'Tasks fetched successfully.');
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

        $task = Task::query()->create([
            ...$payload,
            'assigned_by' => $request->user()->id,
        ]);
        $task->load('assignee:id,name,email,role', 'assignedBy:id,name,email,role');

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
        $task->load('assignee:id,name,email,role', 'assignedBy:id,name,email,role');

        return $this->success(new TaskResource($task), 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return $this->success(null, 'Task deleted successfully.');
    }
}
