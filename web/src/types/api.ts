export type UserRole = "manager" | "worker";
export type TaskStatus = "pending" | "completed";

export interface User {
  id: number;
  name: string;
  email?: string;
  role: UserRole;
}

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  assignee_id?: number | null;
  assignee?: User | null;
  created_at: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta?: Record<string, unknown>;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type?: string;
  expires_in?: number;
  user: User;
}

export interface CreateTaskPayload {
  title: string;
  assignee_id?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  status?: TaskStatus;
  assignee_id?: number | null;
}
