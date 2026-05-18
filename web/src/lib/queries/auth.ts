import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiEnvelope, LoginPayload, LoginResponse } from "@/types/api";

export function useLoginMutation() {
  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", payload);
      return response.data.data;
    },
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      await api.post<ApiEnvelope<null>>("/auth/logout");
    },
  });
}
