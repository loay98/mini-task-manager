"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDashboardQuery } from "@/lib/queries/dashboard";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummarySkeleton } from "@/components/skeletons";

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  const isManager = Boolean(token && user?.role === "manager");

  const dashboardQuery = useDashboardQuery(isManager);
  const isSummaryLoading = dashboardQuery.isPending || dashboardQuery.isLoading;

  useEffect(() => {
    if (!token) return;
    if (user?.role !== "manager") {
      router.replace("/login");
    }
  }, [token, user, router]);


  if (!isManager) {
    return null;
  }

  if (isSummaryLoading) {
    return (
      <main className="app-gradient min-h-screen p-4 md:p-8">
        <div className="mx-auto w-full max-w-5xl">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>High level metrics for your team.</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardSummarySkeleton />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const summary = dashboardQuery.data;
  const totalTasks = summary?.tasks.total ?? 0;
  const pendingTasks = summary?.tasks.pending ?? 0;
  const completedTasks = summary?.tasks.completed ?? 0;
  const totalWorkers = summary?.workers.total ?? 0;

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
