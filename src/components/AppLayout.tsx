import { TopNav } from "@/components/TopNav";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <TopNav />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
