"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";

type AuthRouteGuardProps = {
  mode: "manager-only" | "guest-only";
  redirectTo: string;
  fallback: ReactNode;
  children: ReactNode;
};

export function AuthRouteGuard({ mode, redirectTo, fallback, children }: AuthRouteGuardProps) {
  const router = useRouter();
  const { hasHydrated, isManager } = useAuthSession();

  useEffect(() => {
    if (!hasHydrated) return;

    if (mode === "manager-only" && !isManager) {
      router.replace(redirectTo);
    }

    if (mode === "guest-only" && isManager) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, isManager, mode, redirectTo, router]);

  if (!hasHydrated) {
    return fallback;
  }

  if (mode === "manager-only" && !isManager) {
    return fallback;
  }

  if (mode === "guest-only" && isManager) {
    return fallback;
  }

  return children;
}