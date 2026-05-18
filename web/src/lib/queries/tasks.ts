import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getApiMessage } from "@/lib/api-error";
import { buildListParams } from "@/lib/api-params";
import { queryKeys } from "@/lib/queries/keys";
import type {
  ApiEnvelope,
  CreateTaskPayload,
  PaginatedResponse,
  Task,
  TaskListParams,
  UpdateTaskPayload,
} from "@/types/api";

async function fetchTasks(params: TaskListParams): Promise<PaginatedResponse<Task>> {
  const response = await api.get<ApiEnvelope<PaginatedResponse<Task>>>("/tasks", {
    params: buildListParams({
      page: params.page,
      per_page: params.per_page,
      search: params.search,
      status: params.status,
      assignee_id: params.assignee_id,
    }),
  });

  return response.data.data;
}

export function useTasksQuery(params: TaskListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => fetchTasks(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await api.post<ApiEnvelope<Task>>("/tasks", payload);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success(data.message ?? "Task created successfully.");
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to create task."));
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateTaskPayload }) => {
      const response = await api.patch<ApiEnvelope<Task>>(`/tasks/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success(data.message ?? "Task updated successfully.");
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to update task."));
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiEnvelope<null>>(`/tasks/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success(data.message ?? "Task deleted successfully.");
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to delete task."));
    },
  });
}
