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
import { TaskStatusBadge } from "@/components/task-status-badge";
import { WorkerCombobox } from "@/components/worker-combobox";
import type { Task, TaskStatus, UpdateTaskPayload } from "@/types/api";

const editSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  status: z.enum(["pending", "completed"]),
  assignee_id: z.number().nullable().optional(),
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("pending");
  const [editAssigneeId, setEditAssigneeId] = useState("");
  const [editError, setEditError] = useState("");

  if (!tasks.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setConfirmDeleteId(null);
    setEditTitle(task.title);
    setEditStatus(task.status);
    setEditAssigneeId(task.assignee_id ? String(task.assignee_id) : "");
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
    });

    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    await onUpdate(taskId, parsed.data);
    setEditingId(null);
  };

  const handleDelete = async (taskId: number) => {
    await onDelete(taskId);
    setConfirmDeleteId(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Assignee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const isActing = actingTaskId === task.id;
          const isEditing = editingId === task.id;
          const isConfirmingDelete = confirmDeleteId === task.id;

          if (isEditing) {
            return (
              <TableRow key={task.id} className="bg-muted/30">
                <TableCell colSpan={4}>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      disabled={isActing}
                      aria-label="Task title"
                    />
                    <WorkerCombobox
                      value={editAssigneeId}
                      onChange={setEditAssigneeId}
                      disabled={isActing}
                      selectedLabel={task.assignee?.name}
                    />
                    <StatusSelect value={editStatus} onChange={setEditStatus} disabled={isActing} />
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
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{task.assignee?.name ?? "Unassigned"}</TableCell>
              <TableCell>
                <TaskStatusBadge status={task.status} />
              </TableCell>
              <TableCell>{new Date(task.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                {isConfirmingDelete ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="text-xs text-muted-foreground">Delete?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void handleDelete(task.id)}
                      disabled={isActing}
                    >
                      {isActing ? <Loader2 className="size-4 animate-spin" /> : "Yes"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={isActing}
                    >
                      No
                    </Button>
                  </div>
                ) : (
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
                        setConfirmDeleteId(task.id);
                        setEditingId(null);
                      }}
                      disabled={isActing || actingTaskId !== null}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
