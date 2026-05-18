"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiEnvelope, CreateTaskPayload, PaginatedResponse, Task, User } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCreateForm } from "@/components/task-create-form";
import { TaskTable } from "@/components/task-table";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user, logout } = useAuthStore();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [tasksRes, workersRes] = await Promise.all([
        api.get<ApiEnvelope<PaginatedResponse<Task>>>("/tasks"),
        api.get<ApiEnvelope<User[]>>("/workers"),
      ]);

      setTasks(tasksRes.data.data.items);
      setWorkers(workersRes.data.data);
    } catch {
      setError("Failed to fetch dashboard data.");
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
      await api.post("/tasks", payload);
      await fetchData();
    } catch {
      setError("Unable to create task.");
    } finally {
      setSubmitLoading(false);
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
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Task Dashboard</CardTitle>
              <CardDescription>Manage team work items and assignments.</CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </CardHeader>
          <CardContent>
            <TaskCreateForm workers={workers} onSubmit={handleCreateTask} loading={submitLoading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
            <CardDescription>Latest tasks across all workers.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Loading tasks...</p> : <TaskTable tasks={tasks} />}
            {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
