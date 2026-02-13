import { useScoringStore } from '../../../core/store/useScoringStore';
import { HighPerformanceScoringBridge } from '../../ITM/components/HighPerformanceScoringBridge';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { Award, Target, TrendingUp, X, Sparkles } from 'lucide-react';

export type PerformanceScoringVariant = 'overlay' | 'sidebar';

/**
 * Real-time performance scoring UI (REQ-FB-02).
 * Shows Accuracy percentage, Grade, and matching note counts.
 * Use variant="sidebar" to render inline in the menu sidebar (no fixed positioning).
 */
export function PerformanceScoringOverlay({ variant = 'overlay' }: { variant?: PerformanceScoringVariant }) {
    const {
        score,
        grade,
        matchingNotesCount,
        totalNotesProcessed,
        isActive,
        stopScoring,
        startScoring,
        resetScore
    } = useScoringStore();

    const { start: startMic, isActive: micActive } = useMicrophone();
    const isSidebar = variant === 'sidebar';

    const handleStart = async () => {
        if (!micActive) await startMic();
        startScoring();
    };

    if (!isActive) {
        return (
            <>
                <HighPerformanceScoringBridge />
                <button
                    onClick={handleStart}
                    className={`flex items-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all group relative overflow-hidden ${isSidebar ? 'w-full px-3 py-2' : 'px-5 py-2.5'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/5 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <TrendingUp size={isSidebar ? 14 : 18} className="text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 leading-none">Training Machine</span>
                        <span className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-tighter">Enable Scoring</span>
                    </div>
                    {!isSidebar && (
                        <div className="ml-2 bg-indigo-500/20 p-1 rounded-lg">
                            <Sparkles size={12} className="text-indigo-300" />
                        </div>
                    )}
                </button>
            </>
        );
    }

    if (isSidebar) {
        return (
            <div className="mb-4 rounded-xl border border-white/10 bg-neutral-900/80 p-3 flex flex-col gap-3">
                <HighPerformanceScoringBridge />
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="bg-amber-500/10 p-1 rounded-lg border border-amber-500/20 shrink-0">
                            <Award size={12} className="text-amber-400" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] font-black uppercase tracking-wider text-neutral-300 block">Training Machine</span>
                            <span className="text-[8px] font-black text-amber-500/80 uppercase">Active</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={resetScore} className="text-[8px] text-neutral-500 hover:text-white uppercase font-black px-1.5 py-0.5 hover:bg-white/5 rounded" title="Reset">Reset</button>
                        <button onClick={stopScoring} className="p-1 hover:bg-white/10 rounded text-neutral-500 hover:text-white" title="Stop"><X size={12} /></button>
                    </div>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-2xl font-black tabular-nums text-white">{score}</span>
                        <span className="text-sm font-black text-white/40">%</span>
                    </div>
                    <span className={`text-lg font-black ${grade.startsWith('S') ? 'text-amber-400' : grade === 'A' ? 'text-emerald-400' : grade === 'B' ? 'text-blue-400' : 'text-neutral-500'}`}>{grade}</span>
                </div>
                <div className="flex justify-between text-[9px] font-black text-neutral-400">
                    <span>{matchingNotesCount} / {totalNotesProcessed}</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${score >= 90 ? 'bg-amber-500' : score >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900/60 backdrop-blur-3xl border border-white/10 rounded-[28px] p-5 shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4 min-w-[240px] animate-in zoom-in-95 slide-in-from-top-4 duration-300 relative group overflow-hidden">
            <HighPerformanceScoringBridge />

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] -z-10 rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>

            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-500/10 p-1.5 rounded-xl border border-amber-500/20">
                        <Award size={16} className="text-amber-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-200">Incredible Engine</span>
                        <span className="text-[8px] font-black text-amber-500/80 uppercase">Active Logic v1.0</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={resetScore}
                        className="text-[9px] text-neutral-500 hover:text-white uppercase font-black tracking-widest px-2 py-1 hover:bg-white/5 rounded-lg transition-all"
                    >
                        Reset
                    </button>
                    <button
                        onClick={stopScoring}
                        className="p-1.5 hover:bg-white/10 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-6 py-1">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black tracking-tighter text-white leading-none tabular-nums">
                            {score}
                        </span>
                        <span className="text-xl font-black text-white/30 tracking-tighter">%</span>
                    </div>
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1.5 ml-0.5">Pitch Accuracy</span>
                </div>

                <div className="relative group/grade">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-hover/grade:bg-white/10 transition-all"></div>
                    <div className="relative flex flex-col items-center justify-center bg-black/40 border border-white/10 w-20 h-20 rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        <span className={`text-4xl font-black drop-shadow-lg ${grade.startsWith('S') ? 'text-amber-400' :
                            grade === 'A' ? 'text-emerald-400' :
                                grade === 'B' ? 'text-blue-400' : 'text-neutral-500'
                            }`}>
                            {grade}
                        </span>
                        <span className="text-[9px] font-black text-neutral-500 -mt-1 uppercase tracking-widest">Grade</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-black">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${score > 70 ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-neutral-400 uppercase tracking-widest">Processing Data</span>
                    </div>
                    <span className="text-neutral-300 tabular-nums tracking-widest">{matchingNotesCount} <span className="text-neutral-600">/</span> {totalNotesProcessed}</span>
                </div>
                <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${score >= 90 ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' :
                            score >= 70 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-orange-600 to-orange-400'
                            }`}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 bg-indigo-500/5 border border-indigo-500/10 px-3 py-2.5 rounded-2xl transition-all hover:bg-indigo-500/10">
                <Target size={14} className="text-indigo-400 shrink-0" />
                <span className="text-[10px] font-bold text-indigo-100/70 leading-relaxed italic">
                    "The AI is analyzing your intonation against chord tones..."
                </span>
            </div>
        </div>
    );
}
