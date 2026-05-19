<?php

namespace Database\Factories;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'status' => TaskStatus::PENDING->value,
            'assignee_id' => User::factory()->worker(),
            'assigned_by' => User::factory()->manager(),
        ];
    }
}
