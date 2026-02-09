import { useState, useEffect, useRef } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { Play, Square, Ghost, Zap, Shuffle, Trash2 } from 'lucide-react';
import * as Tone from 'tone';
import { useAudioCleanup } from '../../../hooks/useAudioManager';
import { useMidiExport } from '../../../hooks/useMidiExport';
import { useMasteryStore } from '../../../core/store/useMasteryStore';


const engine = new MetronomeEngine();

// 0 = Rest, 1 = Ghost, 2 = Accent
const DEFAULT_PATTERN = [2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1];

const PRESETS = [
    { name: 'Basic Rock', pattern: [2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0] },
    { name: 'Funk 1', pattern: [2, 0, 0, 1, 0, 0, 2, 0, 0, 1, 2, 0, 0, 1, 0, 0] },
    { name: 'Son Clave', pattern: [2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 2, 0, 0, 0] },
    { name: 'Bossa Nova', pattern: [2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0] },
];

export default function SyncopationBuilder() {
    useAudioCleanup('syncopation');
    const { addExperience } = useMasteryStore();
    const { exportMidi } = useMidiExport();
    const [isPlaying, setIsPlaying] = useState(false);
    const [mode, setMode] = useState<'Build' | 'Dictation'>('Build');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [bpm, setBpm] = useState(100);
    const [swing, setSwing] = useState(0);
    const [pattern, setPattern] = useState<number[]>(DEFAULT_PATTERN);
    const [targetPattern, setTargetPattern] = useState<number[]>([]);
    const [activeStep, setActiveStep] = useState(-1);
    const [isChecking, setIsChecking] = useState(false);
    const [feedback, setFeedback] = useState<{ index: number; correct: boolean }[]>([]);

    // Animation loop for visual feedback
    const animationRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        engine.setPattern(pattern);
        return () => {
            engine.stop();
            if (animationRef.current !== undefined) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isPlaying) {
            engine.setPattern(pattern);
        }
    }, [pattern]);

    const updateVisuals = () => {
        if (!isPlaying) {
            setActiveStep(-1);
            return;
        }

        const beatDur = 60 / bpm;
        const barDur = beatDur * 4;
        const stepDur = beatDur / 4;

        const time = Tone.Transport.seconds;
        const currentStep = Math.floor((time % barDur) / stepDur);
        setActiveStep(currentStep);

        animationRef.current = requestAnimationFrame(updateVisuals);
    };

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
            setActiveStep(-1);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        } else {
            engine.setBpm(bpm);
            engine.setSwing(swing);
            engine.setPattern(pattern);
            engine.start();
            setIsPlaying(true);
            animationRef.current = requestAnimationFrame(updateVisuals);
        }
    };

    const handleStepClick = (index: number) => {
        const newPattern = [...pattern];
        // Cycle: 2 (Accent) -> 1 (Ghost) -> 0 (Rest) -> 2
        let nextVal = 0;
        if (newPattern[index] === 2) nextVal = 1;
        else if (newPattern[index] === 1) nextVal = 0;
        else nextVal = 2;

        newPattern[index] = nextVal;
        setPattern(newPattern);
    };

    const randomizeGroove = () => {
        const newPattern = pattern.map(() => {
            const r = Math.random();
            if (r > 0.75) return 2; // Accent
            if (r > 0.45) return 1; // Ghost
            return 0; // Rest
        });
        setPattern(newPattern);
    };

    const clearGroove = () => {
        setPattern(new Array(16).fill(0));
    };

    const loadPreset = (p: number[]) => {
        setPattern([...p]);
    };

    const startChallenge = () => {
        // Difficulty Logic
        let steps = 16;
        if (difficulty === 'Easy') steps = 4;
        if (difficulty === 'Medium') steps = 8;

        const newTarget = new Array(16).fill(0);
        for (let i = 0; i < steps; i++) {
            const r = Math.random();
            if (r > 0.7) newTarget[i] = 2; // Accent
            else if (r > 0.4 && difficulty !== 'Easy') newTarget[i] = 1; // Ghost
            else newTarget[i] = 0; // Rest
        }

        setTargetPattern(newTarget);
        setPattern(new Array(16).fill(0));
        setFeedback([]);
        setIsChecking(false);
    };

    const playTarget = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
            return;
        }
        engine.setPattern(targetPattern);
        engine.setBpm(bpm);
        engine.setSwing(swing);
        engine.start();
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(updateVisuals);
    };

    const checkAnswer = () => {
        const results = pattern.map((val, idx) => ({
            index: idx,
            correct: val === targetPattern[idx]
        }));
        setFeedback(results);
        setIsChecking(true);

        const allCorrect = results.every(r => r.correct);
        if (allCorrect) {
            const points = difficulty === 'Easy' ? 50 : difficulty === 'Medium' ? 100 : 200;
            addExperience('Rhythm', points);
        }
    };

    const handleExport = () => {
        const notes = pattern.map((val, i) => {
            if (val === 0) return null;
            return {
                name: 'C2',
                time: i * Tone.Time("16n").toSeconds(),
                duration: Tone.Time("16n").toSeconds(),
                velocity: val === 2 ? 1.0 : 0.6
            };
        }).filter(n => n !== null) as any[];

        exportMidi(notes, { bpm, name: 'Syncopation-Groove' });
    };

    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col gap-6 p-4">
            <div className="flex items-end justify-between px-2">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Syncopation Builder</h2>
                    <p className="text-[var(--text-muted)] mt-1">Design complex rhythmic textures.</p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] p-1 flex mr-4">
                        {(['Build', 'Dictation'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === m
                                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20'
                                    : 'text-[var(--text-muted)] hover:text-white'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    {mode === 'Build' ? (
                        <>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <Play size={16} className="rotate-90" />
                                Export MIDI
                            </button>
                            <button
                                onClick={clearGroove}
                                className="px-4 py-2 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/30 transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Clear
                            </button>
                            <button
                                onClick={randomizeGroove}
                                className="px-4 py-2 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-indigo-400 hover:border-indigo-500/30 transition-all text-sm font-medium flex items-center gap-2"
                            >
                                <Shuffle size={16} />
                                Randomize
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2">
                            {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold border transition-all ${difficulty === d
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-500'
                                        : 'bg-[var(--bg-panel)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Control Panel */}
            <div className="bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-10 shadow-xl">
                {/* Transport */}
                <button
                    onClick={togglePlay}
                    className={`
                        w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                        ${isPlaying
                            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-900/40 scale-95 ring-4 ring-red-500/20'
                            : 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-900/40 hover:scale-105 hover:shadow-indigo-900/60'
                        }
                    `}
                >
                    {isPlaying ? <Square fill="currentColor" size={32} /> : <Play fill="currentColor" size={40} className="ml-2" />}
                </button>

                {/* Sliders */}
                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-[var(--accent)] uppercase tracking-widest font-bold">Tempo</label>
                            <span className="text-xl font-mono text-white">{bpm} <span className="text-sm text-[var(--text-muted)]">BPM</span></span>
                        </div>
                        <input
                            type="range"
                            min="40"
                            max="200"
                            value={bpm}
                            onChange={(e) => { setBpm(Number(e.target.value)); engine.setBpm(Number(e.target.value)); }}
                            className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Swing</label>
                            <span className="text-xl font-mono text-white">{Math.round(swing * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={swing}
                            onChange={(e) => { setSwing(Number(e.target.value)); engine.setSwing(Number(e.target.value)); }}
                            className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                    </div>
                </div>

                {/* Presets */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Presets</span>
                    <div className="flex flex-col gap-1">
                        {PRESETS.map((p) => (
                            <button
                                key={p.name}
                                onClick={() => loadPreset(p.pattern)}
                                className="text-left text-sm text-[var(--text-secondary)] hover:text-white hover:bg-white/5 px-2 py-1 rounded transition-colors"
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pattern Grid */}
            <div className="bg-black/20 border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden">
                <div className="grid grid-cols-4 gap-4 md:gap-8">
                    {[0, 1, 2, 3].map(beat => (
                        <div key={beat} className="bg-white/5 rounded-2xl p-2 md:p-3 flex gap-2">
                            {[0, 1, 2, 3].map(sub => {
                                const index = beat * 4 + sub;
                                const val = pattern[index];
                                const isActive = activeStep === index;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleStepClick(index)}
                                        className={`
                                            w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-200 relative
                                            ${isActive ? 'ring-2 ring-white z-10 scale-105' : ''}
                                            ${isChecking && feedback[index] && !feedback[index].correct ? 'ring-2 ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''}
                                            ${isChecking && feedback[index] && feedback[index].correct ? 'ring-2 ring-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : ''}
                                            ${val === 2
                                                ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                                                : val === 1
                                                    ? 'bg-white/10 text-white/50 border border-white/10'
                                                    : 'bg-black/40 text-white/5 border border-white/5 hover:border-white/10'
                                            }
                                        `}
                                    >
                                        {val === 2 && <Zap size={20} fill="currentColor" />}
                                        {val === 1 && <Ghost size={16} />}
                                        {val === 0 && <span className="w-1.5 h-1.5 rounded-full bg-white/10" />}

                                        {/* Beat markers */}
                                        {sub === 0 && (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/20 font-bold">
                                                {beat + 1}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {mode === 'Dictation' && (
                    <div className="bg-[var(--bg-panel)] rounded-3xl p-6 border border-[var(--border-subtle)] flex items-center justify-between shadow-lg">
                        <div className="flex gap-4">
                            <button
                                onClick={startChallenge}
                                className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition shadow-lg"
                            >
                                New Challenge
                            </button>
                            <button
                                onClick={playTarget}
                                disabled={targetPattern.length === 0}
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition disabled:opacity-30 flex items-center gap-2"
                            >
                                <Play size={16} /> Listen to Target
                            </button>
                        </div>

                        <button
                            onClick={checkAnswer}
                            disabled={targetPattern.length === 0}
                            className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition shadow-lg disabled:opacity-30"
                        >
                            Submit Answer
                        </button>
                    </div>
                )}

                <div className="flex justify-center gap-8 text-xs text-white/40 font-medium uppercase tracking-wider">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-500" /> Accent</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white/10 border border-white/10" /> Ghost Note</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-black/40 border border-white/5" /> Rest</div>
                </div>
            </div>
        </div>
    );
}
