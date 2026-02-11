import { useEffect } from 'react';
import { useGuidedPracticeStore, ROUTINE_CONFIG } from '../../../core/store/useGuidedPracticeStore';
import { useScoringStore } from '../../../core/store/useScoringStore';
import { Play, Pause, Square, Timer, ChevronRight, Zap } from 'lucide-react';

/**
 * Animated UI for the 15-minute Guided Practice routine (REQ-FB-01).
 * Manages stages: Scaling, Guide Tones, and Soloing.
 */
export function GuidedPracticePane() {
    const {
        isActive,
        isPaused,
        currentStageIndex,
        timeRemaining,
        startRoutine,
        pauseRoutine,
        resumeRoutine,
        stopRoutine,
        updateTimer
    } = useGuidedPracticeStore();

    const { score, grade } = useScoringStore();
    const currentStage = ROUTINE_CONFIG[currentStageIndex];

    // Timer logic
    useEffect(() => {
        let interval: any;
        if (isActive && !isPaused) {
            interval = setInterval(() => {
                updateTimer();
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, isPaused, updateTimer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((currentStage.durationSeconds - timeRemaining) / currentStage.durationSeconds) * 100;

    if (!isActive) {
        return (
            <div className="bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -z-10 transition-transform duration-700 group-hover:scale-150"></div>

                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                        <Zap size={20} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">The Teaching Machine</h3>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase">15-Minute Mastery Routine</p>
                    </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                    Start a structured 15-minute session designed by the AI. We'll cycle through foundation building, guide tone targeting, and expressive soloing.
                </p>

                <div className="space-y-3">
                    {ROUTINE_CONFIG.map((config, i) => (
                        <div key={i} className="flex items-center gap-3 opacity-60">
                            <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                            <span className="text-[11px] font-bold text-neutral-300">{config.label}</span>
                        </div>
                    ))}
                </div>

                <button
                    onClick={startRoutine}
                    className="w-full py-4 bg-purple-500 hover:bg-purple-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Play size={18} fill="currentColor" />
                    Start Session
                </button>
            </div>
        );
    }

    return (
        <div className="bg-neutral-900 border border-purple-500/30 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-right-8 duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                <div
                    className="h-full bg-purple-500 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Stage {currentStageIndex + 1} of 3</span>
                    <h3 className="text-lg font-black text-white leading-none">{currentStage.label}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 rounded-xl border border-white/10">
                    <Timer size={14} className="text-purple-400" />
                    <span className="text-lg font-mono font-black tabular-nums text-white leading-none">
                        {formatTime(timeRemaining)}
                    </span>
                </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-neutral-400 leading-relaxed italic">
                    {currentStage.description}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">Session Accuracy</span>
                    <span className="text-2xl font-black text-white tabular-nums">{score}%</span>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1">Current Grade</span>
                    <span className="text-2xl font-black text-amber-400">{grade}</span>
                </div>
            </div>

            <div className="flex gap-2">
                {isPaused ? (
                    <button
                        onClick={resumeRoutine}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Play size={16} fill="currentColor" /> Resume
                    </button>
                ) : (
                    <button
                        onClick={pauseRoutine}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Pause size={16} fill="currentColor" /> Pause
                    </button>
                )}
                <button
                    onClick={stopRoutine}
                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20"
                >
                    <Square size={16} fill="currentColor" />
                </button>
                <button
                    onClick={() => useGuidedPracticeStore.getState().nextStage()}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-xl transition-all"
                    title="Skip to next stage"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between text-[8px] font-black text-neutral-600 uppercase tracking-widest">
                    <span>Routine Map</span>
                    <span>15:00 Total</span>
                </div>
                <div className="flex gap-1">
                    {ROUTINE_CONFIG.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${i === currentStageIndex ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' :
                                i < currentStageIndex ? 'bg-purple-900' : 'bg-white/5'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
