<?php

namespace Database\Seeders;

use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Models\Task;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $manager = User::query()->updateOrCreate(
            ['email' => 'manager@test.com'],
            [
                'name' => 'Manager User',
                'role' => UserRole::MANAGER->value,
                'password' => Hash::make('password'),
            ]
        );

        $worker = User::query()->updateOrCreate(
            ['email' => 'worker@test.com'],
            [
                'name' => 'Worker User',
                'role' => UserRole::WORKER->value,
                'password' => Hash::make('password'),
            ]
        );

        User::factory(4)->worker()->create();

        Task::factory(5)->create([
            'assignee_id' => $worker->id,
            'status' => TaskStatus::PENDING->value,
        ]);

        Task::factory(3)->create([
            'status' => TaskStatus::PENDING->value,
        ]);

        Task::factory(2)->create([
            'assignee_id' => $worker->id,
            'status' => TaskStatus::COMPLETED->value,
        ]);
    }
}
