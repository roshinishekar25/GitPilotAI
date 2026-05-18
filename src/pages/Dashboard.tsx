import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Github, Sparkles, Clock, Star, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

import { useAuth } from "../contexts/AuthContext";

export const Dashboard = () => {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const [recentRepos, setRecentRepos] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "analyses"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const repos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString() || "Just now"
      }));
      setRecentRepos(repos);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "analyses");
    });

    return () => unsubscribe();
  }, [user]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl || !user) return;
    
    setIsAnalyzing(true);
    
    try {
      // Extract repo name from URL
      const repoName = repoUrl.replace("https://github.com/", "").split("/").slice(0, 2).join("/");

      // 1. Create a pending record for immediate feedback
      const docRef = await addDoc(collection(db, "analyses"), {
        userId: user.uid,
        name: repoName || repoUrl,
        url: repoUrl,
        stats: "--",
        description: "Scanning repository...",
        language: "--",
        color: "text-blue-400",
        status: "Starting...",
        createdAt: serverTimestamp()
      });

      // 2. Navigate immediately to the results page where the user can see the progress
      navigate(`/dashboard/analyze/${docRef.id}`);

      // 3. Trigger the real analysis in the background
      // We use a fetch with a readable stream to receive progressive updates
      fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, userId: user.uid })
      }).then(async (res) => {
        if (!res.ok) throw new Error("Stream connection failed");
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const { updateDoc, doc, serverTimestamp: firestoreTimestamp } = await import("firebase/firestore");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("data: ")) {
              try {
                const data = JSON.parse(part.slice(6));
                if (data.error) throw new Error(data.error);

                // Update Firestore document progressively
                await updateDoc(doc(db, "analyses", docRef.id), {
                  ...data,
                  updatedAt: firestoreTimestamp()
                });
              } catch (e) {
                console.error("Error parsing stream chunk:", e);
              }
            }
          }
        }
      }).catch(err => {
        console.error("Backend analysis stream failed:", err);
        // Set an error state in the doc if possible
      }).finally(() => {
        setIsAnalyzing(false);
      });

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "analyses");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-12">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-display font-bold mb-2 text-white">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Explorer'}.
          </h1>
          <p className="text-slate-400">Which repository would you like to explore today?</p>
        </motion.div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-16"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30 group-focus-within:opacity-60 transition duration-1000"></div>
          <form 
            onSubmit={handleAnalyze} 
            className="relative flex bg-[#0c0816] rounded-2xl p-1.5 items-center border border-white/10"
          >
            <div className="pl-4 text-slate-500">
              <Github className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="Paste GitHub Repository URL..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-white px-4 py-4 placeholder-slate-600 text-lg outline-none"
            />
            <button 
              type="submit"
              disabled={isAnalyzing || !repoUrl}
              className="mr-1 px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </button>
          </form>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <span className="text-xs text-slate-500 uppercase font-bold tracking-widest mr-2">Quick Start:</span>
          <button 
            onClick={() => setRepoUrl("https://github.com/vercel/next.js")}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            vercel/next.js
          </button>
          <button 
            onClick={() => setRepoUrl("https://github.com/shadcn/ui")}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            shadcn/ui
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Analysis */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              Recent Analysis
            </h2>
            <Link to="/dashboard/history" className="text-sm text-brand-400 hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {recentRepos.length > 0 ? (
              recentRepos.map((repo, idx) => (
                <Link key={repo.id} to={`/dashboard/analyze/${repo.id}`} className="block">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                  >
                    <GlassCard className="p-4 hover:border-brand-500/30 transition-all group cursor-pointer overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <Github className={repo.color} />
                        </div>
                        <div>
                          <h3 className="font-medium group-hover:text-brand-400 transition-colors">{repo.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {repo.stats}
                            </span>
                            <span>• {repo.date}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 translate-x-0 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                      <div className="overflow-hidden">
                        <div className="pt-4 border-t border-white/5 mt-4">
                          <p className="text-xs text-slate-400 leading-relaxed mb-3">
                            {repo.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{repo.language}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </Link>
              ))
            ) : (
              <div className="py-12 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-sm text-slate-500">No recent analyses yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Tips / Insights */}
        <section>
          <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Quick Tips
          </h2>
          <div className="space-y-4">
            <GlassCard className="p-6 bg-brand-600/5 border-brand-500/10">
              <h3 className="font-bold text-brand-400 mb-2">Did you know?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                GitPilot AI analyzes the most active contributors and their coding patterns to help you find the right person to ask for help when stuck.
              </p>
            </GlassCard>
            
            <GlassCard className="p-6 bg-blue-600/5 border-blue-500/10">
              <h3 className="font-bold text-blue-400 mb-2">Public Repos only</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We currently only support public GitHub repositories. Private repository support is coming soon with GitHub App integration.
              </p>
              <Button variant="outline" size="sm" className="mt-4 border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                Join Waitlist
              </Button>
            </GlassCard>
          </div>
        </section>
      </div>
    </div>
  );
};
