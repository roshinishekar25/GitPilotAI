import { motion } from "motion/react";
import { Button } from "../components/Button";
import { Link } from "react-router-dom";
import { Github, Chrome, Zap, Shield, Sparkles } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

const BackgroundGlow = () => (
  <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/20 blur-[100px]" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px]" />
  </div>
);

export const LandingPage = () => {
  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex flex-col items-center">
      <BackgroundGlow />
      
      {/* Hero Section */}
      <section className="px-8 pt-20 pb-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-brand-500/20 text-brand-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Repository Onboarding</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-[1.1]"
        >
          Understand Any <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-500">
            GitHub Repository
          </span> Faster
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-slate-400 max-w-2xl mb-12"
        >
          AI-powered onboarding and repository intelligence for developers. 
          Stop digging through complex codebases and start contributing on Day 1.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto h-14 px-10">
              Get Started Free
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 gap-2">
            <Chrome className="w-5 h-5" />
            Continue with Google
          </Button>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 w-full max-w-5xl relative group"
        >
          <div className="absolute inset-0 bg-brand-600/10 blur-[80px] rounded-full group-hover:bg-brand-600/20 transition-all duration-700" />
          <div className="relative glass-dark rounded-3xl p-4 border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 bg-white/5 rounded-lg py-1 text-xs text-slate-500 text-center font-mono">
                ais-dev-gitpilot.app/dashboard
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 h-[400px]">
               <div className="col-span-3 space-y-3">
                 <div className="h-8 w-full bg-white/5 rounded-lg animate-pulse" />
                 <div className="h-8 w-3/4 bg-white/5 rounded-lg animate-pulse" />
                 <div className="h-8 w-1/2 bg-white/5 rounded-lg animate-pulse" />
               </div>
               <div className="col-span-9 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div className="h-32 bg-brand-600/5 rounded-2xl border border-brand-500/10 flex items-center justify-center">
                     <Zap className="text-brand-500 w-8 h-8 opacity-50" />
                   </div>
                   <div className="h-32 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex items-center justify-center">
                     <Github className="text-blue-500 w-8 h-8 opacity-50" />
                   </div>
                 </div>
                 <div className="h-48 bg-white/5 rounded-2xl border border-white/5 p-6 flex flex-col gap-3">
                   <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse" />
                   <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                   <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                   <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
                 </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats/Minimal Features */}
      <section className="w-full px-8 py-24 border-t border-white/5 bg-slate-950/50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <GlassCard glow="purple" className="flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-xl bg-brand-600/10 text-brand-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl uppercase tracking-wider">Fast Onboarding</h3>
            <p className="text-slate-400">Get a comprehensive overview of any codebase in seconds, not hours.</p>
          </GlassCard>
          
          <GlassCard glow="blue" className="flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl uppercase tracking-wider">AI Intelligence</h3>
            <p className="text-slate-400">Deep analysis of logic, dependencies, and complex patterns.</p>
          </GlassCard>
          
          <GlassCard className="flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-xl uppercase tracking-wider">Risk Detection</h3>
            <p className="text-slate-400">Identify legacy debt, confusing logic, and potential pitfalls early.</p>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};
