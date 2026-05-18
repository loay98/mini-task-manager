"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/api";
import { clearAuthCookie, setAuthCookie } from "@/lib/cookies";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        setAuthCookie(token);
        set({ token, user });
      },
      logout: () => {
        clearAuthCookie();
        set({ token: null, user: null });
      },
    }),
    {
      name: "mini-task-manager-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
