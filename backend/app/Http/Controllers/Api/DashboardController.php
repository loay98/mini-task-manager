<?php

namespace App\Http\Controllers\Api;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Task;
use App\Models\User;

class DashboardController extends BaseApiController
{
    public function index()
    {
        $totalTasks = Task::query()->count();
        $pendingTasks = Task::query()->where('status', TaskStatus::PENDING->value)->count();
        $completedTasks = Task::query()->where('status', TaskStatus::COMPLETED->value)->count();
        $totalWorkers = User::query()->where('role', UserRole::WORKER->value)->count();

        return $this->success([
            'tasks' => [
                'total' => $totalTasks,
                'pending' => $pendingTasks,
                'completed' => $completedTasks,
            ],
            'workers' => [
                'total' => $totalWorkers,
            ],
        ], 'Dashboard data fetched successfully.');
    }
}
