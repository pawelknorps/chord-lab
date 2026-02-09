import { useState, useEffect, useRef } from 'react';
import { PolyrhythmEngine } from '../../../utils/polyrhythmEngine';
import { Play, Square, Shuffle, Trophy, Target, Zap } from 'lucide-react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';

const engine = new PolyrhythmEngine();

type ExerciseMode = 'Practice' | 'Challenge';
type Difficulty = 'Novice' | 'Advanced' | 'Pro';

const CHALLENGES = {
    Novice: [
        { a: 3, b: 2, name: '3:2 Classic' },
        { a: 2, b: 3, name: '2:3 Reverse' },
        { a: 4, b: 3, name: '4:3 Waltz' },
        { a: 3, b: 4, name: '3:4 Inverse' },
    ],
    Advanced: [
        { a: 5, b: 4, name: '5:4 Jazz' },
        { a: 4, b: 5, name: '4:5 Complex' },
        { a: 5, b: 3, name: '5:3 Wide' },
        { a: 7, b: 4, name: '7:4 Odd' },
    ],
    Pro: [
        { a: 7, b: 5, name: '7:5 Advanced' },
        { a: 11, b: 8, name: '11:8 Master' },
        { a: 13, b: 7, name: '13:7 Expert' },
        { a: 9, b: 7, name: '9:7 Extreme' },
    ]
};

