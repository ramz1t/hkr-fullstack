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
import { useAuth } from "@repo/hooks/use-auth";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { LoginDto } from "@repo/types";
import { Helmet } from "react-helmet-async";

const HEADERS = [
  "It's your time to win.",
  "Fortune favors the bold.",
  "One spin away from everything.",
  "Your jackpot is waiting.",
  "The house never wins against you.",
  "Tonight, luck is on your side."
];

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/games";
  const [tab, setTab] = useState<"login" | "register">("login");
  const isLogin = tab === "login";
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [header, setHeader] = useState<string>("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const dto: LoginDto = {
        email: data.get("email") as string,
        password: data.get("password") as string
      };
      setError(null);
      setIsPending(true);
      try {
        if (isLogin) {
          await login(dto.email, dto.password);
        } else {
          await register(dto.email, dto.password);
        }
        navigate(redirectTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsPending(false);
      }
    },
    [isLogin, login, register, navigate, redirectTo]
  );

  useEffect(() => {
    setHeader(HEADERS[Math.floor(Math.random() * HEADERS.length)]);
  }, []);

  return (
    <section className="min-h-screen flex-col-reverse md:flex-row flex">
      <Helmet>
        <title>Auth | CasinoApp</title>
      </Helmet>
      <div className="flex flex-col justify-between md:w-1/2 bg-primary/10 border-r border-border p-12">
        <Link
          to="/"
          className="max-md:hidden text-2xl font-extrabold tracking-tight font-heading"
        >
          CasinoApp
        </Link>
        <div className="flex flex-col gap-4">
          <p className="text-2xl md:text-5xl font-extrabold leading-tight font-heading">
            {header}
          </p>
          <p className="text-muted-foreground text-lg">
            Join thousands of players. Play smart. Win big.
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 items-center justify-center p-8 gap-8">
        <div className="md:hidden text-2xl font-extrabold font-heading">
          CasinoApp
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
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
                autoFocus
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
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending
                  ? "Please wait..."
                  : isLogin
                    ? "Login"
                    : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Login;
