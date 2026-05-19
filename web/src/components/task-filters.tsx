"use client";

import { SearchInput } from "@/components/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { WorkerCombobox } from "@/components/worker-combobox";
import type { TaskSortBy, TaskStatus, SortOrder } from "@/types/api";

export type TaskStatusFilter = TaskStatus | "all";
export type TaskAssigneeFilter = "all" | "unassigned" | string;

const statusLabels: Record<TaskStatusFilter, string> = {
  all: "All statuses",
  pending: "Pending",
  completed: "Completed",
};

const sortLabels: Record<TaskSortBy, string> = {
  id: "ID",
  title: "Task Name",
  created_at: "Assigned Date",
  updated_at: "Updated Date",
  due_date: "Due Date",
};

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: TaskStatusFilter;
  onStatusChange: (value: TaskStatusFilter) => void;
  assignee: TaskAssigneeFilter;
  onAssigneeChange: (value: TaskAssigneeFilter) => void;
  assignedBy?: string;
  onAssignedByChange?: (value: string) => void;
  sortBy?: TaskSortBy;
  onSortByChange?: (value: TaskSortBy) => void;
  sortOrder?: SortOrder;
  onSortOrderChange?: (value: SortOrder) => void;
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
  assignedBy = "all",
  onAssignedByChange,
  sortBy = "id",
  onSortByChange,
  sortOrder = "asc",
  onSortOrderChange,
  disabled,
  isSearchPending = false,
}: TaskFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
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

      {onAssignedByChange && (
        <WorkerCombobox
          mode="filter"
          value={assignedBy}
          onChange={onAssignedByChange}
          disabled={disabled}
          placeholder="All assigners"
        />
      )}

      {onSortByChange && (
        <div className="flex items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(next) => {
              if (next) onSortByChange(next as TaskSortBy);
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <span className="flex flex-1 items-center text-left">
                {sortLabels[sortBy]}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">{sortLabels.id}</SelectItem>
              <SelectItem value="title">{sortLabels.title}</SelectItem>
              <SelectItem value="created_at">{sortLabels.created_at}</SelectItem>
              <SelectItem value="updated_at">{sortLabels.updated_at}</SelectItem>
              <SelectItem value="due_date">{sortLabels.due_date}</SelectItem>
            </SelectContent>
          </Select>

          {onSortOrderChange && (
            <Button
              size="icon-sm"
              variant="outline"
              className="shrink-0 border-border/70 bg-background hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
              }}
              aria-label={sortOrder === "asc" ? "Switch to descending" : "Switch to ascending"}
            >
              {sortOrder === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
