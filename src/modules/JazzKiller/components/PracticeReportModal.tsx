import { useState, useEffect, useRef } from 'react';
import { useScoringStore } from '../../../core/store/useScoringStore';
import { useMasteryTreeStore } from '../../../core/store/useMasteryTreeStore';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { CurriculumAnalysisService, XPContribution } from '../../../core/theory/CurriculumAnalysisService';
import { generatePerformanceCritique } from '../ai/jazzTeacherLogic';
import { X, Sparkles, RefreshCw, ChevronRight, Award, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PracticeReportModalProps {
    songTitle: string;
    songKey: string;
    onClose: () => void;
}

/**
 * Summarizes the practice session with AI feedback and detailed metrics (REQ-FB-04).
 * Now integrated with the Mastery Tree (REQ-MT-01).
 */
export function PracticeReportModal({ songTitle, songKey, onClose }: PracticeReportModalProps) {
    const {
        score,
        grade,
        totalNotesProcessed,
        perfectNotesCount,
        heatmap,
        measureTicks,
        resetScore
    } = useScoringStore();

    const { detectedPatterns } = usePracticeStore();
    const { addNodeXP, nodes } = useMasteryTreeStore();

    const [critique, setCritique] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [xpContributions, setXpContributions] = useState<XPContribution[]>([]);
    const [masteredNodeNames, setMasteredNodeNames] = useState<string[]>([]);
    const hasSyncExecuted = useRef(false);

    useEffect(() => {
        async function fetchCritique() {
            setIsLoading(true);
            const feedback = await generatePerformanceCritique({
                songTitle,
                key: songKey,
                score,
                grade,
                perfectNotesCount,
                totalNotesCount: totalNotesProcessed,
                heatmap,
                measureTicks
            });
            setCritique(feedback);
            setIsLoading(false);
        }

        // --- Mastery Tree Sync Engine ---
        if (!hasSyncExecuted.current && score > 0) {
            const contributions = CurriculumAnalysisService.calculateXPRewards(
                detectedPatterns,
                heatmap,
                songTitle
            );

            setXpContributions(contributions);

            const newlyMastered: string[] = [];

            contributions.forEach(c => {
                addNodeXP(c.nodeId, c.points);

                // Check if this contribution pushed the node to mastered
                // (This is a simplified check as the store update is async-ish)
                const node = nodes[c.nodeId];
                if (node && node.unlockStatus !== 'mastered') {
                    const currentXP = useMasteryTreeStore.getState().xpByNode[c.nodeId] || 0;
                    if (currentXP + c.points >= node.requiredPoints) {
                        newlyMastered.push(node.label);
                    }
                }
            });

            setMasteredNodeNames(newlyMastered);
            hasSyncExecuted.current = true;
        }

        fetchCritique();
    }, []);

    const handleNewSession = () => {
        resetScore();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-12 duration-500">
                {/* Decorative Header */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="absolute top-10 right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />

                <div className="p-8 flex flex-col gap-6 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-black tracking-tighter text-white">Session Summary</h2>
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-1">
                                {songTitle} • {songKey} Standard
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full text-neutral-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Notification for Mastered Nodes */}
                    <AnimatePresence>
                        {masteredNodeNames.map((name) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl flex items-center gap-4 shadow-lg"
                            >
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <Trophy size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tighter">Level Up!</h4>
                                    <p className="text-xs text-white/90">You mastered <strong>{name}</strong></p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-1 group hover:border-amber-500/30 transition-colors">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Overall Grade</span>
                            <span className={`text-6xl font-black drop-shadow-2xl transition-transform group-hover:scale-110 duration-500 ${grade.startsWith('S') ? 'text-amber-400' :
                                grade === 'A' ? 'text-emerald-400' :
                                    grade === 'B' ? 'text-blue-400' : 'text-neutral-600'
                                }`}>
                                {grade}
                            </span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-1">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Accuracy</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{score}</span>
                                <span className="text-xl font-black text-neutral-600">%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${score}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Mastery Tree Contributions */}
                    {xpContributions.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">Mastery Progress</span>
                            {xpContributions.map((cont, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-2xl border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <Award size={14} className="text-purple-400" />
                                        <span className="text-[11px] font-bold text-neutral-300">{cont.reason}</span>
                                    </div>
                                    <span className="text-xs font-mono font-black text-purple-400">+{cont.points} XP</span>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* AI Sensei Critique */}
                    <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-[32px] p-6 relative group">
                        <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 rounded-full flex items-center gap-2 shadow-lg">
                            <Sparkles size={12} className="text-white" />
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Nano-Powered Critique</span>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-4 gap-3">
                                <RefreshCw size={24} className="text-indigo-400 animate-spin" />
                                <span className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">Analyzing session data...</span>
                            </div>
                        ) : (
                            <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">
                                {critique || "Your sensei is speechless. Keep practicing!"}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleNewSession}
                            className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} /> New Session
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-neutral-900 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group"
                        >
                            Done <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
