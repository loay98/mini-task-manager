"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type {
  ApiEnvelope,
  CreateTaskPayload,
  PaginatedResponse,
  Task,
  UpdateTaskPayload,
  User,
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
import { TaskCreateForm } from "@/components/task-create-form";
import { TaskTable } from "@/components/task-table";
import { TableSkeleton } from "@/components/skeletons";

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
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actingTaskId, setActingTaskId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [tasksRes, workersRes] = await Promise.all([
        api.get<ApiEnvelope<PaginatedResponse<Task>>>("/tasks"),
        api.get<ApiEnvelope<User[]>>("/workers"),
      ]);

      setTasks(tasksRes.data.data.items);
      setWorkers(workersRes.data.data);
    } catch (error) {
      toast.error(getApiMessage(error, "Failed to fetch dashboard data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token || user?.role !== "manager") {
      router.replace("/login");
      return;
    }

    const timeout = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => clearTimeout(timeout);
  }, [token, user, router, fetchData]);

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    try {
      setSubmitLoading(true);
      const response = await api.post<ApiEnvelope<Task>>("/tasks", payload);
      await fetchData();
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
      await fetchData();
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
      await fetchData();
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
            <TaskCreateForm workers={workers} onSubmit={handleCreateTask} loading={submitLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Latest tasks across all workers.</CardDescription>
            {loading ? (
              <CardAction>
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading...
                </span>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} />
            ) : (
              <TaskTable
                tasks={tasks}
                workers={workers}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                actingTaskId={actingTaskId}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
