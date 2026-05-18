import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Bell, Search as SearchIcon, Moon } from "lucide-react";

export const DashboardLayout = () => {
  const location = useLocation();
  const getTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Project Dashboard";
    if (path.includes("analyze")) return "Analysis Result";
    if (path.includes("history")) return "History";
    if (path.includes("settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 flex flex-col relative">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-transparent backdrop-blur-sm z-10">
          <h1 className="text-lg font-medium text-slate-200">{getTitle()}</h1>
          
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              System Active
            </div>
            <button className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-slate-400">
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
