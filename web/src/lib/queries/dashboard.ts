import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queries/keys";
import type { ApiEnvelope, DashboardSummary } from "@/types/api";

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<ApiEnvelope<DashboardSummary>>("/dashboard");
  return response.data.data;
}

export function useDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: fetchDashboardSummary,
    enabled,
  });
}