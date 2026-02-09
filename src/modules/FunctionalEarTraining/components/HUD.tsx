import { Activity, Flame, Zap } from 'lucide-react';
import { useFunctionalEarTrainingStore } from '../state/useFunctionalEarTrainingStore';

export const HUD = () => {
    const { score, streak, difficulty, setDifficulty } = useFunctionalEarTrainingStore();

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
