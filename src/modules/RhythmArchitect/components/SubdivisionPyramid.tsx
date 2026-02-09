import { useState, useEffect, useRef } from 'react';
import { MetronomeEngine } from '../../../utils/rhythmEngine';
import { Play, Square, Shuffle, Trophy, Target, Zap, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tone from 'tone';

const engine = new MetronomeEngine();

type ExerciseMode = 'Practice' | 'Challenge';
type Difficulty = 'Novice' | 'Advanced' | 'Pro';

const SUBDIVISION_NAMES = [
    'Whole Note',
    'Half Notes',
    'Triplets',
    '16th Notes',
    'Quintuplets',
    'Sextuplets',
    'Septuplets'
];

const CHALLENGES = {
    Novice: [
        { sub: 1, name: 'Whole Note Pulse', bpm: 50 },
        { sub: 2, name: 'Half Note Feel', bpm: 60 },
        { sub: 3, name: 'Triplet Groove', bpm: 70 },
        { sub: 4, name: '16th Note Foundation', bpm: 80 },
    ],
    Advanced: [
        { sub: 3, name: 'Fast Triplets', bpm: 100 },
        { sub: 4, name: 'Rapid 16ths', bpm: 120 },
        { sub: 5, name: 'Quintuplet Challenge', bpm: 90 },
        { sub: 6, name: 'Sextuplet Flow', bpm: 100 },
    ],
    Pro: [
        { sub: 5, name: 'Speed Quintuplets', bpm: 130 },
        { sub: 6, name: 'Fast Sextuplets', bpm: 140 },
        { sub: 7, name: 'Septuplet Master', bpm: 110 },
        { sub: 7, name: 'Extreme Septuplets', bpm: 150 },
    ]
};

export default function SubdivisionPyramid() {
    const [mode, setMode] = useState<ExerciseMode>('Practice');
    const [difficulty, setDifficulty] = useState<Difficulty>('Novice');
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(50);
    const [swing, setSwing] = useState(0);
    const [activeSubdivision, setActiveSubdivision] = useState(4);
    const [isRandomMode, setIsRandomMode] = useState(false);
    const [nextSubdivision, setNextSubdivision] = useState<number | null>(null);

    // Challenge mode state
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [score, setScore] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

    // Progressive training state
    const [practiceReps, setPracticeReps] = useState(0);
    const [targetReps, setTargetReps] = useState(8); // 8 measures to master
    const [masteredSubdivisions, setMasteredSubdivisions] = useState<Set<number>>(new Set());

    // Animation state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const isPlayingRef = useRef(false);
    const stateRef = useRef({ subdivision: 4, bpm: 50 });

    // Timer ref for random mode
    const randomTimerRef = useRef<number | null>(null);
    const measureCountRef = useRef(0);

    useEffect(() => {
        stateRef.current = { subdivision: activeSubdivision, bpm };
    }, [activeSubdivision, bpm]);

    useEffect(() => {
        return () => {
            engine.stop();
            if (randomTimerRef.current) clearInterval(randomTimerRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    // Track measures and auto-advance in random mode
    useEffect(() => {
        if (!isPlaying || !isRandomMode) return;

        const beatDur = 60 / bpm;
        const measureDur = beatDur * 4; // 4 beats per measure

        const interval = setInterval(() => {
            measureCountRef.current += 1;
            setPracticeReps(prev => prev + 1);

            // After target reps, advance to next subdivision
            if (measureCountRef.current >= targetReps) {
                measureCountRef.current = 0;
                setPracticeReps(0);

                // Mark as mastered
                setMasteredSubdivisions(prev => new Set([...prev, activeSubdivision]));

                // Advance to next subdivision
                if (nextSubdivision !== null) {
                    handleSubdivisionChange(nextSubdivision);
                    generateNextSubdivision(nextSubdivision);
                }

                // Increase BPM slightly
                const newBpm = Math.min(bpm + 5, 200);
                setBpm(newBpm);
                engine.setBpm(newBpm);
            }
        }, measureDur * 1000);

        return () => clearInterval(interval);
    }, [isPlaying, isRandomMode, bpm, activeSubdivision, nextSubdivision, targetReps]);

    const generateNextSubdivision = (currentSub: number) => {
        // Generate a different subdivision
        let next;
        do {
            next = Math.floor(Math.random() * 7) + 1;
        } while (next === currentSub);
        setNextSubdivision(next);
    };

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
            isPlayingRef.current = false;
            if (randomTimerRef.current) {
                clearInterval(randomTimerRef.current);
                randomTimerRef.current = null;
            }
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        } else {
            engine.setBpm(bpm);
            engine.setSwing(swing);
            engine.setSubdivision(activeSubdivision);
            engine.start();
            setIsPlaying(true);
            isPlayingRef.current = true;
            requestAnimationFrame(draw);

            if (isRandomMode && nextSubdivision === null) {
                generateNextSubdivision(activeSubdivision);
            }
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { subdivision, bpm } = stateRef.current;

        // Calculate current beat position
        const beatDur = 60 / bpm;
        const time = Tone.Transport.seconds;
        const beatPhase = (time % beatDur) / beatDur;
        const currentSubBeat = Math.floor(beatPhase * subdivision);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.35;

        // Draw subdivision circles
        for (let i = 0; i < subdivision; i++) {
            const angle = (i / subdivision) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const isActive = i === currentSubBeat;
            const size = isActive ? 20 : 12;

            ctx.beginPath();
            if (isActive) {
                ctx.fillStyle = '#06b6d4'; // Cyan
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#06b6d4';
            } else {
                ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
                ctx.shadowBlur = 0;
            }
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw connecting line to center
            if (isActive) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
                ctx.lineWidth = 2;
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }

        // Draw center circle
        ctx.beginPath();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
        ctx.fill();

        // Draw subdivision number in center
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(subdivision.toString(), centerX, centerY);

        if (isPlayingRef.current) {
            animationFrameRef.current = requestAnimationFrame(draw);
        }
    };

    const handleBpmChange = (val: number) => {
        setBpm(val);
        engine.setBpm(val);
    };

    const handleSwingChange = (val: number) => {
        setSwing(val);
        engine.setSwing(val);
    };

    const handleSubdivisionChange = (sub: number) => {
        setActiveSubdivision(sub);
        engine.setSubdivision(sub);
        // Reset practice reps when manually changing subdivision
        if (!isRandomMode) {
            setPracticeReps(0);
            measureCountRef.current = 0;
        }
    };

    const toggleRandomMode = () => {
        const newState = !isRandomMode;
        setIsRandomMode(newState);

        if (newState) {
            // Initialize next subdivision when turning on random mode
            generateNextSubdivision(activeSubdivision);
            setPracticeReps(0);
            measureCountRef.current = 0;
        } else {
            // Clear next subdivision when turning off
            setNextSubdivision(null);
            setPracticeReps(0);
            measureCountRef.current = 0;
        }
    };

    const loadChallenge = (index: number) => {
        const challenge = CHALLENGES[difficulty][index];
        if (challenge) {
            setCurrentChallenge(index);
            handleSubdivisionChange(challenge.sub);
            setBpm(challenge.bpm);
            if (isPlaying) {
                engine.setBpm(challenge.bpm);
            }
        }
    };

    const nextChallenge = () => {
        const nextIndex = (currentChallenge + 1) % CHALLENGES[difficulty].length;
        loadChallenge(nextIndex);
    };

    const randomChallenge = () => {
        const challenges = CHALLENGES[difficulty];
        const randomIndex = Math.floor(Math.random() * challenges.length);
        loadChallenge(randomIndex);
    };

    const completeChallenge = () => {
        const challenge = CHALLENGES[difficulty][currentChallenge];
        const key = `${difficulty}-${challenge.sub}-${challenge.bpm}`;
        if (!completedChallenges.has(key)) {
            setCompletedChallenges(new Set([...completedChallenges, key]));
            const points = difficulty === 'Novice' ? 50 : difficulty === 'Advanced' ? 100 : 200;
            setScore(prev => prev + points);
        }
        nextChallenge();
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Subdivision Lab</h2>
                    <p className="text-white/40 mt-1">Master rhythmic groupings and transitions.</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('Practice')}
                        className={`px-4 py-2 rounded-xl transition-all text-sm font-medium ${mode === 'Practice'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                            : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        Practice
                    </button>
                    <button
                        onClick={() => setMode('Challenge')}
                        className={`px-4 py-2 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${mode === 'Challenge'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <Trophy size={14} />
                        Challenge
                    </button>
                </div>
            </div>

            {/* Challenge Mode Header */}
            <AnimatePresence>
                {mode === 'Challenge' && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex gap-2">
                                {(['Novice', 'Advanced', 'Pro'] as Difficulty[]).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => { setDifficulty(d); setCurrentChallenge(0); loadChallenge(0); }}
                                        className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-all ${difficulty === d
                                            ? 'bg-amber-500 text-black shadow-lg'
                                            : 'bg-white/5 text-white/30 hover:bg-white/10'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                            <div className="text-sm text-white/60">
                                Challenge {currentChallenge + 1} of {CHALLENGES[difficulty].length}
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Score</div>
                                <div className="text-2xl font-mono text-amber-400 font-bold">{score}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Completed</div>
                                <div className="text-2xl font-mono text-emerald-400 font-bold">{completedChallenges.size}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visualization */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />

                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        className="w-full max-w-[400px] aspect-square relative z-10"
                    />

                    {/* Subdivision Name */}
                    <div className="mt-6 text-center relative z-10 space-y-4 w-full max-w-md">
                        <div className="text-2xl font-bold text-white">{SUBDIVISION_NAMES[activeSubdivision - 1]}</div>
                        <div className="text-sm text-white/40">
                            {activeSubdivision === 1 ? 'Ta' :
                                activeSubdivision === 2 ? 'Ta-Ka' :
                                    activeSubdivision === 3 ? 'Ta-Ki-Ta' :
                                        activeSubdivision === 4 ? 'Ta-Ka-Di-Mi' :
                                            activeSubdivision === 5 ? 'Ta-Di-Gi-Na-Thom' :
                                                activeSubdivision === 6 ? 'Ta-Ki-Ta-Ta-Ki-Ta' : 'Ta-Ki-Ta-Ta-Ka-Di-Mi'}
                        </div>

                        {/* Progress Bar for Random Mode */}
                        {isRandomMode && isPlaying && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-white/50">
                                    <span>Progress</span>
                                    <span>{practiceReps}/{targetReps} measures</span>
                                </div>
                                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(practiceReps / targetReps) * 100}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Next Subdivision Preview */}
                        {isRandomMode && nextSubdivision !== null && (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-2">Next Up</div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-xl">
                                        {nextSubdivision}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-white">{SUBDIVISION_NAMES[nextSubdivision - 1]}</div>
                                        <div className="text-xs text-white/40">@ {Math.min(bpm + 5, 200)} BPM</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mastered Subdivisions */}
                        {masteredSubdivisions.size > 0 && (
                            <div className="flex gap-2 justify-center flex-wrap">
                                {Array.from(masteredSubdivisions).map(sub => (
                                    <div
                                        key={sub}
                                        className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xs font-bold"
                                        title={`Mastered: ${SUBDIVISION_NAMES[sub - 1]}`}
                                    >
                                        {sub}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-6">
                    {/* Transport */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={togglePlay}
                                className={`
                                    w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                                    ${isPlaying
                                        ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-900/40 scale-95'
                                        : 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-cyan-900/40 hover:scale-105'
                                    }
                                `}
                            >
                                {isPlaying ? <Square fill="currentColor" size={32} /> : <Play fill="currentColor" size={40} className="ml-2" />}
                            </button>

                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-cyan-300 uppercase tracking-widest font-bold">Tempo</label>
                                    <span className="text-xl font-mono text-white">{bpm} <span className="text-sm text-white/30">BPM</span></span>
                                </div>
                                <input
                                    type="range"
                                    min="40"
                                    max="200"
                                    value={bpm}
                                    onChange={(e) => handleBpmChange(Number(e.target.value))}
                                    className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                        </div>

                        {/* Swing Control */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-amber-300 uppercase tracking-widest font-bold">Swing</label>
                                <span className="text-lg font-mono text-white">{(swing * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={swing}
                                onChange={(e) => handleSwingChange(Number(e.target.value))}
                                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                        </div>

                        {/* Target Reps Control (Random Mode) */}
                        {isRandomMode && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-purple-300 uppercase tracking-widest font-bold">Practice Measures</label>
                                    <span className="text-lg font-mono text-white">{targetReps}</span>
                                </div>
                                <input
                                    type="range"
                                    min="4"
                                    max="16"
                                    step="1"
                                    value={targetReps}
                                    onChange={(e) => setTargetReps(Number(e.target.value))}
                                    className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Subdivision Selector - Practice Mode */}
                    {mode === 'Practice' && (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Zap size={20} className="text-cyan-400" />
                                    Subdivisions
                                </h3>
                                <button
                                    onClick={toggleRandomMode}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${isRandomMode
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <Shuffle size={14} className={isRandomMode ? 'animate-pulse' : ''} />
                                    Random
                                </button>
                            </div>

                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => handleSubdivisionChange(num)}
                                        className={`
                                            w-full p-4 rounded-xl transition-all border text-left flex items-center justify-between
                                            ${activeSubdivision === num
                                                ? 'bg-cyan-500/20 border-cyan-500/50 text-white scale-105'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${activeSubdivision === num ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-white/30'
                                                }`}>
                                                {num}
                                            </div>
                                            <div>
                                                <div className="font-medium">{SUBDIVISION_NAMES[num - 1]}</div>
                                                <div className="text-xs opacity-50">
                                                    {num === 1 ? 'Ta' :
                                                        num === 2 ? 'Ta-Ka' :
                                                            num === 3 ? 'Ta-Ki-Ta' :
                                                                num === 4 ? 'Ta-Ka-Di-Mi' :
                                                                    num === 5 ? 'Ta-Di-Gi-Na-Thom' :
                                                                        num === 6 ? 'Ta-Ki-Ta-Ta-Ki-Ta' : 'Ta-Ki-Ta-Ta-Ka-Di-Mi'}
                                                </div>
                                            </div>
                                        </div>
                                        {activeSubdivision === num && (
                                            <Volume2 size={18} className="text-cyan-400 animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Challenge Presets */}
                    {mode === 'Challenge' && (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Target size={20} className="text-amber-400" />
                                    {CHALLENGES[difficulty][currentChallenge].name}
                                </h3>
                                <button
                                    onClick={randomChallenge}
                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <Shuffle size={18} className="text-white/60" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {CHALLENGES[difficulty].map((challenge, idx) => {
                                    const key = `${difficulty}-${challenge.sub}-${challenge.bpm}`;
                                    const isCompleted = completedChallenges.has(key);
                                    const isCurrent = idx === currentChallenge;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => loadChallenge(idx)}
                                            className={`
                                                p-4 rounded-xl transition-all border text-left
                                                ${isCurrent
                                                    ? 'bg-amber-500/20 border-amber-500/50 text-white'
                                                    : isCompleted
                                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="text-2xl font-mono font-bold">{challenge.sub}</div>
                                                <div className="text-xs opacity-60">@ {challenge.bpm}</div>
                                            </div>
                                            <div className="text-xs opacity-60">{challenge.name}</div>
                                            {isCompleted && <div className="text-xs mt-1 text-emerald-400">✓ Completed</div>}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={completeChallenge}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl text-white font-bold transition-all shadow-lg hover:scale-105"
                            >
                                Complete & Next Challenge
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
