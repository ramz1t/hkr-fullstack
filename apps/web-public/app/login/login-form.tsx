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
import { Form } from "@repo/ui/form";
import { FormField } from "@repo/ui/form-field";
import { useState } from "react";

export function LoginForm() {
  const [tab, setTab] = useState<"login" | "register">("login");

  function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (tab === "login") {
      console.log("Login:", { email, password });
      // TODO: call login API
    } else {
      console.log("Register:", { name, email, password });
      // TODO: call register API
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>
          {tab === "login" ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {tab === "login"
            ? "Enter your credentials to continue"
            : "Sign up and start playing today"}
        </CardDescription>
        <CardAction>
          <Button
            variant="link"
            onClick={() => setTab(tab === "login" ? "register" : "login")}
          >
            {tab === "login" ? "Sign Up" : "Log In"}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <Form onSubmit={handleSubmit}>
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
              tab === "login" ? (
                <a href="#" className="underline-offset-4 hover:underline">
                  Forgot your password?
                </a>
              ) : undefined
            }
          />
          <Button type="submit" className="w-full">
            {tab === "login" ? "Login" : "Create account"}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
