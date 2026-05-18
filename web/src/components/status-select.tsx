"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskStatus } from "@/types/api";

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
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">pending</SelectItem>
        <SelectItem value="completed">completed</SelectItem>
      </SelectContent>
    </Select>
  );
}
