export type UserRole = "manager" | "worker";
export type TaskStatus = "pending" | "completed";

export interface User {
  id: number;
  name: string;
  email?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
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

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

export interface TaskListParams {
  search?: string;
  status?: TaskStatus;
  assignee_id?: number | null;
  page?: number;
  per_page?: number;
}

export interface WorkerListParams {
  search?: string;
  page?: number;
  per_page?: number;
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

export interface CreateWorkerPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateWorkerPayload {
  name?: string;
  email?: string;
  password?: string;
}
