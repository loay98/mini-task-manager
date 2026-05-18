"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.replace("/login");
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navItems = [
    { href: "/tasks", label: "Manage tasks" },
    { href: "/workers", label: "Manage workers" },
  ];

  return (
    <>
      <header className="w-full border-b bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:min-h-20 sm:py-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/dashboard" className="inline-flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                {user?.role === "manager" ? <ShieldCheck className="size-5" /> : <LayoutDashboard className="size-5" />}
              </div>
              <span className="truncate font-medium">Mini Task Manager</span>
            </Link>

            {user?.role === "manager" ? (
              <nav className="hidden items-center gap-2 md:flex">
                {navItems.map((item) => {
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
            <div className="md:hidden">
              <Button variant="outline" size="icon-sm" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/40"
            onClick={closeMenu}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  {user?.role === "manager" ? <ShieldCheck className="size-5" /> : <LayoutDashboard className="size-5" />}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">Mini Task Manager</div>
                  <div className="text-xs text-muted-foreground">Menu</div>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={closeMenu} aria-label="Close menu">
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex flex-1 flex-col gap-2 px-4 py-4">
              {user?.role === "manager" ? (
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        onClick={closeMenu}
                        className={cn(
                          "rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              ) : null}

              {user ? (
                <div className="mt-auto border-t pt-4">
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
