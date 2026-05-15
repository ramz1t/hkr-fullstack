import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { FormField } from "@repo/ui/form-field";
import { useAuth } from "@repo/hooks/use-auth";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, ArrowRight } from "lucide-react";

const HEADERS = [
  "System Command Center",
  "Administrative Operations",
  "Secure Access Portal",
  "Identity & Access Management",
];

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [header, setHeader] = useState<string>("");

  useEffect(() => {
    setHeader(HEADERS[Math.floor(Math.random() * HEADERS.length)]);
  }, []);

  // If already authenticated as ADMIN, redirect to home
  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        navigate("/");
      } else {
        setError("Access denied: Admin credentials required.");
      }
    }
  }, [user, navigate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const email = data.get("email") as string;
      const password = data.get("password") as string;

      setError(null);
      setIsPending(true);
      try {
        await login(email, password);
        // The useEffect above will handle redirection if the user is ADMIN
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid admin credentials");
      } finally {
        setIsPending(false);
      }
    },
    [login]
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col md:flex-row bg-background relative overflow-hidden">
      {/* Background rich glow effects */}
      <div className="absolute top-1/4 left-1/4 size-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Side */}
      <div className="flex flex-col justify-between md:w-1/2 bg-gradient-to-br from-primary/10 via-background to-background border-r border-border/50 p-8 md:p-16 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-md">
            <Shield className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight font-heading">
              CasinoApp
            </h1>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Admin Gateway
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 my-12 md:my-0 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold w-max">
            <Lock className="size-3" /> Protected Access Only
          </div>
          <h2 className="text-3xl md:text-6xl font-extrabold leading-tight font-heading tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {header || "System Command Center"}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed border-l-2 border-primary/40 pl-4">
            Authorized personnel only. Ensure your session is conducted in a secure environment. Actions are logged and monitored.
          </p>
        </div>

        <div className="text-xs text-muted-foreground/60 flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} CasinoApp Operations. All rights reserved.</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col flex-1 items-center justify-center p-6 md:p-12 relative z-10">
        <Card className="w-full max-w-md border-border/60 shadow-2xl bg-card/60 backdrop-blur-xl relative">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Welcome back, Admin
            </CardTitle>
            <CardDescription className="text-sm">
              Authenticate with your administrative credentials to manage platform integrity.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormField
                label="Administrator Email"
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="bg-background/50 h-11"
              />
              <FormField
                label="Secure Password"
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                required
                className="bg-background/50 h-11"
              />

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in-50 duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-base mt-2 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Dashboard <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
