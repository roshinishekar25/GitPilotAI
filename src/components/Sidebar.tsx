import { Sidebar as SidebarIcon, History, LayoutDashboard, Settings, LogOut, Terminal, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Search, label: "Analyze Repository", href: "/dashboard/analyze" },
  { icon: History, label: "History", href: "/dashboard/history" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

export const Sidebar = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside className="w-60 glass-dark h-screen sticky top-0 flex flex-col z-20">
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center glow-purple">
          <Terminal className="text-white w-6 h-6" />
        </div>
        <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          GitPilot AI
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                isActive
                  ? "bg-white/10 text-white border border-white/10 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )
            }
          >
            <item.icon className="w-5 h-5 opacity-80" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
            {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold truncate text-slate-100">{user?.displayName || 'User'}</p>
            <p className="text-[10px] text-slate-500 uppercase font-black">PRO Plan</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
