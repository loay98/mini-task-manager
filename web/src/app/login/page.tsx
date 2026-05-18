"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { getApiMessage } from "@/lib/api-error";
import { useLoginMutation } from "@/lib/queries/auth";
import { useAuthStore } from "@/store/auth-store";
import { AuthRouteGuard } from "@/components/auth-route-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const login = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid credentials payload");
      return;
    }

    try {
      const data = await login.mutateAsync(parsed.data);

      if (data.user.role !== "manager") {
        setError("Only manager accounts can access this portal.");
        return;
      }

      setAuth(data.token, data.user);
      setEmail("");
      setPassword("");
      router.replace("/dashboard");
    } catch (err) {
      setError(getApiMessage(err, "Unable to login. Please verify credentials."));
    }
  };

  return (
    <main className="app-gradient flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Manager Login</CardTitle>
          <CardDescription>Sign in to create and assign tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="login-email"
                type="email"
                autoComplete="new-password"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email"
                disabled={login.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="login-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password"
                disabled={login.isPending}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <AuthRouteGuard
      mode="guest-only"
      redirectTo="/dashboard"
      fallback={
        <main className="app-gradient flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center py-10">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </span>
            </CardContent>
          </Card>
        </main>
      }
    >
      <LoginForm />
    </AuthRouteGuard>
  );
}
