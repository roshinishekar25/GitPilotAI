import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Github, Calendar, Filter, ExternalLink, ArrowUpRight, Trash2, History as HistoryIcon } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";
import { useAuth } from "../contexts/AuthContext";

export const History = () => {
  const { user } = useAuth();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "analyses"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString() || "Just now"
      }));
      setHistoryItems(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "analyses");
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "analyses", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `analyses/${id}`);
    }
  };

  const filteredHistory = historyItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Analysis History</h1>
          <p className="text-slate-400">Review your previously analyzed repositories.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Filter history..."
               className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-brand-500/50 transition-colors"
             />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Sort
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHistory.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard className="h-full flex flex-col p-6 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-600/10 flex items-center justify-center text-brand-400 group-hover:bg-brand-600/20 transition-all">
                  <Github className="w-6 h-6" />
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleDelete(item.id)}
                     className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <Link to={`/dashboard/analyze/${item.id}`}>
                    <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                   </Link>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1 group-hover:text-brand-400 transition-colors truncate">{item.name}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1">
                   <Calendar className="w-3 h-3" />
                   {item.date}
                </span>
                <span>• {item.stats}</span>
              </div>
              
              <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-1">
                {item.description}
              </p>
              
              <Link to={`/dashboard/analyze/${item.id}`} className="w-full">
                <Button variant="outline" className="w-full text-xs py-2 group-hover:bg-brand-600 group-hover:text-white transition-all">
                  Reopen Analysis
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <HistoryIcon className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">No History Found</h2>
          <p className="text-slate-500 max-w-xs mb-8">
            {searchTerm ? "No results match your search." : "You haven't analyzed any repositories yet. Start by pasting a URL in the dashboard."}
          </p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
