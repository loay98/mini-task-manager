"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { WorkersManagement } from "@/components/workers-management";

export default function WorkersPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    if (user?.role !== "manager") {
      router.replace("/login");
    }
  }, [token, user, router]);

  if (!token || user?.role !== "manager") return null;

  return (
    <main className="app-gradient min-h-screen p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <WorkersManagement />
      </div>
    </main>
  );
}
