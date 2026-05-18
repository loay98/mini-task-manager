import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import type { User } from "../types/auth";

const TOKEN_KEY = "task_manager_token";
const USER_KEY = "task_manager_user";

interface AuthState {
  hydrated: boolean;
  token: string | null;
  user: User | null;
  hydrate: () => Promise<void>;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  token: null,
  user: null,

  hydrate: async () => {
    try {
      const [token, userRaw] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
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
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);

    set({ token, user });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);

    set({ token: null, user: null });
  },
}));
