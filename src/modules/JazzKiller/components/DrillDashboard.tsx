import { ChevronLeft, ChevronRight, Shuffle, RotateCcw } from 'lucide-react';
import { useIIVIDrillStore } from '../../../core/drills/useIIVIDrillStore';
import { patternDatabase } from '../../../core/drills/IIVIPatternDatabase';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import * as Tone from 'tone';

export function DrillDashboard() {
    const { drillSequence, currentPatternIndex, currentDrillMode, setDrillMode, setDrillSequence, nextPattern, prevPattern, reset } = useIIVIDrillStore();
    const { showGuideTones } = usePracticeStore();

    const currentPattern = drillSequence[currentPatternIndex];

    const startCycleOfFifths = () => {
        const sequence = patternDatabase.getCycleOfFifthsSequence();
        setDrillMode('cycle');
        setDrillSequence(sequence);
    };

    const startRandomDrill = () => {
        const all = patternDatabase.getAllPatterns();
        const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 12);
        setDrillMode('random');
        setDrillSequence(shuffled);
    };

    if (!currentDrillMode) {
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl z-50">
                <h3 className="text-lg font-bold text-white mb-4">ii-V-I Drill Modes</h3>
                <div className="flex gap-3">
                    <button onClick={startCycleOfFifths} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all">
                        Cycle of Fifths
                    </button>
                    <button onClick={startRandomDrill} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all">
                        Random Drill
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl z-50 min-w-[500px]">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-neutral-400">
                        {currentDrillMode === 'cycle' ? 'Cycle of Fifths' : 'Random Drill'}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1">
                        Pattern {currentPatternIndex + 1} of {drillSequence.length}
                    </p>
                </div>
                <button onClick={reset} className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2">
                    <RotateCcw size={12} />
                    Exit
                </button>
            </div>

            {currentPattern && (
                <div className="bg-neutral-800/50 rounded-xl p-4 mb-4">
                    <div className="text-center mb-3">
                        <h4 className="text-2xl font-bold text-white">{currentPattern.type} ii-V-I in {currentPattern.key}</h4>
                        <p className="text-xs text-neutral-500 mt-1">From: {currentPattern.songTitle}</p>
                    </div>

                    <div className="flex gap-3 justify-center mb-3">
                        {currentPattern.chords.map((chord, i) => (
                            <div key={i} className="px-4 py-2 bg-neutral-900 rounded-lg text-lg font-mono font-bold text-white">
                                {chord}
                            </div>
                        ))}
                    </div>

                    {showGuideTones && (
                        <div className="text-xs text-center text-neutral-500">
                            Guide tones visible on chart
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between gap-3">
                <button onClick={prevPattern} disabled={currentPatternIndex === 0} className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg transition-all">
                    <ChevronLeft size={20} />
                </button>

                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${((currentPatternIndex + 1) / drillSequence.length) * 100}%` }} />
                </div>

                <button onClick={nextPattern} disabled={currentPatternIndex === drillSequence.length - 1} className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg transition-all">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
