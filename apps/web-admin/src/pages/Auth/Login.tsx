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
import { Link, useNavigate } from "react-router-dom";
import type { LoginDto } from "@repo/types";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState<boolean>(false);

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
        await login(dto.email, dto.password);
        navigate("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsPending(false);
      }
    },
    [login, navigate]
  );

  return (
    <section className="min-h-screen flex-col-reverse md:flex-row flex">
      <Helmet>
        <title>Login | CasinoAdmin</title>
      </Helmet>

      <div className="flex flex-col flex-1 items-center justify-center p-8 gap-8">
        <div className="text-3xl font-extrabold font-heading">CasinoAdmin</div>
        <Card className="w-full max-w-sm">
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
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Please wait..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Link
          to=""
          className="flex items-center gap-2 hover:text-primary font-semibold font-heading"
        >
          Open CasinoApp <ArrowRight size="16" />
        </Link>
      </div>
    </section>
  );
};

export default Login;
