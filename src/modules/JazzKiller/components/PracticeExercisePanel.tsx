import { Target, Play, Check } from 'lucide-react';
import { usePracticeStore } from '../../../core/store/usePracticeStore';

const PATTERN_COLORS: Record<string, string> = {
    'MajorII-V-I': 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    'MinorII-V-i': 'border-purple-500 bg-purple-500/10 text-purple-400',
    'SecondaryDominant': 'border-amber-500 bg-amber-500/10 text-amber-400',
    'TritoneSubstitution': 'border-rose-500 bg-rose-500/10 text-rose-400',
    'ColtraneChanges': 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
};

export function PracticeExercisePanel() {
    const {
        detectedPatterns,
        practiceExercises,
        activeFocusIndex,
        focusOnPattern,
        clearFocus,
    } = usePracticeStore();

    if (detectedPatterns.length === 0) {
        return (
            <div className="w-80 bg-neutral-900/40 backdrop-blur-md border-l border-white/5 p-6 flex flex-col items-center justify-center text-center">
                <Target className="w-12 h-12 text-neutral-700 mb-4" />
                <p className="text-neutral-500 text-sm">
                    No practice patterns detected yet.
                </p>
                <p className="text-neutral-700 text-xs mt-2">
                    Load a jazz standard to see analysis
                </p>
            </div>
        );
    }

    return (
        <div className="w-80 bg-neutral-900/40 backdrop-blur-md border-l border-white/5 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Target size={16} />
                        Practice Drills
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                        {detectedPatterns.length} patterns detected
                    </p>
                </div>
                {activeFocusIndex !== null && (
                    <button
                        onClick={clearFocus}
                        className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        Clear Focus
                    </button>
                )}
            </div>

            {/* Pattern List */}
            <div className="space-y-3">
                {detectedPatterns.map((pattern, index) => {
                    const exercise = practiceExercises[index];
                    const isActive = activeFocusIndex === index;
                    const colorClass = PATTERN_COLORS[pattern.type] || PATTERN_COLORS['MajorII-V-I'];

                    return (
                        <div
                            key={`pattern-${index}`}
                            className={`
                p-4 rounded-xl border-2 transition-all
                ${isActive ? `${colorClass} ring-4 ring-white/20` : 'border-white/10 bg-neutral-800/50 hover:border-white/20'}
              `}
                        >
                            {/* Pattern header */}
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                                        <h4 className="text-sm font-bold text-neutral-200">
                                            {pattern.type.replace(/([A-Z])/g, ' $1').trim()}
                                        </h4>
                                    </div>
                                    {pattern.metadata.key && (
                                        <p className="text-xs text-neutral-500 mt-1">
                                            in {pattern.metadata.key}
                                        </p>
                                    )}
                                </div>
                                {isActive && (
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                                        <Check size={12} />
                                        Active
                                    </div>
                                )}
                            </div>

                            {/* Chords */}
                            {exercise && exercise.chords && (
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                    {exercise.chords.map((chord, i) => (
                                        <div
                                            key={i}
                                            className="px-3 py-1.5 bg-neutral-900 rounded-lg text-xs font-mono font-bold text-neutral-300 whitespace-nowrap"
                                        >
                                            {chord}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Roman numerals */}
                            {pattern.metadata.romanNumerals && (
                                <div className="text-xs text-neutral-500 mb-3">
                                    {pattern.metadata.romanNumerals.join(' → ')}
                                </div>
                            )}

                            {/* Practice recommendations */}
                            {exercise && (
                                <div className="space-y-2 text-xs">
                                    {exercise.practiceScale && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-neutral-600 font-bold">Scale:</span>
                                            <span className="text-neutral-400">{exercise.practiceScale}</span>
                                        </div>
                                    )}
                                    {exercise.practiceArpeggio && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-neutral-600 font-bold">Notes:</span>
                                            <span className="text-neutral-400 font-mono text-[10px]">{exercise.practiceArpeggio}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action button */}
                            <button
                                onClick={() => isActive ? clearFocus() : focusOnPattern(index)}
                                className={`
                  w-full mt-3 px-4 py-2 rounded-lg
                  flex items-center justify-center gap-2
                  text-xs font-black uppercase tracking-wider
                  transition-all active:scale-95
                  ${isActive
                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                        : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
                                    }
                `}
                            >
                                <Play size={14} />
                                {isActive ? 'Stop Drill' : 'Practice This'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Summary footer */}
            <div className="mt-auto pt-4 border-t border-white/5">
                <div className="text-xs text-neutral-600 leading-relaxed">
                    <p className="font-bold mb-2">💡 Practice Tips</p>
                    <ul className="space-y-1">
                        <li>• Start slow, focus on accuracy</li>
                        <li>• Learn the scales for each chord</li>
                        <li>• Practice arpeggios ascending & descending</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
