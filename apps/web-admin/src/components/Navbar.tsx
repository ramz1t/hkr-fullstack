import { useAuth } from "@repo/hooks/use-auth";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/utils";
import {
  ChevronDown,
  LogOut,
  Shield,
  User,
  Users,
} from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

const NAV_TABS = [
  { label: <span className="flex items-center gap-2"><Users className="size-4" /> Users</span>, to: "/" },
];

const HIDDEN_PATHS = ["/login"];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <nav className="sticky top-0 inset-x-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center px-4 gap-4">
        <Link
          to="/"
          className="shrink-0 flex items-center gap-2 text-xl font-extrabold tracking-tight font-heading text-primary"
        >
          <Shield className="size-5 text-primary animate-pulse" />
          <span>CasinoAdmin</span>
        </Link>

        {isAuthenticated && (
          <div className="flex-1 flex items-center justify-start ml-6 gap-1">
            {NAV_TABS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="ml-auto shrink-0">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 max-w-48 border-primary/20 hover:border-primary/40 bg-primary/5"
                >
                  <User className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate text-xs font-medium">{user?.email}</span>
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border/50 mb-1 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-green-500 inline-block"></span>
                  Role: <strong className="text-foreground">{user?.role}</strong>
                </div>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => void logout()}
                  className="cursor-pointer"
                >
                  <LogOut className="size-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="shadow-sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
