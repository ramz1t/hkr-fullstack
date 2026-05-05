"use client";

import { Button } from "@repo/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { FormField } from "@repo/ui/form-field";
import { useState } from "react";
import { loginAction, registerAction } from "@/lib/auth/actions";

export function LoginForm() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isLogin = tab === "login";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await (isLogin
      ? loginAction(formData)
      : registerAction(formData));
    if (result) {
      setError(result);
      setPending(false);
    } else {
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("callbackUrl") ?? "/profile";
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Enter your credentials to continue"
            : "Sign up and start playing today"}
        </CardDescription>
        <CardAction>
          <Button
            variant="link"
            onClick={() => {
              setTab(isLogin ? "register" : "login");
              setError(null);
            }}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <FormField
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="me@example.com"
            required
          />
          <FormField
            label="Password"
            id="password"
            name="password"
            type="password"
            required
            hint={
              isLogin ? (
                <a href="#" className="underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              ) : undefined
            }
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Please wait..." : isLogin ? "Login" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
