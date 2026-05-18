import type { TaskListParams, WorkerListParams } from "@/types/api";

export const queryKeys = {
  dashboard: {
    summary: ["dashboard", "summary"] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (params: TaskListParams) => ["tasks", "list", params] as const,
  },
  workers: {
    all: ["workers"] as const,
    list: (params: WorkerListParams) => ["workers", "list", params] as const,
  },
};
