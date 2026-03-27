import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutGrid, List, ArrowRightLeft, Layers, Pill, Users, BarChart3, Settings, ClipboardList, TrendingUp, UserCog } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserRole, roleLabels, roleDescriptions, roleDefaultRoute, type UserRole } from "@/contexts/UserRoleContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allNavItems = [
  { label: "Dashboards", path: "/dashboards/manager", modulePrefix: "/dashboards", icon: BarChart3 },
  { label: "Work Queues", path: "/queues", modulePrefix: "/queues", icon: LayoutGrid },
  { label: "Chase Lists", path: "/lists", modulePrefix: "/lists", icon: List },
  { label: "TOC", path: "/toc", modulePrefix: "/toc", icon: ArrowRightLeft },
  { label: "Programs", path: "/programs", modulePrefix: "/programs", icon: Layers },
  { label: "Med Adherence", path: "/med-adherence", modulePrefix: "/med-adherence", icon: Pill },
  { label: "Patients", path: "/patients", modulePrefix: "/patients", icon: Users },
];

const managerItems = [
  { label: "List Mgmt", path: "/manager/lists", modulePrefix: "/manager", icon: ClipboardList },
  { label: "Productivity", path: "/manager/productivity", modulePrefix: "/manager", icon: TrendingUp },
];

export function TopNav() {
  const { role, setRole, hasAccess } = useUserRole();
  const navigate = useNavigate();

  const visibleNavItems = allNavItems.filter(item => hasAccess(item.modulePrefix));
  const showManagerSection = hasAccess("/manager");
  const showAdmin = hasAccess("/admin");

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    navigate(roleDefaultRoute[newRole]);
  };

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
      <span className="text-lg font-bold tracking-tight text-primary mr-4 shrink-0">CareCatalyst</span>

      <nav className="flex items-center gap-0.5">
        {visibleNavItems.map((item) => (
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

        {showManagerSection && (
          <>
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
          </>
        )}

        {showAdmin && (
          <>
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
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <Select value={role} onValueChange={(v) => handleRoleChange(v as UserRole)}>
          <SelectTrigger className="h-8 w-auto gap-1.5 text-xs border-dashed">
            <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(roleLabels) as UserRole[]).map((r) => (
              <SelectItem key={r} value={r}>
                <div>
                  <p className="text-sm font-medium">{roleLabels[r]}</p>
                  <p className="text-xs text-muted-foreground">{roleDescriptions[r]}</p>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ThemeToggle />
      </div>
    </header>
  );
}
