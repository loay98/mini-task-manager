import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchMyTasksPage, fetchTaskCounts, markTaskCompleted } from "../../api/tasks";
import type { PaginatedResponse } from "../../types/api";
import type { Task } from "../../types/task";

export const tasksQueryKey = (status?: string, search?: string) => ["my-tasks", { status, search }] as const;
export const tasksCountsQueryKey = ["my-tasks-counts"] as const;

export function useTasksQuery(status?: string, search?: string) {
  return useInfiniteQuery({
    queryKey: tasksQueryKey(status, search),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchMyTasksPage(pageParam, status, search),
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.pagination;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });
}

export function useTasksCountQuery() {
  return useQuery({
    queryKey: tasksCountsQueryKey,
    queryFn: fetchTaskCounts,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useCompleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markTaskCompleted,

    onMutate: async (taskId: number) => {
      // Cancel all tasks queries to handle any status filter
      await queryClient.cancelQueries({ queryKey: ["my-tasks"] });

      // Store previous data for all status variants
      const previousTasks = queryClient.getQueryData<
        InfiniteData<PaginatedResponse<Task>, number>
      >(["my-tasks"]);

      // Optimistically update all tasks queries
      queryClient.setQueryData<InfiniteData<PaginatedResponse<Task>, number>>(
        ["my-tasks"],
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      status: "completed",
                    }
                  : task
              ),
            })),
          };
        }
      );

      return { previousTasks };
    },

    onError: (_error, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["my-tasks"], context.previousTasks);
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      await queryClient.invalidateQueries({ queryKey: tasksCountsQueryKey });
    },
  });
}
