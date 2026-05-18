import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { buildListParams } from "@/lib/api-params";
import { queryKeys } from "@/lib/queries/keys";
import type { ApiEnvelope, PaginatedResponse, User, WorkerListParams } from "@/types/api";

async function fetchWorkers(params: WorkerListParams): Promise<PaginatedResponse<User>> {
  const response = await api.get<ApiEnvelope<PaginatedResponse<User>>>("/workers", {
    params: buildListParams({
      search: params.search,
      page: params.page,
      per_page: params.per_page,
    }),
  });

  return response.data.data;
}

export function useWorkersQuery(params: WorkerListParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.workers.list(params),
    queryFn: () => fetchWorkers(params),
    enabled,
    placeholderData: (previous) => previous,
  });
}
