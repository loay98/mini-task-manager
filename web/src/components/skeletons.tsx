"use client";
import React from "react";

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-md bg-slate-100 p-3" />
      ))}
    </div>
  );
}
