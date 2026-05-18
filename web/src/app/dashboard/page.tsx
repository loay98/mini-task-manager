"use client";

import Link from "next/link";
import { useTaskNavigationStore } from "@/store/task-navigation-store";
import { useDashboardQuery } from "@/lib/queries/dashboard";
import { useAuthSession } from "@/hooks/use-auth-session";
import { AuthRouteGuard } from "@/components/auth-route-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummarySkeleton } from "@/components/skeletons";

function DashboardContent() {
  const { isManager } = useAuthSession();
  const setPendingStatus = useTaskNavigationStore((state) => state.setPendingStatus);

  const dashboardQuery = useDashboardQuery(isManager);
  const isSummaryLoading = dashboardQuery.isPending || dashboardQuery.isLoading;

  if (isSummaryLoading) {
    return (
      <main className="app-gradient flex-1 p-4 md:p-8">
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
    <main className="app-gradient flex-1 p-4 md:p-8">
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
                  <Link
                    href="/tasks"
                    className="text-sm text-primary"
                    onClick={() => setPendingStatus("pending")}
                  >
                    View pending →
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="mt-2 text-2xl font-semibold">{completedTasks}</div>
                <div className="mt-3">
                  <Link
                    href="/tasks"
                    className="text-sm text-primary"
                    onClick={() => setPendingStatus("completed")}
                  >
                    View completed →
                  </Link>
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

export default function DashboardPage() {
  return (
    <AuthRouteGuard
      mode="manager-only"
      redirectTo="/login"
      fallback={
        <main className="app-gradient flex-1 p-4 md:p-8">
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
      }
    >
      <DashboardContent />
    </AuthRouteGuard>
  );
}
