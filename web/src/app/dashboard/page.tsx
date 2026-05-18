"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTasksQuery } from "@/lib/queries/tasks";
import { useWorkersQuery } from "@/lib/queries/workers";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  const isManager = Boolean(token && user?.role === "manager");

  // small stats queries
  const totalTasksQuery = useTasksQuery({ page: 1, per_page: 1 }, isManager);
  const pendingTasksQuery = useTasksQuery({ page: 1, per_page: 1, status: "pending" }, isManager);
  const completedTasksQuery = useTasksQuery({ page: 1, per_page: 1, status: "completed" }, isManager);
  const workersQuery = useWorkersQuery({ page: 1, per_page: 1 }, isManager);

  useEffect(() => {
    if (!token) return;
    if (user?.role !== "manager") {
      router.replace("/login");
    }
  }, [token, user, router]);


  if (!isManager) {
    return null;
  }

  const totalTasks = totalTasksQuery.data?.pagination.total ?? 0;
  const pendingTasks = pendingTasksQuery.data?.pagination.total ?? 0;
  const completedTasks = completedTasksQuery.data?.pagination.total ?? 0;
  const totalWorkers = workersQuery.data?.pagination.total ?? 0;

  return (
    <main className="app-gradient min-h-screen p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>High level metrics for your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">Total tasks</div>
                <div className="mt-2 text-2xl font-semibold">{totalTasks}</div>
                <div className="mt-3">
                  <Link href="/tasks" className="text-sm text-primary">Manage tasks →</Link>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="mt-2 text-2xl font-semibold">{pendingTasks}</div>
                <div className="mt-3">
                  <Link href="/tasks?status=pending" className="text-sm text-primary">View pending →</Link>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="mt-2 text-2xl font-semibold">{completedTasks}</div>
                <div className="mt-3">
                  <Link href="/tasks?status=completed" className="text-sm text-primary">View completed →</Link>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">Workers</div>
                <div className="mt-2 text-2xl font-semibold">{totalWorkers}</div>
                <div className="mt-3">
                  <Link href="/workers" className="text-sm text-primary">Manage workers →</Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
