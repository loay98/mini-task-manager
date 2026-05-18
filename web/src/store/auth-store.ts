"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/api";
import { clearAuthCookie, setAuthCookie } from "@/lib/cookies";

interface AuthState {
  token: string | null;
  user: User | null;
  hasHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => {
        setAuthCookie(token);
        set({ token, user, hasHydrated: true });
      },
      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
      logout: () => {
        clearAuthCookie();
        set({ token: null, user: null, hasHydrated: true });
      },
    }),
    {
      name: "mini-task-manager-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
