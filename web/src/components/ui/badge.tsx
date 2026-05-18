import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "pending" | "completed";
}

export function Badge({ tone = "pending", className, ...props }: BadgeProps) {
  const tones = {
    pending: "bg-amber-100 text-amber-900",
    completed: "bg-emerald-100 text-emerald-900",
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}
      {...props}
    />
  );
}
