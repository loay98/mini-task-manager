"use client";

import { create } from "zustand";
import type { TaskStatus } from "@/types/api";

interface TaskNavigationState {
  pendingStatus: TaskStatus | null;
  setPendingStatus: (status: TaskStatus | null) => void;
  clearPendingStatus: () => void;
}

export const useTaskNavigationStore = create<TaskNavigationState>((set) => ({
  pendingStatus: null,
  setPendingStatus: (status) => set({ pendingStatus: status }),
  clearPendingStatus: () => set({ pendingStatus: null }),
}));