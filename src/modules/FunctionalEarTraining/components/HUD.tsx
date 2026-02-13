import { Activity, Flame, Zap, Mic, MicOff } from 'lucide-react';
import { useFunctionalEarTrainingStore } from '../state/useFunctionalEarTrainingStore';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useInteractionStore } from '../../../core/state/useInteractionStore';
import { motion } from 'framer-motion';

export const HUD = () => {
    const { score, streak, difficulty, setDifficulty } = useFunctionalEarTrainingStore();
    const { start, stop, isActive } = useMicrophone();
    const { mode, setMode, isListening, setIsListening } = useInteractionStore();

    const toggleMic = async () => {
        if (mode === 'Mouse') {
            setMode('Mic');
            setIsListening(true);
            if (!isActive) await start();
        } else {
            setMode('Mouse');
            setIsListening(false);
        }
    };

    return (
        <div className="flex items-center gap-6 text-xs font-medium text-[var(--text-secondary)]">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[var(--accent)]" />
                    <span className="text-[var(--text-primary)] font-mono">{score.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Flame size={14} className={streak > 5 ? "text-orange-500" : "text-[var(--text-muted)]"} />
                    <span className="text-[var(--text-primary)] font-mono">{streak}</span>
                </div>
            </div>

            <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />

            <button
                onClick={toggleMic}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border
                    ${mode === 'Mic'
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                    }
                `}
            >
                {mode === 'Mic' ? <Mic size={14} /> : <MicOff size={14} />}
                <span className="text-[10px] uppercase font-bold tracking-wider">
                    {mode === 'Mic' ? 'Sing Answer' : 'Mic Off'}
                </span>
                {mode === 'Mic' && isListening && (
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    />
                )}
            </button>

            <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />

            <div className="flex gap-1">
                {(['Novice', 'Advanced', 'Pro'] as const).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`
                            px-2 py-0.5 rounded text-[10px] uppercase tracking-wider transition-colors
                            ${difficulty === d
                                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                            }
                        `}
                    >
                        {d}
                    </button>
                ))}
            </div>
        </div>
    );
};
