"use client";

import { AuthRouteGuard } from "@/components/auth-route-guard";
import { TableSkeleton } from "@/components/skeletons";
import { WorkersManagement } from "@/components/workers-management";

export default function WorkersPage() {
  return (
    <AuthRouteGuard
      mode="manager-only"
      redirectTo="/login"
      fallback={
        <main className="app-gradient flex-1 p-4 md:p-8">
          <div className="mx-auto w-full max-w-5xl">
            <TableSkeleton rows={4} />
          </div>
        </main>
      }
    >
      <main className="app-gradient flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-5xl">
          <WorkersManagement />
        </div>
      </main>
    </AuthRouteGuard>
  );
}
