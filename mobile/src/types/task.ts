import type { User } from "./auth";

export type TaskStatus = "pending" | "completed" | string;

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  due_date?: string | null;
  assigned_by?: User | null;
  assignee_id: number;
  assignee?: User;
  created_at?: string;
  updated_at?: string;
}
