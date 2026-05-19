"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusSelect } from "@/components/status-select";
import { TaskDeleteDialog } from "@/components/task-delete-dialog";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { WorkerCombobox } from "@/components/worker-combobox";
import { DateTimePicker } from "@/components/date-picker";
import type { Task, TaskStatus, UpdateTaskPayload } from "@/types/api";

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function EmptyValue({ children = "—" }: { children?: string }) {
  return <span className="block w-full text-center text-muted-foreground">{children}</span>;
}

const editSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  status: z.enum(["pending", "completed"]),
  assignee_id: z.number().nullable().optional(),
  due_date: z.string().nullable().optional(),
});

interface TaskTableProps {
  tasks: Task[];
  onUpdate: (id: number, payload: UpdateTaskPayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  actingTaskId?: number | null;
  emptyMessage?: string;
}

export function TaskTable({
  tasks,
  onUpdate,
  onDelete,
  actingTaskId = null,
  emptyMessage = "No tasks yet. Create your first task above.",
}: TaskTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("pending");
  const [editAssigneeId, setEditAssigneeId] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | undefined>();
  const [editError, setEditError] = useState("");

  if (!tasks.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setDeleteTarget(null);
    setEditTitle(task.title);
    setEditStatus(task.status);
    setEditAssigneeId(task.assignee_id ? String(task.assignee_id) : "");
    setEditDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleSave = async (taskId: number) => {
    setEditError("");

    const parsed = editSchema.safeParse({
      title: editTitle,
      status: editStatus,
      assignee_id: editAssigneeId ? Number(editAssigneeId) : null,
      due_date: editDueDate ? toDateTimeLocalValue(editDueDate) : null,
    });

    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    await onUpdate(taskId, parsed.data);
    setEditingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  const isDeleting = deleteTarget !== null && actingTaskId === deleteTarget.id;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isOverdue = (dueDate: string | null | undefined, status: TaskStatus) => {
    if (!dueDate || status === "completed") return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <>
      <Table className="min-w-200">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Assigned By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isActing = actingTaskId === task.id;
            const isEditing = editingId === task.id;
            const overdue = isOverdue(task.due_date, task.status);
            const dueDateLabel = task.due_date ? formatDate(task.due_date) : "—";
            const dueDateClassName = task.due_date
              ? overdue
                ? "text-destructive font-medium"
                : "text-muted-foreground"
              : "block text-center text-muted-foreground";

            if (isEditing) {
              return (
                <TableRow key={task.id} className="bg-muted/30">
                  <TableCell colSpan={8}>
                    <div className="grid gap-3 md:grid-cols-4">
                      <Input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        disabled={isActing}
                        aria-label="Task title"
                      />
                      <WorkerCombobox
                        key={task.id}
                        value={editAssigneeId}
                        onChange={setEditAssigneeId}
                        disabled={isActing}
                        defaultLabel={task.assignee?.name}
                      />
                      <StatusSelect value={editStatus} onChange={setEditStatus} disabled={isActing} />
                      <DateTimePicker date={editDueDate} onSelect={setEditDueDate} disabled={isActing} placeholder="Due date & time" />
                    </div>
                    {editError ? <p className="mt-2 text-sm text-destructive">{editError}</p> : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button size="sm" onClick={() => void handleSave(task.id)} disabled={isActing}>
                        {isActing ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isActing}>
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            return (
              <TableRow key={task.id}>
                <TableCell className="font-mono text-muted-foreground">#{task.id}</TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  {task.assignee?.name ? task.assignee.name : <EmptyValue />}
                </TableCell>
                <TableCell>
                  {task.assignedBy?.name ? task.assignedBy.name : <EmptyValue />}
                </TableCell>
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <span className={dueDateClassName}>{dueDateLabel}</span>
                  ) : (
                    <EmptyValue />
                  )}
                </TableCell>
                <TableCell>
                  {new Date(task.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(task)}
                      disabled={isActing || actingTaskId !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteTarget(task);
                        setEditingId(null);
                      }}
                      disabled={isActing || actingTaskId !== null}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TaskDeleteDialog
        task={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDeleteConfirm()}
        isDeleting={isDeleting}
      />
    </>
  );
}
