"use client";
import React from "react";

export function EmptyState({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-slate-600">
      <div className="h-14 w-14 rounded-md bg-slate-100" />
      <div className="text-lg font-semibold">{title || "No items yet"}</div>
      <div className="max-w-sm text-sm">{description || "There are no records to display right now."}</div>
    </div>
  );
}
