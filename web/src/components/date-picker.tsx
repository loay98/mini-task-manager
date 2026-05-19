"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

function formatDateTimeForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateTimeInput(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function DateTimePicker({ date, onSelect, disabled, placeholder = "Pick date & time" }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [draftValue, setDraftValue] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setDraftValue(date ? formatDateTimeForInput(date) : "");
  }, [date]);

  const handleApply = () => {
    onSelect(parseDateTimeInput(draftValue));
    setOpen(false);
  };

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP p") : placeholder}
      </Button>

      {mounted && open
        ? createPortal(
            <div
              ref={popoverRef}
              className="fixed z-[9999] overflow-hidden rounded-2xl border border-border/70 bg-popover shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${Math.max(280, Math.min(420, position.width))}px`,
              }}
            >
              <div className="border-b border-border/60 bg-gradient-to-r from-muted/70 to-background px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold leading-none">Select date & time</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      setDraftValue("");
                      onSelect(undefined);
                      setOpen(false);
                    }}
                    disabled={disabled}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-3">
                <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    value={draftValue}
                    onChange={(event) => setDraftValue(event.target.value)}
                    className="h-9 w-full bg-transparent"
                    disabled={disabled}
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    <X className="mr-1.5 size-4" />
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={handleApply} disabled={disabled}>
                    <Check className="mr-1.5 size-4" />
                    Apply
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}