"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getApiMessage } from "@/lib/api-error";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useTasksQuery,
  useUpdateTaskMutation,
} from "@/lib/queries/tasks";
import { useAuthStore } from "@/store/auth-store";
import type { CreateTaskPayload, UpdateTaskPayload } from "@/types/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaginationControls } from "@/components/pagination-controls";
import { TaskCreateForm } from "@/components/task-create-form";
import { TaskFilters, type TaskAssigneeFilter, type TaskStatusFilter } from "@/components/task-filters";
import { TaskTable } from "@/components/task-table";
import { TableSkeleton } from "@/components/skeletons";

const TASKS_PER_PAGE = 10;

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<TaskAssigneeFilter>("all");
  const [page, setPage] = useState(1);
  const [actingTaskId, setActingTaskId] = useState<number | null>(null);

  const { debounced: debouncedSearch, isDebouncing } = useDebouncedValue(search, 800);

  const isManager = Boolean(token && user?.role === "manager");

  const {
    data: tasksData,
    isLoading: tasksLoading,
    isFetching: tasksFetching,
    isError,
    error,
  } = useTasksQuery(
    {
      page,
      per_page: TASKS_PER_PAGE,
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      assignee_id:
        assigneeFilter === "all"
          ? undefined
          : assigneeFilter === "unassigned"
            ? null
            : Number(assigneeFilter),
    },
    isManager
  );

  const createTask = useCreateTaskMutation();
  const updateTask = useUpdateTaskMutation();
  const deleteTask = useDeleteTaskMutation();

  const tasks = tasksData?.items ?? [];
  const pagination = tasksData?.pagination ?? {
    current_page: 1,
    last_page: 1,
    per_page: TASKS_PER_PAGE,
    total: 0,
  };

  const isSearchPending = isDebouncing || (tasksFetching && !tasksLoading);
  const hasActiveFilters =
    debouncedSearch.length > 0 || statusFilter !== "all" || assigneeFilter !== "all";

  useEffect(() => {
    if (!token) return;
    if (user?.role !== "manager") {
      router.replace("/login");
    }
  }, [token, user, router]);

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    await createTask.mutateAsync(payload);
    setPage(1);
  };

  const handleUpdateTask = async (id: number, payload: UpdateTaskPayload) => {
    try {
      setActingTaskId(id);
      await updateTask.mutateAsync({ id, payload });
    } catch {
      throw new Error("Update failed");
    } finally {
      setActingTaskId(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      setActingTaskId(id);
      await deleteTask.mutateAsync(id);
    } catch {
      throw new Error("Delete failed");
    } finally {
      setActingTaskId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!isManager) {
    return null;
  }

  return (
    <main className="app-gradient min-h-screen p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Dashboard</CardTitle>
            <CardDescription>Manage team work items and assignments.</CardDescription>
            <CardAction>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TaskCreateForm
              onSubmit={handleCreateTask}
              loading={createTask.isPending}
            />
          </CardContent>
        </Card>

        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Search, filter, and browse tasks across your team.</CardDescription>
            {tasksLoading || tasksFetching ? (
              <CardAction>
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  {isSearchPending ? "Searching..." : "Loading..."}
                </span>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4 overflow-visible">
            <TaskFilters
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              status={statusFilter}
              onStatusChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              assignee={assigneeFilter}
              onAssigneeChange={(value) => {
                setAssigneeFilter(value);
                setPage(1);
              }}
              disabled={tasksLoading}
              isSearchPending={isSearchPending}
            />

            {isError ? (
              <p className="text-sm text-destructive">
                {getApiMessage(error, "Failed to fetch tasks.")}
              </p>
            ) : null}

            {tasksLoading ? (
              <TableSkeleton rows={5} />
            ) : (
              <TaskTable
                tasks={tasks}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                actingTaskId={actingTaskId}
                emptyMessage={
                  hasActiveFilters
                    ? "No tasks match your search or filters."
                    : "No tasks yet. Create your first task above."
                }
              />
            )}

            {!tasksLoading && pagination.total > 0 ? (
              <PaginationControls
                pagination={pagination}
                onPageChange={setPage}
                disabled={tasksFetching}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
