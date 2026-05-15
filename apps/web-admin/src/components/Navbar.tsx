import { useAuth } from "@repo/hooks/use-auth";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/utils";
import { Dice6Icon, LogOut, Users } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

const NAV_TABS = [
  { label: "Users", icon: Users, to: "/users" },
  { label: "Games", icon: Dice6Icon, to: "/games" }
];

const HIDDEN_PATHS = ["/login"];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <aside className="sticky top-0 h-screen w-56 shrink-0 flex flex-col border-r border-border bg-background">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight font-heading text-primary"
        >
          CasinoAdmin
        </Link>
      </div>

      {isAuthenticated && (
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
          {NAV_TABS.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      )}

      {isAuthenticated && (
        <div className="mt-auto border-t border-border px-4 py-4 flex flex-col gap-2">
          <p
            className="truncate text-xs text-muted-foreground"
            title={user?.email}
          >
            {user?.email}
          </p>
          <Button
            onClick={() => void logout()}
            className="w-fit"
            variant="destructive"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      )}
    </aside>
  );
};

export default Navbar;