export default function PolyrhythmGenerator() {
    const [mode, setMode] = useState<ExerciseMode>('Practice');
    const [difficulty, setDifficulty] = useState<Difficulty>('Novice');
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(60);
    const [divA, setDivA] = useState(4);
    const [divB, setDivB] = useState(5);

    // Challenge mode state
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const [score, setScore] = useState(0);
    const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

    // Animation refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const isPlayingRef = useRef(false);

    // Refs for animation loop to avoid stale closures
    const stateRef = useRef({ divA: 4, divB: 5, bpm: 60 });

    // Update refs when state changes
    useEffect(() => {
        stateRef.current = { divA, divB, bpm };
    }, [divA, divB, bpm]);

    useEffect(() => {
        return () => {
            engine.stop();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
            isPlayingRef.current = false;
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        } else {
            engine.setBpm(bpm);
            engine.setDivisions(divA, divB);
            engine.start();
            setIsPlaying(true);
            isPlayingRef.current = true;
            // Start animation loop
            requestAnimationFrame(draw);
        }
    };

    const handleUpdate = (newA: number, newB: number) => {
        setDivA(newA);
        setDivB(newB);
        // Update engine immediately if playing
        if (isPlaying) {
            engine.setDivisions(newA, newB);
        }
    };

    const loadChallenge = (index: number) => {
        const challenge = CHALLENGES[difficulty][index];
        if (challenge) {
            setCurrentChallenge(index);
            handleUpdate(challenge.a, challenge.b);
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
        const key = `${difficulty}-${challenge.a}:${challenge.b}`;
        if (!completedChallenges.has(key)) {
            setCompletedChallenges(new Set([...completedChallenges, key]));
            const points = difficulty === 'Novice' ? 50 : difficulty === 'Advanced' ? 100 : 200;
            setScore(prev => prev + points);
        }
        nextChallenge();
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use refs for current values
        const { divA, divB, bpm } = stateRef.current;

        // Duration of 1 measure at BPM: (60/BPM) * 4
        const beatDur = 60 / bpm;
        const duration = beatDur * 4;

        // Tone.Transport.seconds gives current audio time
        const time = Tone.Transport.seconds;
        const phase = (time % duration) / duration;

        // Clear with gradient background
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radiusA = 120;
        const radiusB = 180;

        // Draw center info
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${divA}:${divB}`, centerX, centerY);

        // Draw track A (inner circle)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)'; // Emerald
        ctx.lineWidth = 3;
        ctx.arc(centerX, centerY, radiusA, 0, Math.PI * 2);
        ctx.stroke();

        // Draw hits A with pulse effect
        for (let i = 0; i < divA; i++) {
            const angle = (i / divA) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radiusA;
            const y = centerY + Math.sin(angle) * radiusA;

            // Check if this hit is currently being played
            const hitPhase = i / divA;
            const distToHit = Math.abs(phase - hitPhase);
            const isHitting = distToHit < 0.02 || distToHit > 0.98;

            ctx.beginPath();
            if (isHitting) {
                ctx.fillStyle = '#34d399';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#34d399';
                ctx.arc(x, y, 8, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = 'rgba(52, 211, 153, 0.5)';
                ctx.shadowBlur = 0;
                ctx.arc(x, y, 5, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Cursor A (rotating indicator)
        const angleA = phase * Math.PI * 2 - Math.PI / 2;
        const cursorAX = centerX + Math.cos(angleA) * radiusA;
        const cursorAY = centerY + Math.sin(angleA) * radiusA;

        // Draw line from center to cursor
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = 2;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(cursorAX, cursorAY);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#34d399';
        ctx.arc(cursorAX, cursorAY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw track B (outer circle)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.3)'; // Purple
        ctx.lineWidth = 3;
        ctx.arc(centerX, centerY, radiusB, 0, Math.PI * 2);
        ctx.stroke();

        // Draw hits B with pulse effect
        for (let i = 0; i < divB; i++) {
            const angle = (i / divB) * Math.PI * 2 - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radiusB;
            const y = centerY + Math.sin(angle) * radiusB;

            const hitPhase = i / divB;
            const distToHit = Math.abs(phase - hitPhase);
            const isHitting = distToHit < 0.02 || distToHit > 0.98;

            ctx.beginPath();
            if (isHitting) {
                ctx.fillStyle = '#a78bfa';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#a78bfa';
                ctx.arc(x, y, 8, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = 'rgba(167, 139, 250, 0.5)';
                ctx.shadowBlur = 0;
                ctx.arc(x, y, 5, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Cursor B
        const cursorBX = centerX + Math.cos(angleA) * radiusB;
        const cursorBY = centerY + Math.sin(angleA) * radiusB;

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)';
        ctx.lineWidth = 2;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(cursorBX, cursorBY);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#a78bfa';
        ctx.arc(cursorBX, cursorBY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isPlayingRef.current) {
            animationFrameRef.current = requestAnimationFrame(draw);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Polyrhythm Lab</h2>
                    <p className="text-white/40 mt-1">Master complex rhythmic relationships.</p>
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
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />

                    <canvas
                        ref={canvasRef}
                        width={500}
                        height={500}
                        className="w-full max-w-[500px] aspect-square relative z-10"
                    />

                    {/* Legend */}
                    <div className="flex gap-8 mt-6 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                            <span className="text-sm text-white/60 font-medium">Inner: {divA}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
                            <span className="text-sm text-white/60 font-medium">Outer: {divB}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-6">
                    {/* Transport */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex items-center gap-8">
                        <button
                            onClick={togglePlay}
                            className={`
                                w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                                ${isPlaying
                                    ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-900/40 scale-95'
                                    : 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-900/40 hover:scale-105'
                                }
                            `}
                        >
                            {isPlaying ? <Square fill="currentColor" size={32} /> : <Play fill="currentColor" size={40} className="ml-2" />}
                        </button>

                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs text-indigo-300 uppercase tracking-widest font-bold">Tempo</label>
                                <span className="text-xl font-mono text-white">{bpm} <span className="text-sm text-white/30">BPM</span></span>
                            </div>
                            <input
                                type="range"
                                min="30"
                                max="180"
                                value={bpm}
                                onChange={(e) => { setBpm(Number(e.target.value)); if (isPlaying) engine.setBpm(Number(e.target.value)); }}
                                className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Division Controls */}
                    {mode === 'Practice' && (
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap size={20} className="text-indigo-400" />
                                Divisions
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                                        A
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="16"
                                        value={divA}
                                        onChange={e => handleUpdate(Number(e.target.value), divB)}
                                        className="flex-1 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <span className="text-2xl font-mono text-white w-12 text-right">{divA}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                                        B
                                    </div>
                                    <input
                                        type="range"
                                        min="2"
                                        max="16"
                                        value={divB}
                                        onChange={e => handleUpdate(divA, Number(e.target.value))}
                                        className="flex-1 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <span className="text-2xl font-mono text-white w-12 text-right">{divB}</span>
                                </div>
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
                                    const key = `${difficulty}-${challenge.a}:${challenge.b}`;
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
                                            <div className="text-2xl font-mono font-bold">{challenge.a}:{challenge.b}</div>
                                            <div className="text-xs mt-1 opacity-60">{challenge.name}</div>
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
