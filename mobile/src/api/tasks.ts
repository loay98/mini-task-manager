import { api } from "./client";
import type { ApiEnvelope, PaginatedResponse } from "../types/api";
import type { Task } from "../types/task";

export interface TaskCounts {
  all: number;
  pending: number;
  completed: number;
}

export type SortBy = 'id' | 'title' | 'created_at' | 'updated_at' | 'due_date';
export type SortOrder = 'asc' | 'desc';

export async function fetchMyTasksPage(
  pageParam = 1,
  status?: string,
  search?: string,
  sortBy?: SortBy,
  sortOrder?: SortOrder
): Promise<PaginatedResponse<Task>> {
  const response = await api.get<ApiEnvelope<PaginatedResponse<Task>>>("/my-tasks", {
    params: {
      page: pageParam,
      per_page: 10,
      ...(status && status !== "all" ? { status } : {}),
      ...(search ? { search } : {}),
      ...(sortBy ? { sort_by: sortBy } : {}),
      ...(sortOrder ? { sort_order: sortOrder } : {}),
    },
  });
  return response.data.data;
}

export async function fetchTaskCounts(): Promise<TaskCounts> {
    const response = await api.get<ApiEnvelope<TaskCounts>>("/my-tasks/counts");
    return response.data.data;
}

export async function markTaskCompleted(taskId: number): Promise<Task> {
  const response = await api.patch<ApiEnvelope<Task>>(`/tasks/${taskId}/complete`);
  return response.data.data;
}
