"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useWorkersQuery } from "@/lib/queries/workers";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search-input";
import { cn } from "@/lib/utils";

const UNASSIGNED = "unassigned";
const ALL_ASSIGNEES = "all";
const WORKERS_PER_PAGE = 8;

type WorkerComboboxMode = "assign" | "filter";

interface WorkerComboboxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  mode?: WorkerComboboxMode;
  defaultLabel?: string;
  placeholder?: string;
}

export function WorkerCombobox({
  value,
  onChange,
  disabled = false,
  mode = "assign",
  defaultLabel,
  placeholder,
}: WorkerComboboxProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const [displayLabel, setDisplayLabel] = useState<string | null>(() => {
    if (mode === "assign" && value) {
      return defaultLabel ?? null;
    }
    if (mode === "filter" && value === UNASSIGNED) {
      return "Unassigned";
    }
    return null;
  });

  const { debounced: debouncedSearch, isDebouncing } = useDebouncedValue(search, 300);

  const normalizedValue =
    mode === "assign" ? value || UNASSIGNED : value === "all" || !value ? ALL_ASSIGNEES : value;

  const { data, isFetching, isLoading } = useWorkersQuery(
    {
      search: debouncedSearch || undefined,
      page,
      per_page: WORKERS_PER_PAGE,
    },
    open
  );

  const workers = data?.items ?? [];
  const lastPage = data?.pagination.last_page ?? 1;
  const isSearchPending = isDebouncing || (isFetching && !isLoading);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!value || normalizedValue === UNASSIGNED || normalizedValue === ALL_ASSIGNEES) {
      setDisplayLabel(null);
      return;
    }

    const match = workers.find((worker) => String(worker.id) === normalizedValue);
    if (match) {
      setDisplayLabel(match.name);
    }
  }, [value, normalizedValue, workers]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setPage(1);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelStyle({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [debouncedSearch, open]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const displayValue = () => {
    if (mode === "filter") {
      if (normalizedValue === ALL_ASSIGNEES) return placeholder ?? "All assignees";
      if (normalizedValue === UNASSIGNED) return "Unassigned";
    } else if (normalizedValue === UNASSIGNED) {
      return placeholder ?? "Unassigned";
    }

    return displayLabel ?? `Worker #${normalizedValue}`;
  };

  const selectValue = (next: string, workerName?: string) => {
    if (mode === "assign") {
      const assigneeId = next === UNASSIGNED ? "" : next;
      onChange(assigneeId);
      setDisplayLabel(next === UNASSIGNED ? null : workerName ?? null);
    } else {
      onChange(next === ALL_ASSIGNEES ? "all" : next);
      if (next === ALL_ASSIGNEES) {
        setDisplayLabel(null);
      } else if (next === UNASSIGNED) {
        setDisplayLabel("Unassigned");
      } else {
        setDisplayLabel(workerName ?? null);
      }
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

  const dropdown = open ? (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: panelStyle.top,
        left: panelStyle.left,
        width: Math.max(panelStyle.width, 256),
        zIndex: 9999,
      }}
      className="rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md"
    >
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search workers..."
        isSearching={isSearchPending}
        className="mb-2"
      />

      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
              normalizedValue === option.value && "bg-muted"
            )}
            onClick={() => selectValue(option.value, option.label)}
          >
            {option.label}
            {normalizedValue === option.value ? <Check className="size-4" /> : null}
          </button>
        ))}

        {isLoading && workers.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading workers...
          </div>
        ) : null}

        {!isLoading && workers.length === 0 ? (
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
              onClick={() => selectValue(workerValue, worker.name)}
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
          disabled={isFetching || page <= 1}
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
          disabled={isFetching || page >= lastPage}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative w-full">
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="w-full justify-between font-normal"
      >
        <span className="truncate">{displayValue()}</span>
        <ChevronDown className={cn("size-4 shrink-0 opacity-50", open && "rotate-180")} />
      </Button>

      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </div>
  );
}
