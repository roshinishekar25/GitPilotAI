import { Outlet, Link } from "react-router-dom";
import { Terminal } from "lucide-react";
import { Button } from "../components/Button";

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex items-center justify-between backdrop-blur-md bg-slate-950/50 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Terminal className="text-white w-5 h-5" />
          </div>
          <span className="font-display text-lg font-bold">GitPilot AI</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </nav>
      
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      
      <footer className="py-12 px-8 border-t border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-brand-600/50 flex items-center justify-center">
              <Terminal className="text-white w-4 h-4" />
            </div>
            <span className="font-display font-medium text-slate-400">GitPilot AI</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} GitPilot AI. Built for developers.
          </p>
        </div>
      </footer>
    </div>
  );
};
