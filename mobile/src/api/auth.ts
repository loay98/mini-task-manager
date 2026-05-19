import { api } from "./client";
import type { ApiEnvelope } from "../types/api";
import type { LoginResponse } from "../types/auth";

interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", payload);
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post<ApiEnvelope<null>>("/auth/logout");
}
