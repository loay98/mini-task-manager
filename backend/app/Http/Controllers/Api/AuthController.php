<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;

class AuthController extends BaseApiController
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return $this->error('Invalid credentials.', 401);
        }

        $user = Auth::guard('api')->user();

        return $this->success([
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => (int) env('JWT_TTL', 60) * 60,
            'user' => new UserResource($user),
        ], 'Login successful.');
    }
}
