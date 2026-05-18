import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { cn } from "../lib/utils";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { 
  Github, 
  BookOpen, 
  FileCode, 
  AlertCircle, 
  Lightbulb, 
  Copy, 
  Check, 
  ChevronRight, 
  ExternalLink,
  ChevronDown,
  Layout,
  Terminal,
  Layers,
  Zap
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";

const ResultSection = ({ title, icon: Icon, color, children, defaultOpen = true }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between mb-4 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-display font-bold tracking-tight">{title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
};

export const AnalysisResult = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "analyses", id), (doc) => {
      if (doc.exists()) {
        setData({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `analyses/${id}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Progressively check for data availability
  const hasBasicInfo = !!data?.name && data.name !== "Untitled Repository";
  const hasSummary = !!data?.description && data.description !== "Analysis pending for this repository. Our AI agent is scanning the codebase to provide insights.";
  const hasRoadmap = Array.isArray(data?.roadmap) && data.roadmap.length > 0;
  const hasFiles = Array.isArray(data?.importantFiles) && data.importantFiles.length > 0;
  const hasRisks = !!data?.risks && data.risks !== "Risks will appear after deep analysis of the logic.";
  const isComplete = data?.status === "Complete";
  const isError = data?.status === "Error";

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all",
            !hasBasicInfo ? "bg-slate-800 border-white/10" : "bg-brand-600 border-brand-500/30 glow-purple"
          )}>
            <Github className={cn("w-8 h-8", !hasBasicInfo ? "text-slate-500" : "text-white")} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className={cn("text-3xl font-display font-bold", !hasBasicInfo ? "text-slate-500" : "text-white")}>
                {data?.name || "Untitled Repository"}
              </h1>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                isComplete 
                  ? "bg-brand-600/20 text-brand-400 border-brand-500/20"
                  : isError
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : "bg-brand-500/10 text-brand-400 border-brand-500/20"
              )}>
                {data?.status || "Starting..."}
              </span>
            </div>
            {!isComplete && !isError && data?.status && (
              <p className="text-brand-400 text-[10px] font-mono tracking-wider animate-pulse flex items-center gap-2 mb-2">
                <Zap className="w-3 h-3 fill-brand-400" /> {data.status}
              </p>
            )}
            <p className="text-slate-500 flex items-center gap-2">
              {hasSummary ? data.description : "Retrieving repository intelligence..."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleCopy} disabled={!data}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy Summary
          </Button>
          <Button variant="primary" className={cn(!isComplete && "opacity-50 cursor-not-allowed")} disabled={!isComplete}>
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8">
          {/* Summary */}
          <ResultSection title="Active Analysis" icon={Terminal} color="text-brand-400">
            <GlassCard className="p-6 bg-white/[0.03] border-white/10" hover={false}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Involved Repository</h2>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-2xl font-bold", !hasBasicInfo ? "text-slate-600" : "text-white")}>
                      {data?.name || "Pending Metadata"}
                    </span>
                  </div>
                </div>
              </div>
              <p className={cn("text-sm leading-relaxed mb-6", !hasSummary ? "text-slate-600 italic" : "text-slate-400")}>
                {hasSummary ? data.description : "Scanning repository structure..."}
              </p>
              <div className={cn("grid grid-cols-3 gap-4", !hasBasicInfo && "opacity-30")}>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Languages</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", !hasBasicInfo ? "bg-slate-400" : "bg-brand-400")}></span>
                    <span className="text-xs font-medium">{data?.language || "--"}</span>
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Architecture</p>
                  <span className="text-xs font-medium text-blue-400 uppercase tracking-tighter">
                    {!hasSummary ? "Scanning..." : "Detected"}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Stats</p>
                  <span className="text-xs font-medium">{data?.stats || "--"}</span>
                </div>
              </div>
            </GlassCard>
          </ResultSection>

          {/* Roadmap */}
          <ResultSection title="Learning Roadmap" icon={Layers} color="text-blue-400">
             <div className="p-6 space-y-4">
              <div className="relative pl-8 border-l border-white/10 space-y-8">
                {!hasRoadmap ? (
                  <p className="text-sm text-slate-500 italic">Analysis ongoing... generating roadmap.</p>
                ) : (
                  <div className="space-y-6">
                    {data.roadmap.map((item: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[37px] top-0 w-4 h-4 rounded-full border-4 border-[#120e1e] ${idx === 0 ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "bg-slate-700"}`} />
                        <h4 className="text-sm font-semibold text-slate-100">{item.step}</h4>
                        <p className="text-xs mt-1 text-slate-400">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ResultSection>

          {/* Important Files */}
          <ResultSection title="Important Files" icon={FileCode} color="text-yellow-400">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {!hasFiles ? (
                  <div className="col-span-full py-8 border border-dashed border-white/5 rounded-xl text-center text-slate-500 text-sm">
                    Scanning repository for critical files...
                  </div>
                ) : (
                  data.importantFiles.map((file: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-mono italic font-bold bg-brand-500/20 text-brand-400">
                        {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-medium truncate group-hover:text-white">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{file.reason}</p>
                      </div>
                      <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                    </div>
                  ))
                )}
             </div>
          </ResultSection>
        </div>

        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Beginner Tips */}
          <GlassCard className="p-6" glow={!hasBasicInfo ? "none" : "blue"}>
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className={cn("w-5 h-5", !hasBasicInfo ? "text-slate-600" : "text-yellow-400")} />
              <h3 className="font-display font-bold text-sm uppercase tracking-widest text-slate-500">Beginner Tips</h3>
            </div>
            {!hasBasicInfo ? (
              <p className="text-xs text-slate-600 italic">Analyze a repo to see onboarding tips.</p>
            ) : (
              <ul className="space-y-4">
                <li className="flex gap-3 items-start text-xs text-slate-400">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  Explore the source directory for core logic.
                </li>
                <li className="flex gap-3 items-start text-xs text-slate-400">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  Read the README for setup instructions.
                </li>
              </ul>
            )}
          </GlassCard>

          {/* Complexity Risks */}
          <div className={cn("border rounded-2xl p-5 transition-all", !hasRisks ? "bg-white/5 border-white/5 opacity-50" : "bg-red-500/5 border-red-500/20")}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className={cn("w-4 h-4", !hasRisks ? "text-slate-600" : "text-red-500")} />
              <h3 className={cn("text-xs font-bold uppercase tracking-widest", !hasRisks ? "text-slate-600" : "text-red-400")}>Complexity Risks</h3>
            </div>
            <p className={cn("text-[11px] leading-relaxed", !hasRisks ? "text-slate-600 italic" : "text-red-200/60")}>
              {hasRisks ? data.risks : "Risks will appear after deep analysis of the logic."}
            </p>
          </div>

          {/* Pro Tip Gradient */}
          <div className={cn(
            "flex-1 border rounded-2xl p-6 flex flex-col justify-end relative overflow-hidden min-h-[220px] transition-all",
            !isComplete ? "bg-slate-900 border-white/10" : "gradient-surface border-white/10"
          )}>
            <div className="absolute top-2 right-2 opacity-5">
              <Github className="w-24 h-24 text-white" />
            </div>
            <p className={cn("text-[10px] font-bold uppercase mb-2 tracking-tighter", !isComplete ? "text-slate-600" : "text-blue-200")}>
              {!isComplete ? "GETTING STARTED" : "PRO TIP"}
            </p>
            <p className={cn("text-lg font-bold leading-tight mb-4", !isComplete ? "text-slate-500" : "text-white")}>
              {!isComplete ? "Paste a repository URL on the dashboard to begin your AI-guided journey." : "Focus on modular packages for faster onboarding."}
            </p>
            {isComplete && (
              <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 text-white text-xs py-2">
                Deep Dive Packages
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
