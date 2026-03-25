import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, List, ArrowRightLeft, Layers, Pill, Users, BarChart3, Settings, ClipboardList, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { label: "Dashboards", path: "/dashboards/manager", icon: BarChart3 },
  { label: "Work Queues", path: "/queues", icon: LayoutGrid },
  { label: "Chase Lists", path: "/lists", icon: List },
  { label: "TOC", path: "/toc", icon: ArrowRightLeft },
  { label: "Programs", path: "/programs", icon: Layers },
  { label: "Med Adherence", path: "/med-adherence", icon: Pill },
  { label: "Patients", path: "/patients", icon: Users },
];

const managerItems = [
  { label: "List Mgmt", path: "/manager/lists", icon: ClipboardList },
  { label: "Productivity", path: "/manager/productivity", icon: TrendingUp },
];

export function TopNav() {
  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
      <span className="text-lg font-bold tracking-tight text-primary mr-6 shrink-0">CareNow</span>
      <nav className="flex items-center gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}

        {/* Manager section divider */}
        <div className="w-px h-6 bg-border mx-1.5" />

        {managerItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}

        <div className="w-px h-6 bg-border mx-1.5" />

        <NavLink
          to="/admin"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )
          }
        >
          <Settings className="h-4 w-4" />
          <span className="hidden lg:inline">Admin</span>
        </NavLink>
      </nav>
      <div className="ml-auto shrink-0">
        <ThemeToggle />
      </div>
    </header>
  );
}
