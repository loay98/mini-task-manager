import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.ComponentProps<"select">;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        className
      )}
      {...props}
    />
  );
});

Select.displayName = "Select";

export { Select };
