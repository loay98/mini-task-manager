"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkerSelect } from "@/components/worker-select";
import type { User } from "@/types/api";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  assignee_id: z.number().optional(),
});

interface TaskCreateFormProps {
  workers: User[];
  onSubmit: (input: { title: string; assignee_id?: number }) => Promise<void>;
  loading?: boolean;
}

export function TaskCreateForm({ workers, onSubmit, loading = false }: TaskCreateFormProps) {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = schema.safeParse({
      title,
      assignee_id: assigneeId ? Number(assigneeId) : undefined,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    await onSubmit(parsed.data);
    setTitle("");
    setAssigneeId("");
  };

  return (
    <form className="grid gap-3 md:grid-cols-3" onSubmit={handleSubmit}>
      <div className="md:col-span-2">
        <Input
          placeholder="Create a task title..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={loading}
        />
      </div>
      <WorkerSelect workers={workers} value={assigneeId} onChange={setAssigneeId} disabled={loading} />
      <div className="md:col-span-3 flex items-center gap-3">
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
