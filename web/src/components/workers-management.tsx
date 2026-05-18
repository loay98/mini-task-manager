"use client";

import { useState, type FormEvent } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchInput } from "@/components/search-input";
import { TableSkeleton } from "@/components/skeletons";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useCreateWorkerMutation,
  useDeleteWorkerMutation,
  useUpdateWorkerMutation,
  useWorkersQuery,
} from "@/lib/queries/workers";
import type { CreateWorkerPayload, UpdateWorkerPayload, User } from "@/types/api";

const WORKERS_PER_PAGE = 8;

const createWorkerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateWorkerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

interface WorkerDeleteDialogProps {
  worker: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

function WorkerDeleteDialog({
  worker,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: WorkerDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete worker?</AlertDialogTitle>
          <AlertDialogDescription>
            {worker
              ? `"${worker.name}" will be permanently removed. This action cannot be undone.`
              : "This worker will be permanently removed. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function WorkerCreateForm({
  onSubmit,
  loading = false,
}: {
  onSubmit: (payload: CreateWorkerPayload) => Promise<void>;
  loading?: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = createWorkerSchema.safeParse({ name, email, password });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    await onSubmit(parsed.data);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={handleSubmit}>
      <Input
        placeholder="Worker name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={loading}
      />
      <Input
        type="email"
        placeholder="Worker email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Temporary password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={loading}
      />
      <div className="flex items-center gap-3 lg:justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Worker"
          )}
        </Button>
      </div>
      {error ? <p className="lg:col-span-4 text-sm text-destructive">{error}</p> : null}
    </form>
  );
}

export function WorkersManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [actingWorkerId, setActingWorkerId] = useState<number | null>(null);

  const { debounced: debouncedSearch, isDebouncing } = useDebouncedValue(search, 500);

  const {
    data: workersData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useWorkersQuery(
    {
      page,
      per_page: WORKERS_PER_PAGE,
      search: debouncedSearch || undefined,
    },
    true
  );

  const createWorker = useCreateWorkerMutation();
  const updateWorker = useUpdateWorkerMutation();
  const deleteWorker = useDeleteWorkerMutation();

  const workers = workersData?.items ?? [];
  const pagination = workersData?.pagination ?? {
    current_page: 1,
    last_page: 1,
    per_page: WORKERS_PER_PAGE,
    total: 0,
  };

  const isSearchPending = isDebouncing || (isFetching && !isLoading);
  const hasActiveSearch = debouncedSearch.length > 0;

  const startEdit = (worker: User) => {
    setEditingId(worker.id);
    setDeleteTarget(null);
    setEditName(worker.name);
    setEditEmail(worker.email ?? "");
    setEditPassword("");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleCreateWorker = async (payload: CreateWorkerPayload) => {
    await createWorker.mutateAsync(payload);
    setPage(1);
  };

  const handleUpdateWorker = async (workerId: number) => {
    setEditError("");

    const parsed = updateWorkerSchema.safeParse({
      name: editName,
      email: editEmail,
      password: editPassword ? editPassword : undefined,
    });

    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    const payload: UpdateWorkerPayload = {
      name: parsed.data.name,
      email: parsed.data.email,
      ...(parsed.data.password ? { password: parsed.data.password } : {}),
    };

    await updateWorker.mutateAsync({ id: workerId, payload });
    setEditingId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setActingWorkerId(deleteTarget.id);
      await deleteWorker.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setActingWorkerId(null);
    }
  };

  const isBusy = actingWorkerId !== null || createWorker.isPending || updateWorker.isPending || deleteWorker.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workers</CardTitle>
        <CardDescription>Manage worker accounts and temporary credentials.</CardDescription>
        {isLoading || isFetching ? (
          <CardAction>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              {isSearchPending ? "Searching..." : "Loading..."}
            </span>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4 overflow-visible">
        <WorkerCreateForm onSubmit={handleCreateWorker} loading={createWorker.isPending} />

        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search workers..."
          isSearching={isSearchPending}
        />

        {isError ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to fetch workers."}
          </p>
        ) : null}

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : workers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => {
                const isActing = actingWorkerId === worker.id;
                const isEditing = editingId === worker.id;
                const createdAtLabel = worker.created_at
                  ? new Date(worker.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "-";

                if (isEditing) {
                  return (
                    <TableRow key={worker.id} className="bg-muted/30">
                      <TableCell colSpan={4}>
                        <div className="grid gap-3 md:grid-cols-3">
                          <Input
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            disabled={isActing}
                            aria-label="Worker name"
                          />
                          <Input
                            type="email"
                            value={editEmail}
                            onChange={(event) => setEditEmail(event.target.value)}
                            disabled={isActing}
                            aria-label="Worker email"
                          />
                          <Input
                            type="password"
                            value={editPassword}
                            onChange={(event) => setEditPassword(event.target.value)}
                            disabled={isActing}
                            placeholder="New password"
                            aria-label="New worker password"
                          />
                        </div>
                        {editError ? <p className="mt-2 text-sm text-destructive">{editError}</p> : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => void handleUpdateWorker(worker.id)}
                            disabled={isActing || isBusy}
                          >
                            {isActing ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isActing || isBusy}>
                            Cancel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow key={worker.id}>
                    <TableCell className="font-mono text-muted-foreground">#{worker.id}</TableCell>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.email}</TableCell>
                    <TableCell>{createdAtLabel}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(worker)}
                          disabled={isActing || isBusy || editingId !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteTarget(worker);
                            setEditingId(null);
                          }}
                          disabled={isActing || isBusy || editingId !== null}
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
        ) : (
          <p className="text-sm text-muted-foreground">
            {hasActiveSearch ? "No workers match your search." : "No workers yet."}
          </p>
        )}

        {!isLoading && pagination.total > 0 ? (
          <PaginationControls pagination={pagination} onPageChange={setPage} disabled={isFetching} />
        ) : null}
      </CardContent>

      <WorkerDeleteDialog
        worker={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => void handleDeleteConfirm()}
        isDeleting={actingWorkerId !== null && deleteTarget?.id === actingWorkerId}
      />
    </Card>
  );
}