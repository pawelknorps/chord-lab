import { useState, useEffect, useCallback, useRef } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { PolyrhythmEngine } from '../../../utils/polyrhythmEngine';
import { Play, Activity, Target, StopCircle, ArrowRight } from 'lucide-react';
import { useRhythmStore } from '../state/useRhythmStore';
import { motion, AnimatePresence } from 'framer-motion';

const engine = new MetronomeEngine();
const polyEngine = new PolyrhythmEngine();

const SUB_OPTIONS: Record<string, number[]> = {
    Novice: [2, 3, 4, 5, 6],
    Intermediate: [3, 4, 5, 6, 7, 8],
    Advanced: [5, 6, 7, 8, 9, 10, 11, 12],
    Pro: [7, 8, 9, 10, 11, 12, 13, 14, 15],
    Virtuoso: [11, 13, 15, 17, 19, 21, 23, 27, 31]
};

const ALL_POLY = [
    { a: 3, b: 2, label: '3:2' },
    { a: 2, b: 3, label: '2:3' },
    { a: 3, b: 4, label: '3:4' },
    { a: 4, b: 3, label: '4:3' },
    { a: 5, b: 4, label: '5:4' },
    { a: 4, b: 5, label: '4:5' },
    { a: 5, b: 2, label: '5:2' },
    { a: 7, b: 4, label: '7:4' },
    { a: 5, b: 3, label: '5:3' },
    { a: 3, b: 7, label: '3:7' },
    { a: 7, b: 8, label: '7:8' },
    { a: 9, b: 4, label: '9:4' },
    { a: 11, b: 4, label: '11:4' },
    { a: 13, b: 4, label: '13:4' },
    { a: 17, b: 4, label: '17:4' },
    { a: 19, b: 12, label: '19:12' },
];

const POLY_OPTIONS: Record<string, any[]> = {
    Novice: ALL_POLY.slice(0, 6),
    Intermediate: ALL_POLY.slice(0, 9),
    Advanced: ALL_POLY.slice(2, 12),
    Pro: ALL_POLY.slice(4, 15),
    Virtuoso: ALL_POLY
};

type ExerciseMode = 'Subdivision' | 'Polyrhythm' | 'Dictation';

