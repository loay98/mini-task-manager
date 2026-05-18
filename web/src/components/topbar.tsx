"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="w-full border-b bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <span className="font-medium">Mini Task Manager</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? <span className="text-sm text-muted-foreground">{user.name}</span> : null}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
