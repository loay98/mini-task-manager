"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="w-full border-b bg-background/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="inline-flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              {user?.role === "manager" ? <ShieldCheck className="size-5" /> : <LayoutDashboard className="size-5" />}
            </div>
            <span className="truncate font-medium">Mini Task Manager</span>
          </Link>

          {user?.role === "manager" ? (
            <nav className="flex flex-wrap items-center gap-2">
              {[
                { href: "/tasks", label: "Manage tasks" },
                { href: "/workers", label: "Manage workers" },
              ].map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>

        {user ? (
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
