import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// MVP mode restricts the app to a focused subset of workflows:
// - Chase Lists (/lists) [campaigns hidden]
// - List Builder (/lists/builder)
// - List Management (/manager/lists, /manager/lists/:id)
// Patient drawer (clicking a patient name) remains available everywhere.

export const MVP_ALLOWED_PREFIXES = ["/lists", "/manager/lists", "/manager/productivity"];

export function isMvpAllowedPath(path: string): boolean {
  return MVP_ALLOWED_PREFIXES.some(p => path === p || path.startsWith(p + "/") || path.startsWith(p + "?"));
}

interface MvpModeContextValue {
  mvpMode: boolean;
  setMvpMode: (v: boolean) => void;
  toggleMvpMode: () => void;
}

const MvpModeContext = createContext<MvpModeContextValue | null>(null);

export function MvpModeProvider({ children }: { children: ReactNode }) {
  const [mvpMode, setMvpModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("carecat_mvp_mode") === "true";
  });

  useEffect(() => {
    localStorage.setItem("carecat_mvp_mode", mvpMode ? "true" : "false");
  }, [mvpMode]);

  const setMvpMode = (v: boolean) => setMvpModeState(v);
  const toggleMvpMode = () => setMvpModeState(v => !v);

  return (
    <MvpModeContext.Provider value={{ mvpMode, setMvpMode, toggleMvpMode }}>
      {children}
    </MvpModeContext.Provider>
  );
}

export function useMvpMode() {
  const ctx = useContext(MvpModeContext);
  if (!ctx) throw new Error("useMvpMode must be used within MvpModeProvider");
  return ctx;
}
