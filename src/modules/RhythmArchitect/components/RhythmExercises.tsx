import { useState, useEffect, useCallback } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { PolyrhythmEngine } from '../../../utils/polyrhythmEngine';
import { Play, RotateCcw, Layers, Activity, Repeat, Trophy, Wind } from 'lucide-react';
import { useMasteryStore } from '../../../core/store/useMasteryStore';
import { motion } from 'framer-motion';

const engine = new MetronomeEngine();
const polyEngine = new PolyrhythmEngine();

type ExerciseMode = 'Subdivision' | 'Polyrhythm' | 'Dictation';
type Difficulty = 'Novice' | 'Advanced' | 'Pro';

const POLY_OPTIONS = {
    Novice: [
        { a: 3, b: 2, label: '3 against 2' },
        { a: 2, b: 3, label: '2 against 3' },
        { a: 3, b: 4, label: '3 against 4' },
        { a: 4, b: 3, label: '4 against 3' },
    ],
    Advanced: [
        { a: 5, b: 4, label: '5 against 4' },
        { a: 4, b: 5, label: '4 against 5' },
        { a: 5, b: 2, label: '5 against 2' },
        { a: 2, b: 5, label: '2 against 5' },
        { a: 7, b: 4, label: '7 against 4' },
        { a: 4, b: 7, label: '4 against 7' },
    ],
    Pro: [
        { a: 5, b: 3, label: '5 against 3' },
        { a: 3, b: 5, label: '3 against 5' },
        { a: 7, b: 3, label: '7 against 3' },
        { a: 3, b: 7, label: '3 against 7' },
        { a: 7, b: 8, label: '7 against 8' },
        { a: 11, b: 4, label: '11 against 4' },
    ]
};

