import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function DashboardSummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-3 h-8 w-14" />
          <Skeleton className="mt-4 h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
