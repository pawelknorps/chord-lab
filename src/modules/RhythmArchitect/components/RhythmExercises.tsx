import { useState, useEffect, useCallback } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { PolyrhythmEngine } from '../../../utils/polyrhythmEngine';
import { Play, RotateCcw, CheckCircle2, XCircle, Target, Layers, Activity, Repeat, Wind } from 'lucide-react';
import { useMasteryStore } from '../../../core/store/useMasteryStore';

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
    const [targetDictation, setTargetDictation] = useState<boolean[]>(new Array(16).fill(false));
    const [userDictation, setUserDictation] = useState<boolean[]>(new Array(16).fill(false));
    const [hasSwing, setHasSwing] = useState(false);
    const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [currentBpm, setCurrentBpm] = useState(50); // Default Novice

    useEffect(() => {
        // Reset BPM when difficulty or mode changes
        if (difficulty === 'Novice') setCurrentBpm(50);
        else if (difficulty === 'Advanced') setCurrentBpm(80);
        else setCurrentBpm(100);
    }, [difficulty, exerciseMode]);

    const startNewQuestion = useCallback(() => {
        setFeedback(null);
        setIsPlaying(false);
        engine.stop();
        polyEngine.stop();

        if (difficulty === 'Pro') {
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
            const newPattern = new Array(16).fill(false);
            const density = difficulty === 'Novice' ? 0.3 : difficulty === 'Advanced' ? 0.5 : 0.65;
            for (let i = 0; i < 16; i++) {
                if (i === 0) {
                    newPattern[i] = true;
                    continue;
                }
                const probability = i % 4 === 0 ? density : (i % 2 === 0 ? density - 0.2 : density - 0.4);
                if (Math.random() < Math.max(0.1, probability)) {
                    newPattern[i] = true;
                }
            }
            setTargetDictation(newPattern);
            setUserDictation(new Array(16).fill(false));
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
        // User requested: Subdivisions entry level slow - 50 BPM
        // We will store current BPM in state to allow it to increase
        engine.setSwing(hasSwing ? 0.5 : 0);

        if (exerciseMode === 'Subdivision' && targetSub) {
            engine.setBpm(currentBpm);
            engine.setSubdivision(targetSub);
            engine.start();
            setTimeout(() => {
                engine.stop();
                setIsPlaying(false);
            }, 2400); // 2.4s is roughly 2 bars at 50bpm (60/50 * 4 * 2 = 9.6s)... wait 2.4s is too short for 50bpm.
            // 50 BPM = 1.2s per beat. 4 beats = 4.8s. 2 bars = 9.6s.
            // Let's make it play for 1 bar + 1 beat at least.
            // Fixed duration might be an issue. Let's calculate duration.
            const beatDur = 60 / currentBpm;
            const playDur = beatDur * 4 * 1.5; // 1.5 bars

            setTimeout(() => {
                engine.stop();
                setIsPlaying(false);
            }, playDur * 1000);

        } else if (exerciseMode === 'Polyrhythm' && targetPoly) {
            // Polyrhythm usually needs slower BPM to hear interaction
            polyEngine.setBpm(currentBpm);
            polyEngine.setDivisions(targetPoly.a, targetPoly.b);
            polyEngine.start();

            const measureDur = (60 / currentBpm) * 4;
            setTimeout(() => {
                polyEngine.stop();
                setIsPlaying(false);
            }, measureDur * 2 * 1000); // 2 measures

        } else if (exerciseMode === 'Dictation' && targetDictation) {
            engine.setBpm(currentBpm);
            engine.setSubdivision(4);
            const patternData = targetDictation.map(h => h ? 2 : 0);
            engine.setPattern(patternData);
            engine.start();
            setTimeout(() => {
                engine.stop();
                engine.setPattern([]);
                setIsPlaying(false);
            }, (60000 / currentBpm) * 4 + 100);
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
            isCorrect = targetDictation.every((v, i) => v === userDictation[i]);
            correctMsg = isCorrect ? "Spot on!" : "Pattern mismatch.";
        }

        if (isCorrect) {
            const multiplier = difficulty === 'Novice' ? 1 : difficulty === 'Advanced' ? 2 : 5;
            const points = (exerciseMode === 'Subdivision' ? 10 : 25) * multiplier;
            setFeedback({ success: true, msg: 'Perfect! 🎉' });
            setScore(prev => prev + points);
            setStreak(prev => prev + 1);

            // "make is little faster after finishing a level" -> Increase BPM on success
            // Cap at 200
            setCurrentBpm(prev => Math.min(prev + 5, 200));

            addExperience('Rhythm', points * 2);
            updateGlobalStreak('Rhythm', streak + 1);
            setTimeout(startNewQuestion, 2000);
        } else {
            setFeedback({ success: false, msg: `Not quite! ${correctMsg}` });
            setStreak(0);
            updateGlobalStreak('Rhythm', 0);
            // Reset BPM on failure? Or keep it? keeping it is more "roguelike", resetting might be frustrating.
            // Let's purely increment for now as requested.
        }
    };

    const toggleStep = (idx: number) => {
        if (feedback) return;
        const newD = [...userDictation];
        newD[idx] = !newD[idx];
        setUserDictation(newD);
    };

    return (
        <div className="w-full h-full p-2 md:p-4 space-y-4 fade-in flex flex-col">
            {/* Header / Stats */}
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Target size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Rhythm Training</h2>
                        <div className="flex gap-2 mt-1">
                            {(['Novice', 'Advanced', 'Pro'] as Difficulty[]).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`text-[10px] uppercase tracking-tighter font-bold px-2 py-0.5 rounded ${difficulty === d ? 'bg-emerald-500 text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-xs text-white/40 uppercase tracking-widest font-bold">BPM</div>
                        <div className="text-2xl font-mono text-blue-400">{currentBpm}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Score</div>
                        <div className="text-2xl font-mono text-emerald-400">{score}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Streak</div>
                        <div className="text-2xl font-mono text-orange-400">🔥 {streak}</div>
                    </div>
                </div>
            </div>

            {/* Mode Selector */}
            <div className="flex justify-center flex-wrap gap-4">
                <button
                    onClick={() => setExerciseMode('Subdivision')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all border ${exerciseMode === 'Subdivision' ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-white/5 text-white/50 border-white/10'}`}
                >
                    <Layers size={18} />
                    Subdivisions
                </button>
                <button
                    onClick={() => setExerciseMode('Polyrhythm')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all border ${exerciseMode === 'Polyrhythm' ? 'bg-purple-500 text-white border-purple-400' : 'bg-white/5 text-white/50 border-white/10'}`}
                >
                    <Activity size={18} />
                    Polyrhythms
                </button>
                <button
                    onClick={() => setExerciseMode('Dictation')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all border ${exerciseMode === 'Dictation' ? 'bg-amber-500 text-white border-amber-400' : 'bg-white/5 text-white/50 border-white/10'}`}
                >
                    <Repeat size={18} />
                    Dictation
                </button>
            </div>

            {/* Game Area */}
            <div className="flex-1 glass-panel p-4 md:p-8 rounded-3xl border border-white/10 text-center space-y-4 md:space-y-10 relative overflow-hidden min-h-0 flex flex-col justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div className={`h-full ${exerciseMode === 'Dictation' ? 'bg-amber-400' : exerciseMode === 'Polyrhythm' ? 'bg-purple-400' : 'bg-cyan-400'} transition-all duration-[2.4s] ${isPlaying ? 'w-full' : 'w-0'}`} />
                </div>

                <div className="space-y-2 md:space-y-4 shrink-0">
                    <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center gap-3">
                        <Target className={exerciseMode === 'Polyrhythm' ? 'text-purple-400' : exerciseMode === 'Dictation' ? 'text-amber-400' : 'text-cyan-400'} size={32} />
                        {exerciseMode === 'Subdivision' ? 'Identify the Grid' : exerciseMode === 'Polyrhythm' ? 'Identify the Polyrhythm' : 'Transcribe the Pattern'}
                    </h3>
                    <div className="flex justify-center gap-4">
                        {difficulty === 'Pro' && <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30 font-black">PRO LEVEL</span>}
                        {hasSwing && <span className="flex items-center gap-1 text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 font-black tracking-widest leading-none"><Wind size={12} /> SWING FEEL ACTIVE</span>}
                    </div>
                </div>

                <div className="flex justify-center shrink-0">
                    <button
                        onClick={playQuestion}
                        disabled={isPlaying}
                        className={`
                            group w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-300
                            ${isPlaying
                                ? 'bg-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]'
                                : exerciseMode === 'Dictation' ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40' :
                                    exerciseMode === 'Polyrhythm' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/40' :
                                        'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40'}
                            shadow-xl scale-125
                        `}
                    >
                        {isPlaying ? (
                            <div className="flex items-end gap-1.5 h-10">
                                <div className="w-2.5 bg-white/60 rounded-t-full animate-music-bar-1" />
                                <div className="w-2.5 bg-white/60 rounded-t-full animate-music-bar-2" />
                                <div className="w-2.5 bg-white/60 rounded-t-full animate-music-bar-3" />
                                <div className="w-2.5 bg-white/60 rounded-t-full animate-music-bar-4" />
                            </div>
                        ) : (
                            <Play fill="currentColor" size={48} className="text-white ml-2" />
                        )}
                    </button>
                </div>

                {feedback && (
                    <div className={`text-2xl font-bold flex items-center justify-center gap-3 animate-bounce ${feedback.success ? 'text-emerald-400' : 'text-red-400'} shrink-0`}>
                        {feedback.success ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        {feedback.msg}
                    </div>
                )}

                {!feedback && (
                    <div className="w-full flex-1 flex flex-col justify-center min-h-0 overflow-y-auto">
                        {exerciseMode === 'Subdivision' ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto w-full">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter(n => difficulty === 'Novice' ? n <= 4 : difficulty === 'Advanced' ? n <= 8 : true).map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => handleAnswer(n)}
                                        className="group glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/50 hover:bg-white/10 transition-all text-center flex flex-col items-center justify-center min-h-[120px]"
                                    >
                                        <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors">{n}</div>
                                        <div className="text-[10px] md:text-xs uppercase text-white/40 tracking-widest font-bold">
                                            {n === 1 ? 'Quarters' : n === 2 ? 'Eighths' : n === 3 ? 'Triplets' : n === 4 ? '16ths' : n + '-lets'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : exerciseMode === 'Polyrhythm' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
                                {POLY_OPTIONS[difficulty].map((opt: any) => (
                                    <button
                                        key={`${opt.a}:${opt.b}`}
                                        onClick={() => handleAnswer(opt)}
                                        className="group glass-panel p-8 rounded-3xl border border-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all text-center min-h-[140px] flex flex-col justify-center"
                                    >
                                        <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">{opt.a}:{opt.b}</div>
                                        <div className="text-xs uppercase text-white/40 tracking-widest font-bold">
                                            {opt.label}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-8 max-w-2xl mx-auto w-full">
                                <div className="grid grid-cols-4 gap-3">
                                    {userDictation.map((step, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => toggleStep(idx)}
                                            className={`w-full h-20 md:h-24 rounded-xl border transition-all ${step ? 'bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleAnswer(userDictation)}
                                    className="flex items-center gap-3 px-10 py-4 bg-amber-600 hover:bg-amber-500 rounded-full text-white font-bold text-lg mx-auto transition shadow-lg hover:scale-105"
                                >
                                    Check Answer
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {feedback && !feedback.success && (
                    <button
                        onClick={startNewQuestion}
                        className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold mx-auto transition shrink-0"
                    >
                        <RotateCcw size={18} />
                        Next Question
                    </button>
                )}
            </div>


        </div>
    );
}
