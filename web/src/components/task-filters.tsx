"use client";

import { SearchInput } from "@/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { WorkerCombobox } from "@/components/worker-combobox";
import type { TaskStatus } from "@/types/api";

export type TaskStatusFilter = TaskStatus | "all";
export type TaskAssigneeFilter = "all" | "unassigned" | string;

const statusLabels: Record<TaskStatusFilter, string> = {
  all: "All statuses",
  pending: "Pending",
  completed: "Completed",
};

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
        disabled={false}
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
          <span className="flex flex-1 items-center text-left">{statusLabels[status]}</span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{statusLabels.all}</SelectItem>
          <SelectItem value="pending">{statusLabels.pending}</SelectItem>
          <SelectItem value="completed">{statusLabels.completed}</SelectItem>
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
