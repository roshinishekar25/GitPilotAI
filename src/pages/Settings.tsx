import { motion } from "motion/react";
import { User, Bell, Palette, Shield, CreditCard, ChevronRight } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";

const SettingItem = ({ icon: Icon, title, desc, action }: any) => (
  <div className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
    <div className="flex items-center gap-4">
      <div className="p-2.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 group-hover:text-brand-400 group-hover:border-brand-500/30 transition-all">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-medium text-slate-100">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
    {action || <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300" />}
  </div>
);

export const Settings = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and app preferences.</p>
      </header>

      <div className="space-y-8">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Account</h3>
          <GlassCard className="p-2" hover={false}>
            <SettingItem 
              icon={User} 
              title="Profile Information" 
              desc="Update your name, email and avatar" 
            />
            <div className="h-px bg-white/5 mx-4" />
            <SettingItem 
              icon={Bell} 
              title="Notifications" 
              desc="Configure how you receive alerts" 
            />
            <div className="h-px bg-white/5 mx-4" />
            <SettingItem 
              icon={Shield} 
              title="Privacy & Security" 
              desc="Manage your password and active sessions" 
            />
          </GlassCard>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">App Preference</h3>
          <GlassCard className="p-2" hover={false}>
            <SettingItem 
              icon={Palette} 
              title="Appearance" 
              desc="Customize your theme and workspace colors"
              action={
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-white/10">
                  <button className="px-3 py-1 text-[10px] font-bold rounded-md bg-brand-600 text-white">DARK</button>
                  <button className="px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-300">LIGHT</button>
                </div>
              }
            />
          </GlassCard>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-1">Billing</h3>
          <GlassCard className="p-6 border-brand-500/20 bg-brand-600/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-lg">Free Plan</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-600/20 text-brand-400 border border-brand-500/20">Current</span>
                </div>
                <p className="text-sm text-slate-400">Next billing cycle starts on June 15, 2026.</p>
              </div>
              <Button variant="primary" size="sm" className="glow-purple">Upgrade to Pro</Button>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-black mb-2">Usage</p>
                <div className="flex justify-between items-end mb-1">
                  <p className="text-sm font-bold">0 / 10 analyses</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-0 bg-brand-500" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5">
                <p className="text-xs text-slate-500 uppercase font-black mb-2">Storage</p>
                <div className="flex justify-between items-end mb-1">
                   <p className="text-sm font-bold">0MB / 2GB</p>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full w-0 bg-blue-500" />
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        <div className="pt-10 flex border-t border-white/5">
           <Button variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400">
             Delete Account
           </Button>
        </div>
      </div>
    </div>
  );
};
