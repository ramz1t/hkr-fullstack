import { useAuth } from "@repo/hooks/use-auth";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@repo/ui/card";
import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const loginBtnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      loginBtnRef.current?.focus();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="grow flex flex-col-reverse md:flex-row">
        <div className="flex flex-col justify-between md:w-1/2 bg-primary/10 border-r border-border p-12">
          <div className="flex flex-col gap-3 items-center justify-center h-full">
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-extrabold leading-tight font-heading">
              Oops, not too fast
            </h1>
            <img src="/images/no-access.png" />
          </div>
        </div>

        <div className="flex flex-col flex-1 items-center justify-center p-8 gap-8">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Sign in to continue</CardTitle>
              <CardDescription>
                You must be logged in to view this page. Please sign in with
                your account to proceed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link
                  ref={loginBtnRef}
                  to={`/login?from=${encodeURIComponent(location.pathname)}`}
                >
                  Go to Login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
