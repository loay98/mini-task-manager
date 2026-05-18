"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import type { TaskStatus } from "@/types/api";

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  completed: "Completed",
};

interface StatusSelectProps {
  value: TaskStatus;
  onChange: (value: TaskStatus) => void;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as TaskStatus);
      }}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <span className="flex flex-1 items-center text-left">{statusLabels[value]}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">{statusLabels.pending}</SelectItem>
        <SelectItem value="completed">{statusLabels.completed}</SelectItem>
      </SelectContent>
    </Select>
  );
}
