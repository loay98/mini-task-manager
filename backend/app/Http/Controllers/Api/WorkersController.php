<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Requests\Task\IndexWorkersRequest;
use App\Http\Requests\Worker\StoreWorkerRequest;
use App\Http\Requests\Worker\UpdateWorkerRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class WorkersController extends BaseApiController
{
    public function index(IndexWorkersRequest $request)
    {
        $validated = $request->validated();
        $perPage = (int) ($validated['per_page'] ?? 10);

        $workers = User::query()
            ->where('role', UserRole::WORKER->value)
            ->select('id', 'name', 'email', 'role', 'created_at', 'updated_at')
            ->when(filled($validated['search'] ?? null), function ($query) use ($validated): void {
                $search = $validated['search'];
                // If search is numeric, match by ID
                if (ctype_digit((string) $search)) {
                    $query->where('id', (int) $search);
                    return;
                }

                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($perPage);

        return $this->paginatedResponse($workers, UserResource::class, 'Workers fetched successfully.');
    }

    public function store(StoreWorkerRequest $request)
    {
        $payload = $request->validated();

        $worker = User::query()->create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
            'role' => UserRole::WORKER->value,
        ]);

        return $this->success(new UserResource($worker), 'Worker created successfully.', 201);
    }

    public function update(UpdateWorkerRequest $request, User $worker)
    {
        if ($worker->role !== UserRole::WORKER->value) {
            return $this->error('Worker not found.', 404);
        }

        $payload = $request->validated();

        $worker->fill([
            'name' => $payload['name'] ?? $worker->name,
            'email' => $payload['email'] ?? $worker->email,
            'role' => UserRole::WORKER->value,
        ]);

        if (! empty($payload['password'] ?? null)) {
            $worker->password = Hash::make($payload['password']);
        }

        $worker->save();

        return $this->success(new UserResource($worker), 'Worker updated successfully.');
    }

    public function destroy(User $worker)
    {
        if ($worker->role !== UserRole::WORKER->value) {
            return $this->error('Worker not found.', 404);
        }

        $worker->delete();

        return $this->success(null, 'Worker deleted successfully.');
    }
}
