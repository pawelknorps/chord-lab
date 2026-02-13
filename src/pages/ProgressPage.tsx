import { useState, useMemo } from 'react';
import { MasteryTreeView } from '../modules/ITM/components/MasteryTreeView';
import { ProgressTrendChart } from '../modules/ITM/components/ProgressTrendChart';
import { TrendAnalysisView } from '../modules/ITM/components/TrendAnalysisView';
import { useSessionHistoryStore } from '../core/store/useSessionHistoryStore';
import { useSoloStore } from '../core/store/useSoloStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Globe, Lock, Share2, History, Music } from 'lucide-react';
import { ItmSyncService } from '../core/services/itmSyncService';

export default function ProgressPage() {
    const { sessions } = useSessionHistoryStore();
    const { solos, updateSolo } = useSoloStore();
    const [selectedStandard, setSelectedStandard] = useState<string>('all');
    const [view, setView] = useState<'tree' | 'trends' | 'solos'>('tree');

    const filteredSessions = useMemo(() => {
        if (selectedStandard === 'all') return sessions;
        return sessions.filter(s => s.standardId === selectedStandard);
    }, [sessions, selectedStandard]);

    const filteredSolos = useMemo(() => {
        if (selectedStandard === 'all') return solos;
        return solos.filter(s => s.standardId === selectedStandard);
    }, [solos, selectedStandard]);

    const uniqueStandards = useMemo(() => {
        const standards = Array.from(new Set([
            ...sessions.map(s => s.standardId),
            ...solos.map(s => s.standardId)
        ]));
        return standards.sort();
    }, [sessions, solos]);

    const togglePublic = async (soloId: string, currentPublic: boolean) => {
        const solo = solos.find(s => s.id === soloId);
        if (!solo) return;

        const nextPublic = !currentPublic;
        // Sync to cloud
        const success = await ItmSyncService.syncSolo(solo, nextPublic);
        if (success) {
            updateSolo(soloId, { isPublic: nextPublic } as any);
        }
    };

    return (
        <div className="h-full w-full bg-[#050505] overflow-y-auto px-8 py-12">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header & View Switcher */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-5xl font-black text-white tracking-tighter">Your Progress</h1>
                            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <Cloud size={10} className="text-emerald-400" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Cloud Synced</span>
                            </div>
                        </div>
                        <p className="text-neutral-500 font-medium max-w-md">
                            Track your evolution from early attempts to jazz mastery through data and visual maps.
                        </p>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setView('tree')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'tree' ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'
                                }`}
                        >
                            Mastery Tree
                        </button>
                        <button
                            onClick={() => setView('trends')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'trends' ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'
                                }`}
                        >
                            Performance
                        </button>
                        <button
                            onClick={() => setView('solos')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'solos' ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'
                                }`}
                        >
                            Solo Vault
                        </button>
                    </div>
                </div>

                {/* Filters (only for trends/solos) */}
                {view !== 'tree' && (
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-2">Filter Standard:</span>
                        <select
                            value={selectedStandard}
                            onChange={(e) => setSelectedStandard(e.target.value)}
                            className="bg-black text-white text-sm font-bold px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="all">All Standards</option>
                            {uniqueStandards.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {view === 'tree' ? (
                        <motion.div
                            key="tree"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                        >
                            <MasteryTreeView />
                        </motion.div>
                    ) : view === 'trends' ? (
                        <motion.div
                            key="trends"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                    <ProgressTrendChart sessions={filteredSessions} />
                                </div>
                                <div className="lg:col-span-1">
                                    <TrendAnalysisView />
                                </div>
                            </div>

                            {/* Session List Mini-View */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <History size={14} className="text-neutral-500" />
                                    <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Recent Sessions</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredSessions.slice(0, 6).map((session, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white">{session.standardId}</span>
                                                    <span className="text-[10px] font-bold text-neutral-500">{new Date(session.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <span className="text-lg font-black text-indigo-400">{session.overallScore}%</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{session.bpm} BPM</span>
                                                <div className="h-[1px] flex-1 bg-white/5" />
                                                <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{session.measures.length} Measures</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="solos"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-2 px-1">
                                <Music size={14} className="text-neutral-500" />
                                <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Recorded Licks & Solos</h3>
                            </div>

                            {filteredSolos.length === 0 ? (
                                <div className="bg-white/5 rounded-3xl p-12 text-center border border-dashed border-white/10">
                                    <p className="text-neutral-500 font-bold uppercase text-xs tracking-[0.2em]">Your solo vault is empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSolos.map((solo) => (
                                        <div key={solo.id} className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-6 group hover:border-indigo-500/50 transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black text-white tracking-tight">{solo.standardId}</span>
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                                        {new Date(solo.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => togglePublic(solo.id, (solo as any).isPublic)}
                                                    className={`p-2 rounded-xl border transition-all ${(solo as any).isPublic
                                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                                            : 'bg-white/5 border-white/5 text-neutral-500 hover:text-white'
                                                        }`}
                                                    title={(solo as any).isPublic ? "Public on Hub" : "Private Session"}
                                                >
                                                    {(solo as any).isPublic ? <Globe size={16} /> : <Lock size={16} />}
                                                </button>
                                            </div>

                                            <div className="bg-black rounded-2xl p-4 mb-4 min-h-[60px] border border-white/5">
                                                <p className="text-indigo-200/50 font-mono text-[11px] leading-relaxed">
                                                    {(solo.musicalizedText || "| (Raw pitch capture) |").slice(0, 100)}
                                                    {(solo.musicalizedText?.length ?? 0) > 100 ? '...' : ''}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">BPM</span>
                                                        <span className="text-xs font-black text-white">{solo.bpm}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Notes</span>
                                                        <span className="text-xs font-black text-white">{solo.notes.length}</span>
                                                    </div>
                                                </div>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all">
                                                    <Share2 size={12} />
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
