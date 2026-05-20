import { Helmet } from "react-helmet-async";
import { NavLink, Route, Routes } from "react-router-dom";
import Seeds from "./Seeds";
import { Wheat, Laptop, PiggyBank } from "lucide-react";
import { cn } from "@repo/ui/utils";
import Sessions from "./Sessions";
import Funds from "./Funds";

const NAV_TABS = [
  { label: "Seeds", icon: Wheat, to: "/profile/seeds" },
  { label: "Sessions", icon: Laptop, to: "/profile/sessions" },
  { label: "Funds", icon: PiggyBank, to: "/profile/funds" }
];

const Profile = () => {
  return (
    <section className="flex mx-auto w-full px-4 container grow">
      <Helmet>
        <title>Profile | CasinoApp</title>
      </Helmet>
      <aside className="w-56 shrink-0 min-h-full border-r border-border">
        <nav className="flex-1 flex flex-col gap-1 py-5 pr-5 ">
          {NAV_TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "px-3 h-10 text-sm font-medium transition-colors flex items-center gap-2",
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
      </aside>
      <div className="w-full">
        <Routes>
          <Route path="/seeds" element={<Seeds />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="*" element={"Select setting"} />
        </Routes>
      </div>
    </section>
  );
};

export default Profile;
