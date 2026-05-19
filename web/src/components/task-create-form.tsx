"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkerCombobox } from "@/components/worker-combobox";
import { DateTimePicker } from "@/components/date-picker";

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  assignee_id: z.number().optional(),
  due_date: z.string().optional(),
});

interface TaskCreateFormProps {
  onSubmit: (input: { title: string; assignee_id?: number; due_date?: string }) => Promise<void>;
  loading?: boolean;
}

export function TaskCreateForm({ onSubmit, loading = false }: TaskCreateFormProps) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = schema.safeParse({
      title,
      assignee_id: assigneeId ? Number(assigneeId) : undefined,
      due_date: dueDate ? toDateTimeLocalValue(dueDate) : undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    await onSubmit(parsed.data);
    setTitle("");
    setAssigneeId("");
    setDueDate(undefined);
  };

  return (
    <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
      <div className="md:col-span-2">
        <Input
          placeholder="Create a task title..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={loading}
        />
      </div>
      <WorkerCombobox value={assigneeId} onChange={setAssigneeId} disabled={loading} />
      <DateTimePicker date={dueDate} onSelect={setDueDate} disabled={loading} placeholder="Due date & time" />
      <div className="md:col-span-4 flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Task"
          )}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
