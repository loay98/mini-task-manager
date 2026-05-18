import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/api";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        status === "completed"
          ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-100"
          : "bg-amber-100 text-amber-900 hover:bg-amber-100"
      )}
    >
      {status}
    </Badge>
  );
}
