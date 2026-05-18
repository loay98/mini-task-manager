"use client";

import { useAuthStore } from "@/store/auth-store";

export function useAuthSession() {
  const { token, user, hasHydrated } = useAuthStore();
  const isManager = hasHydrated && Boolean(token && user?.role === "manager");

  return {
    token,
    user,
    hasHydrated,
    isManager,
  };
}