export default function RhythmArena() {
    const { difficulty, addScore, streak, bpm: currentBpm, setCurrentBpm, isPlaying, setPlaying, metronomeEnabled, setMetronomeEnabled } = useRhythmStore();

    const [exerciseMode, setExerciseMode] = useState<ExerciseMode>('Subdivision');
    const [targetSub, setTargetSub] = useState<number | null>(null);
    const [targetPoly, setTargetPoly] = useState<{ a: number, b: number } | null>(null);
    const [targetDictation, setTargetDictation] = useState<number[]>(new Array(16).fill(0));
    const [userDictation, setUserDictation] = useState<number[]>(new Array(16).fill(0));
    const [hasSwing, setHasSwing] = useState(false);
    const [feedback, setFeedback] = useState<{ success: boolean; msg: string } | null>(null);

    const playTimeoutRef = useRef<any>(null);

    const startNewQuestion = useCallback(() => {
        setFeedback(null);
        setPlaying(false);
        engine.stop();
        polyEngine.stop();
        if (playTimeoutRef.current) {
            clearTimeout(playTimeoutRef.current);
            playTimeoutRef.current = null;
        }

        if (difficulty === 'Pro' || difficulty === 'Virtuoso') {
            setHasSwing(Math.random() > 0.4);
        } else {
            setHasSwing(false);
        }

        if (exerciseMode === 'Subdivision') {
            const pool = SUB_OPTIONS[difficulty] || SUB_OPTIONS.Novice;
            setTargetSub(pool[Math.floor(Math.random() * pool.length)]);
        } else if (exerciseMode === 'Polyrhythm') {
            const pool = POLY_OPTIONS[difficulty] || POLY_OPTIONS.Novice;
            setTargetPoly(pool[Math.floor(Math.random() * pool.length)]);
        } else if (exerciseMode === 'Dictation') {
            const pattern = new Array(16).fill(0);
            const density = difficulty === 'Novice' ? 0.3 : difficulty === 'Intermediate' ? 0.4 : 0.55;
            for (let i = 0; i < 16; i++) {
                if (i === 0 || Math.random() < density) {
                    pattern[i] = (difficulty !== 'Novice' && Math.random() > 0.75) ? 1 : 2;
                }
            }
            setTargetDictation(pattern);
            setUserDictation(new Array(16).fill(0));
        }
    }, [exerciseMode, difficulty, setPlaying]);

    useEffect(() => {
        // Lowering BPMs for better rhythmic clarity
        const baseBpm = difficulty === 'Novice' ? 60 : difficulty === 'Intermediate' ? 75 : difficulty === 'Advanced' ? 90 : difficulty === 'Pro' ? 105 : 120;
        setCurrentBpm(baseBpm);
        startNewQuestion();
        return () => {
            engine.stop();
            polyEngine.stop();
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
        };
    }, [difficulty, exerciseMode, setCurrentBpm, startNewQuestion]);

    const playQuestion = () => {
        if (isPlaying) {
            engine.stop();
            polyEngine.stop();
            setPlaying(false);
            if (playTimeoutRef.current) {
                clearTimeout(playTimeoutRef.current);
                playTimeoutRef.current = null;
            }
            return;
        }

        setPlaying(true);
        engine.setSwing(hasSwing ? 0.5 : 0);
        engine.metronomeEnabled = metronomeEnabled;
        polyEngine.metronomeEnabled = metronomeEnabled;

        const duration = (60 / currentBpm) * 4 * 2 * 1000;

        const onFinish = () => {
            engine.stop();
            polyEngine.stop();
            setPlaying(false);
            playTimeoutRef.current = null;
        };

        if (exerciseMode === 'Subdivision' && targetSub) {
            engine.setBpm(currentBpm);
            engine.setSubdivision(targetSub);
            engine.start();
            playTimeoutRef.current = setTimeout(onFinish, duration);
        } else if (exerciseMode === 'Polyrhythm' && targetPoly) {
            polyEngine.setBpm(currentBpm);
            polyEngine.setDivisions(targetPoly.a, targetPoly.b);
            polyEngine.start();
            playTimeoutRef.current = setTimeout(onFinish, duration);
        } else if (exerciseMode === 'Dictation' && targetDictation) {
            engine.setBpm(currentBpm);
            engine.setSubdivision(4);
            engine.setPattern(targetDictation);
            engine.start();
            playTimeoutRef.current = setTimeout(onFinish, duration);
        }
    };

    const handleAnswer = (val: any) => {
        let isCorrect = false;
        if (exerciseMode === 'Subdivision') isCorrect = val === targetSub;
        else if (exerciseMode === 'Polyrhythm') isCorrect = val.a === targetPoly?.a && val.b === targetPoly?.b;
        else if (exerciseMode === 'Dictation') isCorrect = targetDictation.every((v, i) => v === userDictation[i]);

        if (isCorrect) {
            const mult = difficulty === 'Novice' ? 1 : difficulty === 'Intermediate' ? 1.5 : difficulty === 'Advanced' ? 2 : 4;
            addScore(Math.floor(200 * mult) + streak * 20);
            setFeedback({ success: true, msg: 'EXACT SYNCHRONIZATION ACHIEVED' });
            setTimeout(startNewQuestion, 2000);
        } else {
            setFeedback({ success: false, msg: 'TIMING DISCREPANCY - TRY AGAIN' });
            // Don't restart, just show red so user can try another answer
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-5xl fade-in relative z-10 px-4">
            <header className="text-center space-y-6 w-full">
                <div className="flex bg-black p-1 rounded-2xl border border-white/5 w-fit mx-auto">
                    {(['Subdivision', 'Polyrhythm', 'Dictation'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => { setExerciseMode(m); feedback && startNewQuestion(); }}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${exerciseMode === m ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex flex-col items-center gap-12 py-8">
                <div className="relative group flex flex-col items-center gap-8">
                    {/* Metronome Toggle */}
                    <button
                        onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                        className={`z-20 flex items-center gap-2 px-6 py-3 rounded-full border transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl backdrop-blur-md
                            ${metronomeEnabled ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}
                    >
                        <Activity size={16} />
                        Reference Metronome: {metronomeEnabled ? 'ACTIVE' : 'OFF'}
                    </button>

                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: isPlaying ? [1, 1.25, 1] : [1, 1.1, 1],
                                opacity: isPlaying ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute -inset-16 bg-indigo-500 rounded-full blur-[80px]"
                        />
                        <button
                            className={`relative w-44 h-44 rounded-full bg-black/80 flex items-center justify-center transition-all border-2 
                                ${feedback?.success ? 'border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.3)]' :
                                    feedback?.success === false ? 'border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.3)]' :
                                        isPlaying ? 'border-indigo-400 shadow-[0_0_60px_rgba(99,102,241,0.2)]' :
                                            'border-white/10 hover:border-white/30'}`}
                            onClick={playQuestion}
                        >
                            {isPlaying ? <StopCircle size={64} className="text-indigo-400 fill-current animate-pulse" /> :
                                <Play size={64} className="ml-2 text-white fill-current" />}
                        </button>
                    </div>

                    <div className="px-6 py-2 bg-black/60 border border-white/10 rounded-full text-[10px] italic uppercase font-black tracking-tighter text-white/40 backdrop-blur-md">
                        {exerciseMode} • {difficulty} {hasSwing && '• SWING'}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl mt-8">
                {exerciseMode === 'Subdivision' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(SUB_OPTIONS[difficulty] || SUB_OPTIONS.Novice).map(n => (
                            <motion.button
                                key={n}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAnswer(n)}
                                className="p-8 bg-white/5 border border-white/5 hover:border-indigo-500/50 rounded-3xl transition-all group"
                            >
                                <div className="text-4xl font-black italic tracking-tighter text-white/60 group-hover:text-white">{n}</div>
                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/20 mt-2">{n}-lets</div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {exerciseMode === 'Polyrhythm' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(POLY_OPTIONS[difficulty] || POLY_OPTIONS.Novice).map(opt => (
                            <motion.button
                                key={`${opt.a}:${opt.b}`}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleAnswer(opt)}
                                className="p-10 bg-white/5 border border-white/5 hover:border-purple-500/50 rounded-[40px] transition-all text-center"
                            >
                                <div className="text-5xl font-black italic tracking-tighter text-white mb-2">{opt.a}:{opt.b}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-white/20">{opt.label}</div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {exerciseMode === 'Dictation' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 p-6 bg-black/40 rounded-[32px] border border-white/5 shadow-2xl">
                            {userDictation.map((val, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const next = [...userDictation];
                                        next[idx] = (next[idx] + 1) % 3; // 0=Rest, 1=Ghost, 2=Accent
                                        setUserDictation(next);
                                    }}
                                    className={`h-20 rounded-2xl transition-all border flex flex-col items-center justify-center gap-2 relative overflow-hidden group
                                        ${val === 2 ? 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' :
                                            val === 1 ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${val === 0 ? 'text-white/10' : 'text-white/40'}`}>
                                        {val === 2 ? 'Accent' : val === 1 ? 'Ghost' : 'Rest'}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${val === 2 ? 'bg-white shadow-[0_0_10px_white]' : val === 1 ? 'bg-white/40' : 'bg-white/5'}`} />
                                    <div className="absolute top-1 left-1 text-[7px] font-mono text-white/10">{idx + 1}</div>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setUserDictation(new Array(16).fill(0))}
                                className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] border border-white/5"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => handleAnswer(userDictation)}
                                className="flex-1 py-4 bg-indigo-500/10 hover:bg-indigo-500 text-white font-black rounded-2xl border border-indigo-500/20 hover:border-indigo-400 transition-all uppercase tracking-[0.3em] text-[10px] shadow-xl"
                            >
                                ANALZE TEMPORAL PATTERN
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="h-20 flex items-center justify-center">
                <AnimatePresence>
                    {feedback && (
                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-2xl font-black italic flex items-center gap-4 ${feedback.success ? 'text-emerald-400' : 'text-red-400'}`}>
                            {feedback.success ? <Target className="animate-bounce" /> : <Activity />}
                            {feedback.msg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button onClick={startNewQuestion} className="group flex items-center gap-4 text-white/20 hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.3em] py-4">
                SKIP SEQUENCE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform text-indigo-500" />
            </button>
        </div>
    );
}
