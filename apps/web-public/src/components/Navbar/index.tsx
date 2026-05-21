import { useAuth } from "@repo/hooks/use-auth";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/utils";
import { BadgeCheck, ChevronDown, Dice6Icon, LogOut, User } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import WalletLink from "./WalletLink";

const AUTH_TABS = [
  { label: <Dice6Icon />, to: "/games" },
  { label: <BadgeCheck />, to: "/verify" },
  { label: <WalletLink />, to: "/wallet" }
];

const HIDDEN_PATHS = ["/login"];

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <nav className="sticky top-0 inset-x-0 z-50 min-h-14 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full container items-center px-4 gap-4">
        <Link
          to="/"
          className="shrink-0 text-xl font-extrabold tracking-tight font-heading text-primary"
        >
          CasinoApp
        </Link>

        <div className="flex-1 flex items-center justify-center gap-1">
          {[...(isAuthenticated ? AUTH_TABS : [])].map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto shrink-0">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1.5 max-w-48">
                  <span className="truncate">{user?.email}</span>
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => void navigate("/profile/settings")}
                >
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    logout();
                    navigate("/login");
                  }}
                >
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
