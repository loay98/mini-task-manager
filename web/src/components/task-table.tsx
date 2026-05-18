import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/api";

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
  if (!tasks.length) {
    return <p className="text-sm text-muted-foreground">No tasks yet. Create your first task above.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="py-3 font-medium">Task</th>
            <th className="py-3 font-medium">Assignee</th>
            <th className="py-3 font-medium">Status</th>
            <th className="py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-border/70">
              <td className="py-3 pr-3 font-medium">{task.title}</td>
              <td className="py-3 pr-3">{task.assignee?.name ?? "Unassigned"}</td>
              <td className="py-3 pr-3">
                <Badge tone={task.status === "completed" ? "completed" : "pending"}>{task.status}</Badge>
              </td>
              <td className="py-3 pr-3">{new Date(task.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