export default function RhythmExercises() {
    const { addExperience, updateStreak: updateGlobalStreak } = useMasteryStore();
    const [exerciseMode, setExerciseMode] = useState<ExerciseMode>('Subdivision');
    const [difficulty, setDifficulty] = useState<Difficulty>('Novice');
    const [isPlaying, setIsPlaying] = useState(false);
    const [targetSub, setTargetSub] = useState<number | null>(null);
    const [targetPoly, setTargetPoly] = useState<{ a: number, b: number } | null>(null);

    // Dictation state: 0=Rest, 1=Ghost, 2=Accent
    const [targetDictation, setTargetDictation] = useState<number[]>(new Array(16).fill(0));
    const [userDictation, setUserDictation] = useState<number[]>(new Array(16).fill(0));

    const [hasSwing, setHasSwing] = useState(false);
    const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [currentBpm, setCurrentBpm] = useState(60);

    useEffect(() => {
        // Reset BPM when difficulty or mode changes
        if (difficulty === 'Novice') setCurrentBpm(60);
        else if (difficulty === 'Advanced') setCurrentBpm(80);
        else setCurrentBpm(100);
    }, [difficulty, exerciseMode]);

    const startNewQuestion = useCallback(() => {
        setFeedback(null);
        setIsPlaying(false);
        engine.stop();
        polyEngine.stop();

        // Swing Logic
        if (difficulty === 'Pro' && exerciseMode !== 'Polyrhythm') {
            setHasSwing(Math.random() > 0.6);
        } else {
            setHasSwing(false);
        }

        if (exerciseMode === 'Subdivision') {
            const maxSub = difficulty === 'Novice' ? 4 : difficulty === 'Advanced' ? 7 : 12;
            const newSub = Math.floor(Math.random() * maxSub) + 1;
            setTargetSub(newSub);
            setTargetPoly(null);
        } else if (exerciseMode === 'Polyrhythm') {
            const pool = POLY_OPTIONS[difficulty];
            const pick = pool[Math.floor(Math.random() * pool.length)];
            setTargetPoly({ a: pick.a, b: pick.b });
            setTargetSub(null);
        } else if (exerciseMode === 'Dictation') {
            const newPattern = new Array(16).fill(0);
            // Difficulty logic for pattern generation
            const density = difficulty === 'Novice' ? 0.3 : difficulty === 'Advanced' ? 0.5 : 0.65;

            for (let i = 0; i < 16; i++) {
                // Always accent the downbeat (index 0) slightly more likely
                if (i === 0) {
                    newPattern[i] = 2; // Accent
                    continue;
                }

                // On beats (0, 4, 8, 12)
                const isBeat = i % 4 === 0;

                const roll = Math.random();

                if (roll < density) {
                    // Decide if Accent (2) or Ghost (1)
                    // Novice uses mostly Accents. Advanced uses Ghosts.
                    let ghostProb = difficulty === 'Novice' ? 0.0 : difficulty === 'Advanced' ? 0.3 : 0.5;

                    if (Math.random() < ghostProb && !isBeat) {
                        newPattern[i] = 1; // Ghost
                    } else {
                        newPattern[i] = 2; // Accent
                    }
                }
            }
            setTargetDictation(newPattern);
            setUserDictation(new Array(16).fill(0));
            setTargetSub(null);
            setTargetPoly(null);
        }
    }, [exerciseMode, difficulty]);

    useEffect(() => {
        startNewQuestion();
        return () => {
            engine.stop();
            polyEngine.stop();
        };
    }, [startNewQuestion, exerciseMode, difficulty]);

    const playQuestion = () => {
        setIsPlaying(true);
        engine.setSwing(hasSwing ? 0.5 : 0);

        if (exerciseMode === 'Subdivision' && targetSub) {
            engine.setBpm(currentBpm);
            engine.setSubdivision(targetSub);
            engine.start();

            // Calculate play duration: 2 bars
            const beatDur = 60 / currentBpm;
            const playDur = beatDur * 4 * 2;

            setTimeout(() => {
                engine.stop();
                setIsPlaying(false);
            }, playDur * 1000);

        } else if (exerciseMode === 'Polyrhythm' && targetPoly) {
            polyEngine.setBpm(currentBpm);
            polyEngine.setDivisions(targetPoly.a, targetPoly.b);
            polyEngine.start();

            const measureDur = (60 / currentBpm) * 4;
            setTimeout(() => {
                polyEngine.stop();
                setIsPlaying(false);
            }, measureDur * 2 * 1000);

        } else if (exerciseMode === 'Dictation' && targetDictation) {
            engine.setBpm(currentBpm);
            engine.setSubdivision(4); // 16th grid
            engine.setPattern(targetDictation);
            engine.start();

            const measureDur = (60 / currentBpm) * 4;
            setTimeout(() => {
                engine.stop();
                // engine.setPattern([]); // Don't verify pattern immediately 
                setIsPlaying(false);
            }, measureDur * 2 * 1000);
        }
    };

    const handleAnswer = (val: any) => {
        if (feedback) return;

        let isCorrect = false;
        let correctMsg = '';

        if (exerciseMode === 'Subdivision') {
            isCorrect = val === targetSub;
            const labels: any = { 1: 'Quarters', 2: 'Eighths', 3: 'Triplets', 4: 'Sixteenths', 5: 'Quintuplets', 6: 'Sextuplets', 7: 'Septuplets' };
            correctMsg = `It was ${labels[targetSub!] || targetSub + '-lets'}.`;
        } else if (exerciseMode === 'Polyrhythm') {
            isCorrect = val.a === targetPoly?.a && val.b === targetPoly?.b;
            correctMsg = `It was ${targetPoly?.a} : ${targetPoly?.b}`;
        } else if (exerciseMode === 'Dictation') {
            // Compare arrays exactly
            isCorrect = targetDictation.every((v, i) => v === userDictation[i]);
            correctMsg = isCorrect ? "Spot on!" : "Pattern mismatch.";
        }

        if (isCorrect) {
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 3 : 5;
            const points = (exerciseMode === 'Subdivision' ? 20 : 50) * multiplier;
            setFeedback({ success: true, msg: 'Perfect! 🎉' });
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);

            // Adaptive difficulty: Slightly increase BPM on success to keep it challenging
            if (currentBpm < 200) setCurrentBpm(prev => prev + 2);

            addExperience('Rhythm', points);
            updateGlobalStreak('Rhythm', streak + 1);
            setTimeout(startNewQuestion, 2000);
        } else {
            setFeedback({ success: false, msg: `Not quite! ${correctMsg}` });
            setStreak(0);
            updateGlobalStreak('Rhythm', 0);
        }
    };

    const toggleDictationStep = (idx: number) => {
        if (feedback) return;
        const newD = [...userDictation];
        // Cycle: 0 -> 2 (Accent) -> 1 (Ghost) -> 0
        let nextVal = 0;
        if (newD[idx] === 0) nextVal = 2; // Default to Accent first for easier input
        else if (newD[idx] === 2) nextVal = 1;
        else nextVal = 0;

        newD[idx] = nextVal;
        setUserDictation(newD);
    };

    return (
        <div className="w-full h-full p-6 pb-20 fade-in flex flex-col max-w-7xl mx-auto space-y-6">
            {/* Header / Stats */}
            <header className="flex flex-col md:flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shrink-0 shadow-lg gap-6 md:gap-0">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl ring-1 ring-indigo-500/20 shadow-inner">
                        <Trophy size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Rhythm Arena</h2>
                        <div className="flex gap-2 mt-2">
                            {(['Novice', 'Advanced', 'Pro'] as Difficulty[]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`
                                        text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-all
                                        ${difficulty === d
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white'}
                                    `}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 md:gap-12">
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">BPM</div>
                        <div className="text-3xl font-mono text-white/80">{currentBpm}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Score</div>
                        <div className="text-3xl font-mono text-emerald-400 font-bold">{score}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Streak</div>
                        <div className="text-3xl font-mono text-amber-500 font-bold flex items-center gap-2 justify-end">
                            {streak} <span className="text-lg">🔥</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mode Selector */}
            <div className="flex justify-center gap-4">
                {[
                    { id: 'Subdivision', icon: Layers, color: 'cyan' },
                    { id: 'Polyrhythm', icon: Activity, color: 'purple' },
                    { id: 'Dictation', icon: Repeat, color: 'amber' }
                ].map((m: any) => (
                    <button
                        key={m.id}
                        onClick={() => setExerciseMode(m.id as ExerciseMode)}
                        className={`
                            flex items-center gap-3 px-8 py-3 rounded-2xl transition-all duration-300 font-medium text-sm
                            ${exerciseMode === m.id
                                ? `bg-${m.color}-500/20 border-${m.color}-500 text-${m.color}-300 ring-1 ring-${m.color}-500/50 shadow-lg`
                                : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white'}
                            border
                        `}
                    >
                        <m.icon size={18} />
                        {m.id}
                    </button>
                ))}
            </div>

            {/* Game Area */}
            <div className="flex-1 bg-white/[0.02] backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-center min-h-[500px]">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5">
                    <div className={`h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-[1s] linear ${isPlaying ? 'w-full' : 'w-0'}`}
                        style={{ transitionDuration: isPlaying ? '2s' : '0.2s' }} // Dynamic based on duration? Simplified for now 
                    />
                </div>

                <div className="space-y-6 shrink-0 mb-10 text-center">
                    <h3 className="text-3xl md:text-5xl font-black text-white/90 tracking-tight flex flex-col items-center gap-4 justify-center">
                        <span className="text-lg font-medium text-white/30 uppercase tracking-widest">Target</span>
                        {exerciseMode === 'Subdivision' ? 'Identify the Grid' : exerciseMode === 'Polyrhythm' ? 'Identify the Polyrhythm' : 'Transcribe the Pattern'}
                    </h3>

                    <div className="flex justify-center">
                        {hasSwing && (
                            <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-400 px-4 py-2 rounded-full border border-amber-500/20 font-bold uppercase tracking-widest">
                                <Wind size={14} /> Swing Feel
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center mb-16">
                    <button
                        onClick={playQuestion}
                        disabled={isPlaying}
                        className={`
                            group w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500
                            ${isPlaying
                                ? 'bg-white/10 scale-95 shadow-inner'
                                : 'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:scale-110 shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_60px_rgba(79,70,229,0.5)]'
                            }
                        `}
                    >
                        {isPlaying ? (
                            <Activity className="text-white animate-pulse" size={48} />
                        ) : (
                            <Play fill="currentColor" size={48} className="text-white ml-2" />
                        )}
                    </button>
                </div>

                {feedback ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex flex-col items-center gap-6 ${feedback.success ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                        <div className="text-4xl font-black">{feedback.msg}</div>
                        {!feedback.success && <button
                            onClick={startNewQuestion}
                            className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold transition-all hover:scale-105"
                        >
                            <RotateCcw size={18} />
                            Next Question
                        </button>}
                    </motion.div>
                ) : (
                    <div className="w-full max-w-6xl mx-auto">
                        {exerciseMode === 'Subdivision' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(n => difficulty === 'Novice' ? n <= 4 : difficulty === 'Advanced' ? n <= 8 : true).map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => handleAnswer(n)}
                                        className="py-8 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all group"
                                    >
                                        <div className="text-4xl font-bold text-white group-hover:text-cyan-300">{n}</div>
                                        <div className="text-[10px] uppercase tracking-widest text-white/30 mt-2">
                                            {n === 4 ? '16ths' : n === 3 ? 'Triplets' : 'Notes'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {exerciseMode === 'Polyrhythm' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {POLY_OPTIONS[difficulty].map((opt: any) => (
                                    <button
                                        key={`${opt.a}:${opt.b}`}
                                        onClick={() => handleAnswer(opt)}
                                        className="py-10 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-3xl transition-all group"
                                    >
                                        <div className="text-5xl font-black text-white group-hover:text-purple-300 mb-2">{opt.a}:{opt.b}</div>
                                        <div className="text-xs uppercase tracking-widest text-white/30">{opt.label}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {exerciseMode === 'Dictation' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-3xl mx-auto p-4 bg-black/20 rounded-3xl">
                                    {[0, 1, 2, 3].map(beat => (
                                        <div key={beat} className="flex gap-1 md:gap-2">
                                            {[0, 1, 2, 3].map(sub => {
                                                const idx = beat * 4 + sub;
                                                const val = userDictation[idx];
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => toggleDictationStep(idx)}
                                                        className={`
                                                            w-full aspect-square rounded-lg md:rounded-xl transition-all duration-200 border
                                                            ${val === 2
                                                                ? 'bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                                                                : val === 1
                                                                    ? 'bg-white/20 border-white/30'
                                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'}
                                                        `}
                                                    >
                                                        {val === 2 && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-black/50" /></div>}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => handleAnswer(userDictation)}
                                        className="px-12 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all shadow-xl hover:scale-105"
                                    >
                                        Check Answer
                                    </button>
                                </div>
                                <p className="text-center text-xs text-white/30 uppercase tracking-widest">Click to cycle: Accent (Amber) &rarr; Ghost (Grey) &rarr; Rest (Dark)</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
