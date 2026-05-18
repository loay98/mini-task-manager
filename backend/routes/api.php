<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WorkerTaskController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:api')->group(function (): void {
    Route::middleware('role:manager')->group(function (): void {
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::get('/workers', [TaskController::class, 'workers']);
        Route::post('/tasks', [TaskController::class, 'store']);
    });

    Route::middleware('role:worker')->group(function (): void {
        Route::get('/my-tasks', [WorkerTaskController::class, 'index']);
        Route::patch('/tasks/{task}/complete', [WorkerTaskController::class, 'complete']);
    });
});
