import { Activity, Flame, Clock, Target, ShieldCheck } from 'lucide-react';
import { useRhythmStore, RhythmDifficulty } from '../state/useRhythmStore';
import { motion } from 'framer-motion';

export const RhythmHUD = () => {
    const { score, streak, difficulty, setDifficulty, bpm } = useRhythmStore();

    return (
        <div className="flex items-center gap-10">
            {/* Stats Area */}
            <div className="flex items-center gap-6 px-6 py-2 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                    <Target size={14} className="text-indigo-400" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 leading-none mb-1">SCORE</span>
                        <span className="text-sm font-black italic tracking-tighter text-white font-mono leading-none">{score.toLocaleString()}</span>
                    </div>
                </div>

                <div className="w-px h-6 bg-white/5" />

                <div className="flex items-center gap-2">
                    <Flame size={14} className={streak > 5 ? "text-orange-500 animate-pulse" : "text-white/20"} />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 leading-none mb-1">STREAK</span>
                        <span className={`text-sm font-black italic tracking-tighter font-mono leading-none ${streak > 0 ? 'text-white' : 'text-white/20'}`}>{streak}</span>
                    </div>
                </div>

                <div className="w-px h-6 bg-white/5" />

                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-emerald-400" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 leading-none mb-1">BPM</span>
                        <span className="text-sm font-black italic tracking-tighter text-white font-mono leading-none">{bpm}</span>
                    </div>
                </div>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-black rounded-xl border border-white/5 shrink-0">
                {(['Novice', 'Intermediate', 'Advanced', 'Pro', 'Virtuoso'] as RhythmDifficulty[]).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`
                            px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all relative
                            ${difficulty === d
                                ? 'text-white'
                                : 'text-white/20 hover:text-white/40'
                            }
                        `}
                    >
                        {difficulty === d && (
                            <motion.div
                                layoutId="diff-bg-rhythm"
                                className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{d}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
