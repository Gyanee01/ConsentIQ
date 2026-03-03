import React, { useState, useMemo } from 'react';
import { Shield, Search, AlertTriangle, CheckCircle, Info, Activity, FileText, Lock, Eye, Trash2, Github, X, Home, BarChart3, Zap, Target, History, Clock, FilterX, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import FloatingLines from './FloatingLines';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'high' | 'low'>('all');
  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('consent-iq-history');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate Global Stats
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const total = history.length;
    const avg = Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / total);
    const lowRisk = history.filter(h => h.score >= 80).length;
    const highRisk = history.filter(h => h.score < 50).length;
    return { total, avg, lowRisk, highRisk };
  }, [history]);

  // Filtered History for the Dashboard
  const filteredHistory = useMemo(() => {
    if (filterType === 'high') return history.filter(h => h.score < 50);
    if (filterType === 'low') return history.filter(h => h.score >= 80);
    return history;
  }, [history, filterType]);

  const saveHistory = (newHistory: any[]) => {
    setHistory(newHistory);
    localStorage.setItem('consent-iq-history', JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (e: React.MouseEvent, urlToDelete: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.url !== urlToDelete);
    saveHistory(newHistory);
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to wipe all intelligence reports?")) {
      saveHistory([]);
      setFilterType('all');
    }
  };

  const handleScan = async (e: React.FormEvent, customUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = customUrl || url;
    if (!targetUrl) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    setShowHistory(false);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const contentType = response.headers.get('content-type') || '';
      const rawBody = await response.text();
      let data: any = {};

      if (rawBody) {
        if (contentType.includes('application/json')) {
          data = JSON.parse(rawBody);
        } else {
          throw new Error(
            `API returned non-JSON response (${response.status}). Check Vercel API route and NLP_SERVICE_URL.`
          );
        }
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan URL');
      }

      setResult(data);
      
      const newHistory = [
        { url: data.url, score: data.overallScore, date: new Date().toISOString() },
        ...history.filter(h => h.url !== data.url)
      ].slice(0, 20);
      saveHistory(newHistory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-emerald-400" />;
    if (score >= 50) return <Info className="w-6 h-6 text-amber-400" />;
    return <AlertTriangle className="w-6 h-6 text-rose-400" />;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 50) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <FloatingLines 
          enabledWaves={["top","middle","bottom"]}
          lineCount={[5, 5, 5]}
          lineDistance={[5, 5, 5]}
          bendRadius={5}
          bendStrength={-0.5}
          interactive={true}
          parallax={true}
          linesGradient={['#6366f1', '#a855f7', '#4338ca']}
        />
      </div>

      {/* Header */}
      <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => { setResult(null); setFilterType('all'); }} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ConsentIQ</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <button onClick={() => setShowHistory(true)} className="hover:text-white transition-colors flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </button>
            <button onClick={() => setShowApiDocs(true)} className="hover:text-white transition-colors">API Docs</button>
            <button onClick={() => setShowAbout(true)} className="hover:text-white transition-colors">About</button>
            <button onClick={() => { setUrl(''); setResult(null); setFilterType('all'); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/20 transition-all text-xs uppercase tracking-widest font-black">
              <Zap className="w-4 h-4" />
              <span>New Scan</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-12 min-h-[calc(100vh-64px)] z-10">
        {/* Modals */}
        <AnimatePresence>
          {showAbout && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAbout(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-white">About ConsentIQ</h2>
                   <button onClick={() => setShowAbout(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <p className="text-slate-400 mb-8 leading-relaxed font-medium">
                  ConsentIQ is an AMD-optimized privacy scanner designed to identify risks in student-facing applications using local NLP models.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group">
                      <Shield className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-sm text-white">Private</h4>
                      <p className="text-[10px] text-slate-500">Local inference only.</p>
                   </div>
                   <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group">
                      <Activity className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                      <h4 className="font-bold text-sm text-white">ROCm</h4>
                      <p className="text-[10px] text-slate-500">GPU Accelerated.</p>
                   </div>
                </div>
                <button onClick={() => setShowAbout(false)} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all text-xs uppercase tracking-widest">Close</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showApiDocs && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApiDocs(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Local Intelligence API</h2>
                   <button onClick={() => setShowApiDocs(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-6">
                  <div className="bg-black/50 rounded-2xl p-6 border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-widest font-mono">POST</span>
                      <code className="text-indigo-400 font-mono text-sm">/api/scan</code>
                    </div>
                    <pre className="text-xs text-slate-500 font-mono bg-slate-950 p-4 rounded-xl border border-slate-900 overflow-x-auto">
{`{
  "url": "https://openai.com/policies/privacy-policy"
}`}
                    </pre>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-800">
                       <h4 className="text-white font-black text-xs mb-2 uppercase tracking-widest">Stealth Layer</h4>
                       <p className="text-xs text-slate-500 leading-relaxed">Playwright-Stealth bypasses bot detection on strict domains.</p>
                    </div>
                    <div className="p-5 bg-slate-800/30 rounded-2xl border border-slate-800">
                       <h4 className="text-white font-black text-xs mb-2 uppercase tracking-widest">NLP Brain</h4>
                       <p className="text-xs text-slate-500 leading-relaxed">DistilBERT zero-shot classification running locally.</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowApiDocs(false)} className="w-full mt-8 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all text-xs uppercase tracking-[0.2em]">Close Documentation</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHistory && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl w-full shadow-2xl relative z-10 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6 shrink-0">
                   <div className="flex items-center gap-3">
                      <History className="w-6 h-6 text-indigo-400" />
                      <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Scan History</h2>
                   </div>
                   <div className="flex items-center gap-2">
                      {history.length > 0 && (
                        <button 
                          onClick={clearAllHistory}
                          className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all text-[10px] font-black uppercase tracking-wider"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear All
                        </button>
                      )}
                      <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                   </div>
                </div>
                
                <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {history.length > 0 ? (
                    history.map((item, i) => (
                      <div key={i} className="group flex items-center gap-3">
                        <button 
                          onClick={() => { setUrl(item.url); handleScan(null as any, item.url); }}
                          className="flex-1 flex items-center justify-between p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all text-left"
                        >
                          <div className="flex items-center gap-4 truncate">
                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-lg shrink-0", getScoreColor(item.score).replace('text-', 'bg-'))} />
                            <div className="truncate">
                               <div className="text-sm font-bold text-slate-200 truncate font-mono">{new URL(item.url).hostname}</div>
                               <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.date).toLocaleString()}
                               </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-4 shrink-0">
                            <span className={cn("text-lg font-black", getScoreColor(item.score))}>{item.score}</span>
                            <Zap className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                          </div>
                        </button>
                        <button 
                          onClick={(e) => deleteHistoryItem(e, item.url)}
                          className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 border border-rose-500/20"
                          title="Delete Record"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                       <BarChart3 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                       <p className="text-slate-500 font-medium font-mono">No intelligence reports found.</p>
                    </div>
                  )}
                </div>
                
                <button onClick={() => setShowHistory(false)} className="w-full mt-6 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all text-xs uppercase tracking-[0.2em] shrink-0">Close History</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Dashboard / Hero Section */}
        <AnimatePresence mode="wait">
          {!result && !loading && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-8">
              
              {/* Hero Section */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
                  Data Nutrition <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence</span>
                </h1>
                <p className="text-xl text-slate-400 mb-10 font-medium">
                  Autonomous stealth scanning for student privacy.
                </p>

                <form onSubmit={handleScan} className="relative max-w-xl mx-auto">
                  <div className="relative flex items-center group">
                    <Search className="absolute left-5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter Privacy Policy URL..."
                      className="w-full pl-14 pr-36 py-5 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
                      required
                    />
                    <button type="submit" className="absolute right-2.5 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-xs uppercase tracking-widest font-black">
                      Analyze
                    </button>
                  </div>
                </form>

                {/* Error Flag */}
                {error && !loading && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 text-xs flex items-center justify-center gap-3 font-bold max-w-xl mx-auto">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Stats Bar (Interactive Filters) */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto">
                   <button onClick={() => setFilterType('all')} className={cn("bg-slate-900/50 backdrop-blur-sm border p-6 rounded-[2rem] text-center transition-all hover:bg-slate-800/50", filterType === 'all' ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-105 shadow-xl' : 'border-slate-800/50')}>
                      <div className="flex justify-center mb-3"><FileText className="w-5 h-5 text-indigo-400" /></div>
                      <div className="text-2xl font-black text-white">{stats.total}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Apps Analyzed</div>
                   </button>
                   <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 p-6 rounded-[2rem] text-center">
                      <div className="flex justify-center mb-3"><Shield className="w-5 h-5 text-emerald-400" /></div>
                      <div className="text-2xl font-black text-emerald-400">{stats.avg}%</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Avg Safety</div>
                   </div>
                   <button onClick={() => setFilterType('low')} className={cn("bg-slate-900/50 backdrop-blur-sm border p-6 rounded-[2rem] text-center transition-all hover:bg-slate-800/50", filterType === 'low' ? 'border-emerald-500 ring-4 ring-emerald-500/10 scale-105 shadow-xl' : 'border-slate-800/50')}>
                      <div className="flex justify-center mb-3"><Target className="w-5 h-5 text-purple-400" /></div>
                      <div className="text-2xl font-black text-white">{stats.lowRisk}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Safe Apps</div>
                   </button>
                   <button onClick={() => setFilterType('high')} className={cn("bg-slate-900/50 backdrop-blur-sm border p-6 rounded-[2rem] text-center transition-all hover:bg-slate-800/50 group", filterType === 'high' ? 'border-rose-500 ring-4 ring-rose-500/10 scale-105 shadow-xl' : 'border-slate-800/50')}>
                      <div className="flex justify-center mb-3"><AlertTriangle className="w-5 h-5 text-rose-400 group-hover:animate-pulse" /></div>
                      <div className="text-2xl font-black text-rose-400">{stats.highRisk}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">High Risks</div>
                   </button>
                </div>
              )}

              {/* Security History (Filtered) */}
              {history.length > 0 && (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8 px-4">
                     <div className="flex items-center gap-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">
                           {filterType === 'all' ? 'Security History' : filterType === 'high' ? 'High Risk Threats' : 'Verified Safe Apps'}
                        </h3>
                        {filterType !== 'all' && (
                           <button onClick={() => setFilterType('all')} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-slate-400">
                              <FilterX className="w-3 h-3" />
                           </button>
                        )}
                     </div>
                     <BarChart3 className="w-4 h-4 text-slate-700" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((item: any, i: number) => (
                        <div key={i} className="group flex items-center gap-3">
                          <button onClick={() => { setUrl(item.url); handleScan(null as any, item.url); }}
                            className="flex-1 flex items-center justify-between p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 rounded-[2rem] hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all text-left"
                          >
                            <div className="flex items-center gap-4 truncate">
                              <div className={cn("w-3 h-3 rounded-full shadow-lg shrink-0", getScoreColor(item.score).replace('text-', 'bg-'))} />
                              <div className="truncate">
                                 <div className="text-sm font-bold text-slate-200 truncate font-mono">{new URL(item.url).hostname}</div>
                                 <div className="text-[10px] text-slate-600 font-mono mt-0.5">{new Date(item.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 ml-4 text-right shrink-0">
                              <span className={cn("text-xl font-black tabular-nums", getScoreColor(item.score))}>{item.score}</span>
                              <Zap className="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                            </div>
                          </button>
                          <button 
                            onClick={(e) => deleteHistoryItem(e, item.url)}
                            className="p-4 bg-rose-500/10 text-rose-500 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20 border border-rose-500/20"
                            title="Delete Record"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-16 text-center bg-slate-900/20 rounded-[2rem] border border-dashed border-slate-800">
                         <Info className="w-10 h-10 text-slate-800 mx-auto mb-4" />
                         <p className="text-slate-600 font-black text-xs uppercase tracking-widest font-mono">No matching intelligence found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center pt-24 min-h-[400px]">
               <div className="relative w-32 h-32 mb-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-[6px] border-purple-500/10 border-t-purple-500 rounded-full" />
                  <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-400" />
               </div>
               <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-tight uppercase">Stealth Scanner Active</h3>
                  <div className="flex items-center justify-center gap-3 text-slate-500 font-mono text-sm">
                     <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                     Bypassing Anti-Bot Protocol...
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div key="results" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 pb-12">
              {/* Score Column */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Data Risk Index</h2>
                  <div className="relative inline-flex items-center justify-center mb-10">
                    <svg className="w-56 h-56 transform -rotate-90">
                      <circle cx="112" cy="112" r="102" className="stroke-slate-800" strokeWidth="14" fill="none" />
                      <motion.circle initial={{ strokeDasharray: "0 1000" }} animate={{ strokeDasharray: `${(result.overallScore / 100) * 641} 1000` }} transition={{ duration: 1.5, ease: "easeOut" }} cx="112" cy="112" r="102" className={cn("stroke-current shadow-lg shadow-current/20", getScoreColor(result.overallScore))} strokeWidth="14" fill="none" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className={cn("text-7xl font-black tracking-tighter", getScoreColor(result.overallScore))}>{result.overallScore}</span>
                    </div>
                  </div>
                  <div className={cn("inline-flex items-center gap-3 px-8 py-4 rounded-[2rem] border-2 font-black text-sm uppercase tracking-[0.2em]", getScoreBg(result.overallScore), getScoreColor(result.overallScore))}>
                    {getScoreIcon(result.overallScore)}
                    {getRiskLevel(result.overallScore)}
                  </div>
                </div>

                <div className="bg-black border border-slate-800 rounded-[3rem] p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-lg uppercase tracking-tight font-sans">Stealth Extract</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed font-mono bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800/50 max-h-64 overflow-y-auto">
                    "{result.textPreview}"
                  </p>
                </div>
              </div>

              {/* Breakdown Column */}
              <div className="lg:col-span-8">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden">
                  <div className="p-10 border-b border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/80 gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight uppercase font-sans">Nutrition Label</h2>
                      <p className="text-slate-500 mt-2 font-bold text-sm tracking-wide">Automated Intelligence Report</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700 transition-all text-xs font-black uppercase tracking-widest group"
                      >
                        Visit Source
                        <Zap className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-125 transition-transform" />
                      </a>
                      <div className="hidden md:block text-right">
                        <div className="text-[10px] font-black font-mono text-slate-600 tracking-widest uppercase space-y-1">
                          <div>ENGINE: STEALTH_PLAYWRIGHT</div>
                          <div>HOST: AMD_ROCM_LOCAL</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-0 divide-y divide-slate-800/50">
                    {Object.entries(result.categories).map(([key, cat]: [string, any]) => {
                      const icons: Record<string, any> = { dataRetention: Lock, thirdPartySharing: Eye, biometricUsage: Activity, targetedAdvertising: Search, dataDeletion: Trash2 };
                      const Icon = icons[key] || Info;
                      return (
                        <div key={key} className="p-8 hover:bg-white/5 transition-all flex flex-col sm:flex-row sm:items-center gap-8 group">
                          <div className="flex-1 flex items-start gap-6">
                            <div className={cn("p-5 rounded-3xl border-2 transition-all group-hover:scale-110 group-hover:rotate-3", getScoreBg(cat.score))}>
                              <Icon className={cn("w-8 h-8", getScoreColor(cat.score))} />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-black text-xl text-white tracking-tight font-sans">{cat.label}</h3>
                                <span className="text-[10px] font-black text-slate-500 bg-slate-800 px-3 py-1 rounded-full uppercase tracking-tighter">Impact: {cat.weight * 100}%</span>
                              </div>
                              <p className="text-slate-400 text-sm leading-relaxed max-w-lg font-medium">{cat.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8 sm:w-64 shrink-0">
                            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${cat.score}%` }} transition={{ duration: 1.5, ease: "circOut" }} className={cn("h-full rounded-full shadow-lg shadow-current/20", cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 50 ? 'bg-amber-500' : 'bg-rose-500')} />
                            </div>
                            <div className={cn("font-black text-3xl w-16 text-right tabular-nums", getScoreColor(cat.score))}>{cat.score}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
