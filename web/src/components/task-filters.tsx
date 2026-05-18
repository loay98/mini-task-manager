"use client";

import { SearchInput } from "@/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkerCombobox } from "@/components/worker-combobox";
import type { TaskStatus } from "@/types/api";

export type TaskStatusFilter = TaskStatus | "all";
export type TaskAssigneeFilter = "all" | "unassigned" | string;

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: TaskStatusFilter;
  onStatusChange: (value: TaskStatusFilter) => void;
  assignee: TaskAssigneeFilter;
  onAssigneeChange: (value: TaskAssigneeFilter) => void;
  disabled?: boolean;
  isSearchPending?: boolean;
}

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  assignee,
  onAssigneeChange,
  disabled,
  isSearchPending = false,
}: TaskFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search tasks or assignees..."
        disabled={disabled}
        isSearching={isSearchPending}
      />

      <Select
        value={status}
        onValueChange={(next) => {
          if (next) onStatusChange(next as TaskStatusFilter);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <WorkerCombobox
        mode="filter"
        value={assignee === "all" ? "all" : assignee}
        onChange={(next) => {
          if (next === "all" || !next) {
            onAssigneeChange("all");
            return;
          }
          if (next === "unassigned") {
            onAssigneeChange("unassigned");
            return;
          }
          onAssigneeChange(next);
        }}
        disabled={disabled}
        placeholder="All assignees"
      />
    </div>
  );
}
