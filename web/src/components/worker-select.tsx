"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/types/api";

const UNASSIGNED = "unassigned";

interface WorkerSelectProps {
  workers: User[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function WorkerSelect({ workers, value, onChange, disabled }: WorkerSelectProps) {
  return (
    <Select
      value={value || UNASSIGNED}
      onValueChange={(next) => onChange(!next || next === UNASSIGNED ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {workers.map((worker) => (
          <SelectItem key={worker.id} value={String(worker.id)}>
            {worker.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
