import { useFunctionalEarTrainingStore } from './state/useFunctionalEarTrainingStore';
import { TendencyLevel } from './components/levels/TendencyLevel';
import { ModulationLevel } from './components/levels/ModulationLevel';
import { BassLevel } from './components/levels/BassLevel';
import { InterferenceLevel } from './components/levels/InterferenceLevel';
import { ProgressionsLevel } from './components/levels/ProgressionsLevel';
import { MelodyStepsLevel } from './components/levels/MelodyStepsLevel';
import { Brain, Sparkles } from 'lucide-react';
import { QuickExerciseJump } from '../../components/widgets/QuickExerciseJump';
import { useMasteryStore } from '../../core/store/useMasteryStore';

export function FunctionalEarTraining() {
    const { level, setLevel, difficulty, setDifficulty, score, streak } = useFunctionalEarTrainingStore();
    const { globalLevel } = useMasteryStore();

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            {/* Header / HUD */}
            <div className="flex justify-between items-center glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-cyan-500/20 text-cyan-400 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                        <Brain size={32} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Functional Ear Training</h1>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                                <Sparkles size={12} className="text-cyan-400" />
                                <span className="text-[10px] font-black text-white/60">LVL {globalLevel}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {(['Novice', 'Advanced', 'Pro'] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${difficulty === d ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">Score</div>
                        <div className="text-3xl font-mono text-cyan-400 leading-none">{score}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-1">Streak</div>
                        <div className="text-3xl font-mono text-purple-400 leading-none">🔥 {streak}</div>
                    </div>
                </div>
            </div>

            {/* Level Selector */}
            <div className="flex gap-2 bg-black/20 p-1 rounded-lg self-start">
                <button
                    onClick={() => setLevel('Tendency')}
                    className={`px-4 py-2 rounded-md transition-all ${level === 'Tendency' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Tendency Tones
                </button>
                <button
                    onClick={() => setLevel('Modulation')}
                    className={`px-4 py-2 rounded-md transition-all ${level === 'Modulation' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Modulation
                </button>
                <button
                    onClick={() => setLevel('Bass')}
                    className={`px-4 py-2 rounded-md transition-all ${level === 'Bass' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Bass Function
                </button>
                <button
                    onClick={() => setLevel('Interference')}
                    className={`px-4 py-2 rounded-md transition-all ${level === 'Interference' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Interference
                </button>
                <button
                    onClick={() => setLevel('Progressions')}
                    className={`px-4 py-2 rounded-md transition-all ${level === 'Progressions' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Progressions
                </button>
                <button
                    onClick={() => setLevel('MelodySteps')}
                    className={`px-4 py-2 rounded-md transition-all ${level === 'MelodySteps' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
                >
                    Melody Steps
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 glass-panel rounded-2xl p-8 relative overflow-hidden flex items-center justify-center">
                {level === 'Tendency' && <TendencyLevel />}
                {level === 'Modulation' && <ModulationLevel />}
                {level === 'Bass' && <BassLevel />}
                {level === 'Interference' && <InterferenceLevel />}
                {level === 'Progressions' && <ProgressionsLevel />}
                {level === 'MelodySteps' && <MelodyStepsLevel />}
            </div>

            <div className="mt-8">
                <QuickExerciseJump currentModule="EarTraining" />
            </div>
        </div>
    );
}
