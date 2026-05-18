"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { buildListParams } from "@/lib/api-params";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useAuthStore } from "@/store/auth-store";
import type {
  ApiEnvelope,
  CreateTaskPayload,
  PaginatedResponse,
  PaginationMeta,
  Task,
  UpdateTaskPayload,
} from "@/types/api";
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

const defaultPagination: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: TASKS_PER_PAGE,
  total: 0,
};

function getApiMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(defaultPagination);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actingTaskId, setActingTaskId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<TaskAssigneeFilter>("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  const hasActiveFilters =
    debouncedSearch.length > 0 || statusFilter !== "all" || assigneeFilter !== "all";

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true);

      const params = buildListParams({
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
      });

      const response = await api.get<ApiEnvelope<PaginatedResponse<Task>>>("/tasks", { params });

      setTasks(response.data.data.items);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error(getApiMessage(error, "Failed to fetch tasks."));
    } finally {
      setTasksLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, assigneeFilter]);

  useEffect(() => {
    if (!token || user?.role !== "manager") {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    const loadTasks = async () => {
      try {
        setTasksLoading(true);

        const params = buildListParams({
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
        });

        const response = await api.get<ApiEnvelope<PaginatedResponse<Task>>>("/tasks", { params });

        if (cancelled) return;

        setTasks(response.data.data.items);
        setPagination(response.data.data.pagination);
      } catch (error) {
        if (!cancelled) {
          toast.error(getApiMessage(error, "Failed to fetch tasks."));
        }
      } finally {
        if (!cancelled) {
          setTasksLoading(false);
        }
      }
    };

    void loadTasks();

    return () => {
      cancelled = true;
    };
  }, [token, user, router, page, debouncedSearch, statusFilter, assigneeFilter]);

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    try {
      setSubmitLoading(true);
      const response = await api.post<ApiEnvelope<Task>>("/tasks", payload);
      await fetchTasks();
      toast.success(response.data.message ?? "Task created successfully.");
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to create task."));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateTask = async (id: number, payload: UpdateTaskPayload) => {
    try {
      setActingTaskId(id);
      const response = await api.patch<ApiEnvelope<Task>>(`/tasks/${id}`, payload);
      await fetchTasks();
      toast.success(response.data.message ?? "Task updated successfully.");
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to update task."));
      throw error;
    } finally {
      setActingTaskId(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      setActingTaskId(id);
      const response = await api.delete<ApiEnvelope<null>>(`/tasks/${id}`);
      await fetchTasks();
      toast.success(response.data.message ?? "Task deleted successfully.");
    } catch (error) {
      toast.error(getApiMessage(error, "Unable to delete task."));
      throw error;
    } finally {
      setActingTaskId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

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
            <TaskCreateForm onSubmit={handleCreateTask} loading={submitLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Search, filter, and browse tasks across your team.</CardDescription>
            {tasksLoading ? (
              <CardAction>
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading...
                </span>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
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
            />

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
                disabled={tasksLoading}
              />
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
