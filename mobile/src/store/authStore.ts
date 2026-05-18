import { create } from "zustand";
import type { User } from "../types/auth";
import { storage } from "./storage";
import { logout as apiLogout } from "../api/auth";

const TOKEN_KEY = "task_manager_token";
const USER_KEY = "task_manager_user";

interface AuthState {
  hydrated: boolean;
  token: string | null;
  user: User | null;
  isLoggingOut: boolean;
  hydrate: () => Promise<void>;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  token: null,
  user: null,
  isLoggingOut: false,

  hydrate: async () => {
    try {
      const [token, userRaw] = await Promise.all([
        storage.getItem(TOKEN_KEY),
        storage.getItem(USER_KEY),
      ]);

      set({
        hydrated: true,
        token,
        user: userRaw ? (JSON.parse(userRaw) as User) : null,
      });
    } catch {
      set({ hydrated: true, token: null, user: null });
    }
  },

  login: async (token, user) => {
    await Promise.all([
      storage.setItem(TOKEN_KEY, token),
      storage.setItem(USER_KEY, JSON.stringify(user)),
    ]);

    set({ token, user });
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await apiLogout();
    } catch {
      // Ignore logout errors - still clear local state
    }

    await Promise.all([
      storage.removeItem(TOKEN_KEY),
      storage.removeItem(USER_KEY),
    ]);

    set({ token: null, user: null, isLoggingOut: false });
  },
}));