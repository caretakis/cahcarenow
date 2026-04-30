import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Globe, UserSquare2, Layers, LayoutGrid, List, ArrowRightLeft, Layers as LayersIcon, Pill, Users, BarChart3, Settings, ClipboardList, TrendingUp, UserCog, ChevronDown, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUserRole, roleLabels, roleDescriptions, roleDefaultRoute, type UserRole } from "@/contexts/UserRoleContext";
import { useMvpMode, isMvpAllowedPath } from "@/contexts/MvpModeContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Primary nav items — patient-first
const primaryNavItems = [
  { label: "Population", path: "/population", modulePrefix: "/population", icon: Globe },
  { label: "My Panel", path: "/panel", modulePrefix: "/panel", icon: UserSquare2 },
  { label: "Care Tiers", path: "/care-tiers", modulePrefix: "/care-tiers", icon: Layers },
];

// Workflow items — grouped
const workflowItems = [
  { label: "Work Queues", path: "/queues", modulePrefix: "/queues", icon: LayoutGrid },
  { label: "Chase Lists", path: "/lists", modulePrefix: "/lists", icon: List },
  { label: "TOC", path: "/toc", modulePrefix: "/toc", icon: ArrowRightLeft },
  { label: "Programs", path: "/programs", modulePrefix: "/programs", icon: LayersIcon },
  { label: "Med Adherence", path: "/med-adherence", modulePrefix: "/med-adherence", icon: Pill },
];

const utilityItems = [
  { label: "Dashboards", path: "/dashboards/manager", modulePrefix: "/dashboards", icon: BarChart3 },
];

const managerItems = [
  { label: "List Mgmt", path: "/manager/lists", modulePrefix: "/manager", icon: ClipboardList },
  { label: "Productivity", path: "/manager/productivity", modulePrefix: "/manager", icon: TrendingUp },
];

function NavItem({ item, end }: { item: typeof primaryNavItems[0]; end?: boolean }) {
  return (
    <NavLink
      to={item.path}
      end={end}
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
  );
}

export function TopNav() {
  const { role, setRole, hasAccess } = useUserRole();
  const { mvpMode, setMvpMode } = useMvpMode();
  const navigate = useNavigate();

  const accessFilter = (item: { modulePrefix: string }) =>
    hasAccess(item.modulePrefix) && (!mvpMode || isMvpAllowedPath(item.modulePrefix));

  const visiblePrimary = primaryNavItems.filter(accessFilter);
  const visibleWorkflows = workflowItems.filter(accessFilter);
  const visibleUtility = utilityItems.filter(accessFilter);
  const showManagerSection = hasAccess("/manager") && (!mvpMode || managerItems.some(i => isMvpAllowedPath(i.modulePrefix)));
  const visibleManager = managerItems.filter(accessFilter);
  const showAdmin = hasAccess("/admin") && !mvpMode;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    navigate(roleDefaultRoute[newRole]);
  };

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
      <span className="text-lg font-bold tracking-tight text-primary mr-4 shrink-0">CareCatalyst</span>

      <nav className="flex items-center gap-0.5">
        {/* Primary: Population, My Panel, Care Tiers */}
        {visiblePrimary.map(item => (
          <NavItem key={item.path} item={item} />
        ))}

        {/* Workflows dropdown + inline */}
        {visibleWorkflows.length > 0 && (
          <>
            <div className="w-px h-6 bg-border mx-1.5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden lg:inline">Workflows</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {visibleWorkflows.map(item => (
                  <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)} className="gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}

        {/* Utility items */}
        {visibleUtility.map(item => hasAccess(item.modulePrefix) && (
          <NavItem key={item.path} item={item} />
        ))}

        {showManagerSection && (
          <>
            <div className="w-px h-6 bg-border mx-1.5" />
            {managerItems.map((item) => (
              <NavItem key={item.path} item={item} />
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
