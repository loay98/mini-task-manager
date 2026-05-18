"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { ApiEnvelope, LoginResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const { token, user, setAuth } = useAuthStore();

  const [email, setEmail] = useState("manager@test.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && user?.role === "manager") {
      router.replace("/dashboard");
    }
  }, [token, user, router]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials payload");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", parsed.data);

      if (response.data.data.user.role !== "manager") {
        setError("Only manager accounts can access this portal.");
        return;
      }

      setAuth(response.data.data.token, response.data.data.user);
      router.replace("/dashboard");
    } catch {
      setError("Unable to login. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-gradient flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Manager Login</CardTitle>
          <CardDescription>Sign in to create and assign tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="manager@test.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password"
              />
            </div>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

