import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getApiMessage } from "@/lib/api-error";
import { buildListParams } from "@/lib/api-params";
import { queryKeys } from "@/lib/queries/keys";
import type {
  ApiEnvelope,
  CreateWorkerPayload,
  PaginatedResponse,
  UpdateWorkerPayload,
  User,
  WorkerListParams,
} from "@/types/api";

async function fetchWorkers(params: WorkerListParams): Promise<PaginatedResponse<User>> {
  const response = await api.get<ApiEnvelope<PaginatedResponse<User>>>("/workers", {
    params: buildListParams({
      search: params.search,
      page: params.page,
      per_page: params.per_page,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    }),
  });

  return response.data.data;
}

export function useWorkersQuery(params: WorkerListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.workers.list(params),
    queryFn: () => fetchWorkers(params),
    enabled,
    // rely on default behavior; keepPreviousData removed to satisfy typing
  });
}

export function useCreateWorkerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWorkerPayload) => {
      const response = await api.post<ApiEnvelope<User>>("/workers", payload);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success(data.message ?? "Worker created successfully.");
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to create worker."));
    },
  });
}

export function useUpdateWorkerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateWorkerPayload }) => {
      const response = await api.patch<ApiEnvelope<User>>(`/workers/${id}`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success(data.message ?? "Worker updated successfully.");
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to update worker."));
    },
  });
}

export function useDeleteWorkerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete<ApiEnvelope<null>>(`/workers/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.workers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success(data.message ?? "Worker deleted successfully.");
    },
    onError: (error) => {
      toast.error(getApiMessage(error, "Unable to delete worker."));
    },
  });
}
