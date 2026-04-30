import { useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { TopNav } from "@/components/TopNav";
import { useMvpMode, isMvpAllowedPath } from "@/contexts/MvpModeContext";

export function AppLayout() {
  const { mvpMode } = useMvpMode();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // When MVP is on, redirect any non-MVP route to /lists.
    // Patient pages (/patients/:id) are excluded — drawer is the primary surface;
    // direct patient URLs are uncommon in MVP, so route them to /lists too.
    if (mvpMode && !isMvpAllowedPath(location.pathname)) {
      navigate("/lists", { replace: true });
    }
  }, [mvpMode, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <TopNav />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
