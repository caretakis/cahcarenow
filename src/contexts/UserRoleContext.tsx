import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "coordinator" | "advanced_coordinator" | "care_manager" | "manager";

export const roleLabels: Record<UserRole, string> = {
  coordinator: "L1 · Coordinator",
  advanced_coordinator: "L2 · Advanced Coordinator",
  care_manager: "L3 · Care Manager",
  manager: "Manager",
};

export const roleDescriptions: Record<UserRole, string> = {
  coordinator: "Scheduling & administrative workflows",
  advanced_coordinator: "Transitions, complex scheduling & navigation",
  care_manager: "Clinical staff · RN / licensed clinician",
  manager: "Dashboards, list management & team productivity",
};

// Which nav modules each role can access
export const roleModules: Record<UserRole, string[]> = {
  coordinator: ["/queues", "/lists", "/patients"],
  advanced_coordinator: ["/queues", "/lists", "/toc", "/med-adherence", "/patients"],
  care_manager: ["/queues", "/lists", "/toc", "/programs", "/med-adherence", "/patients"],
  manager: ["/dashboards", "/queues", "/lists", "/toc", "/programs", "/med-adherence", "/patients", "/manager", "/admin"],
};

// Default landing page per role
export const roleDefaultRoute: Record<UserRole, string> = {
  coordinator: "/queues",
  advanced_coordinator: "/toc",
  care_manager: "/queues",
  manager: "/dashboards/manager",
};

interface UserRoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasAccess: (path: string) => boolean;
}

const UserRoleContext = createContext<UserRoleContextValue | null>(null);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem("carecat_role");
    if (stored && stored in roleLabels) return stored as UserRole;
    return "manager";
  });

  const setRole = (r: UserRole) => {
    setRoleState(r);
    localStorage.setItem("carecat_role", r);
  };

  const hasAccess = (path: string) => {
    const modules = roleModules[role];
    return modules.some(mod => path === mod || path.startsWith(mod + "/"));
  };

  return (
    <UserRoleContext.Provider value={{ role, setRole, hasAccess }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const ctx = useContext(UserRoleContext);
  if (!ctx) throw new Error("useUserRole must be used within UserRoleProvider");
  return ctx;
}
