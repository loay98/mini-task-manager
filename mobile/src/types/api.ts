export type UserRole = "manager" | "worker";
export type TaskStatus = "pending" | "completed";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  assignee_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface LoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
