"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";
import { buildListParams } from "@/lib/api-params";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ApiEnvelope, PaginatedResponse, User } from "@/types/api";

const UNASSIGNED = "unassigned";
const ALL_ASSIGNEES = "all";
const WORKERS_PER_PAGE = 8;

type WorkerComboboxMode = "assign" | "filter";

interface WorkerComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  mode?: WorkerComboboxMode;
  selectedLabel?: string;
  placeholder?: string;
}

export function WorkerCombobox({
  value,
  onChange,
  disabled = false,
  mode = "assign",
  selectedLabel,
  placeholder,
}: WorkerComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [workers, setWorkers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const normalizedValue =
    mode === "assign" ? value || UNASSIGNED : value === "all" || !value ? ALL_ASSIGNEES : value;

  const fetchWorkers = useCallback(async (searchTerm: string, pageNumber: number) => {
    setLoading(true);
    try {
      const response = await api.get<ApiEnvelope<PaginatedResponse<User>>>("/workers", {
        params: buildListParams({
          search: searchTerm || undefined,
          page: pageNumber,
          per_page: WORKERS_PER_PAGE,
        }),
      });

      setWorkers(response.data.data.items);
      setLastPage(response.data.data.pagination.last_page);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void fetchWorkers(debouncedSearch, page);
  }, [open, debouncedSearch, page, fetchWorkers]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [debouncedSearch, open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
    }
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (normalizedValue === UNASSIGNED || normalizedValue === ALL_ASSIGNEES) {
      setResolvedLabel(null);
      return;
    }

    const match = workers.find((worker) => String(worker.id) === normalizedValue);
    if (match) {
      setResolvedLabel(match.name);
    }
  }, [normalizedValue, workers]);

  const displayValue = () => {
    if (mode === "filter") {
      if (normalizedValue === ALL_ASSIGNEES) return placeholder ?? "All assignees";
      if (normalizedValue === UNASSIGNED) return "Unassigned";
    } else if (normalizedValue === UNASSIGNED) {
      return placeholder ?? "Unassigned";
    }

    return selectedLabel ?? resolvedLabel ?? `Worker #${normalizedValue}`;
  };

  const selectValue = (next: string) => {
    if (mode === "assign") {
      onChange(next === UNASSIGNED ? "" : next);
    } else {
      onChange(next === ALL_ASSIGNEES ? "all" : next);
    }
    setOpen(false);
  };

  const filterOptions =
    mode === "filter"
      ? [
          { value: ALL_ASSIGNEES, label: "All assignees" },
          { value: UNASSIGNED, label: "Unassigned" },
        ]
      : [{ value: UNASSIGNED, label: "Unassigned" }];

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="w-full justify-between font-normal"
      >
        <span className="truncate">{displayValue()}</span>
        <ChevronDown className={cn("size-4 shrink-0 opacity-50", open && "rotate-180")} />
      </Button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full min-w-[16rem] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md">
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search workers..."
              className="pl-8"
              autoFocus
            />
          </div>

          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                  normalizedValue === option.value && "bg-muted"
                )}
                onClick={() => selectValue(option.value)}
              >
                {option.label}
                {normalizedValue === option.value ? <Check className="size-4" /> : null}
              </button>
            ))}

            {loading && workers.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading workers...
              </div>
            ) : null}

            {!loading && workers.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">No workers found.</p>
            ) : null}

            {workers.map((worker) => {
              const workerValue = String(worker.id);
              return (
                <button
                  key={worker.id}
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                    normalizedValue === workerValue && "bg-muted"
                  )}
                  onClick={() => selectValue(workerValue)}
                >
                  <span className="truncate">
                    {worker.name}
                    {worker.email ? (
                      <span className="block truncate text-xs text-muted-foreground">{worker.email}</span>
                    ) : null}
                  </span>
                  {normalizedValue === workerValue ? <Check className="size-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {lastPage}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading || page >= lastPage}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
