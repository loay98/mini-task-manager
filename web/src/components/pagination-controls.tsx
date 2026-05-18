"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function PaginationControls({ pagination, onPageChange, disabled }: PaginationControlsProps) {
  const { current_page, last_page, total, per_page } = pagination;
  const from = total === 0 ? 0 : (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {current_page} of {last_page}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
