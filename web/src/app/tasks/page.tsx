import { TasksPageClient } from "./tasks-page-client";
import { AuthRouteGuard } from "@/components/auth-route-guard";
import { TableSkeleton } from "@/components/skeletons";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  return (
    <AuthRouteGuard
      mode="manager-only"
      redirectTo="/login"
      fallback={
        <main className="app-gradient min-h-screen p-4 md:p-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
            <TableSkeleton rows={5} />
          </div>
        </main>
      }
    >
      <TasksPageClient statusFilter="all" />
    </AuthRouteGuard>
  );
}
