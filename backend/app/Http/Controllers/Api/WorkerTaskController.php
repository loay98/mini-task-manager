<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class WorkerTaskController extends BaseApiController
{
    public function index(Request $request)
    {
        $query = Task::query()
            ->with('assignee:id,name,email,role', 'assignedBy:id,name,email,role')
            ->where('assignee_id', $request->user()->id);

        // Filter by status if provided
        $status = $request->string('status')->toString();
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Search by ID or title if provided
        $search = $request->string('search')->toString();
        if ($search) {
            // If search is purely numeric, search by ID
            if (ctype_digit($search)) {
                $query->where('id', (int) $search);
            } else {
                // Otherwise search by title
                $query->where('title', 'like', "%{$search}%");
            }
        }

        $tasks = $query->latest()->paginate((int) $request->integer('per_page', 10));

        return $this->success([
            'items' => TaskResource::collection($tasks->items()),
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ], 'Assigned tasks fetched successfully.');
    }

    public function complete(Request $request, Task $task)
    {
        if ((int) $task->assignee_id !== (int) $request->user()->id) {
            return $this->error('You can only complete your assigned tasks.', 403);
        }

        if ($task->status === TaskStatus::COMPLETED->value) {
            return $this->error('Task is already completed.', 422);
        }

        $task->update([
            'status' => TaskStatus::COMPLETED->value,
        ]);

        $task->load('assignee:id,name,email,role', 'assignedBy:id,name,email,role');

        return $this->success(new TaskResource($task), 'Task marked as completed.');
    }

    public function counts(Request $request)
    {
        $userId = $request->user()->id;
        $allCount = Task::where('assignee_id', $userId)->count();
        $pendingCount = Task::where('assignee_id', $userId)
            ->where('status', TaskStatus::PENDING->value)
            ->count();
        $completedCount = Task::where('assignee_id', $userId)
            ->where('status', TaskStatus::COMPLETED->value)
            ->count();

        return $this->success([
            'all' => $allCount,
            'pending' => $pendingCount,
            'completed' => $completedCount,
        ], 'Task counts fetched successfully.');
    }
}
