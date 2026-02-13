import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { PyramidEngine } from '../../../utils/pyramidEngine';
import { Play, Square, Zap, Activity, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRhythmStore } from '../state/useRhythmStore';
import { getScatForSubdivision } from '../../../core/services/rhythmScatService';
import { isNanoAvailableSync } from '../../../core/services/nanoHelpers';
import { useAudio } from '../../../context/AudioContext';

const engine = new PyramidEngine();

const SUBDIVISION_NAMES = [
    'Quarter Note',
    '8th Notes',
    '8th Note Triplets',
    '16th Notes',
    'Quintuplets',
    'Sextuplets',
    'Septuplets',
    '32nd Notes',
];

const KONNAKOL_SYLLABLES = [
    'Ta',
    'Ta-Ka',
    'Ta-Ki-Ta',
    'Ta-Ka-Di-Mi',
    'Ta-Di-Gi-Na-Tom',
    'Ta-Ki-Ta-Ta-Ka-Di',
    'Ta-Ka-Di-Mi-Ta-Ki-Na',
    'Ta-Ka-Di-Mi-Ta-Ka-Di-Mi',
];

type Difficulty = 'Novice' | 'Intermediate' | 'Advanced' | 'Pro' | 'Virtuoso';

// Layer presets: more layers and combinations unlock as difficulty increases
const LAYER_PRESETS: { name: string; layers: number[]; minDifficulty: Difficulty }[] = [
    { name: 'Whole', layers: [1], minDifficulty: 'Novice' },
    { name: 'Half (8ths)', layers: [2], minDifficulty: 'Novice' },
    { name: 'Both (2:1)', layers: [1, 2], minDifficulty: 'Novice' },
    { name: 'Triplets', layers: [3], minDifficulty: 'Novice' },
    { name: '16ths', layers: [4], minDifficulty: 'Novice' },
    { name: '2 + 4 (Hemiola)', layers: [2, 4], minDifficulty: 'Novice' },
    { name: '1 + 2 + 4', layers: [1, 2, 4], minDifficulty: 'Novice' },
    { name: 'Quintuplets', layers: [5], minDifficulty: 'Novice' },
    { name: 'Sextuplets', layers: [6], minDifficulty: 'Novice' },
    { name: '3 + 6', layers: [3, 6], minDifficulty: 'Novice' },
    { name: '2 + 4 + 8', layers: [2, 4, 8], minDifficulty: 'Novice' },
    { name: '1 + 2 + 4 + 8', layers: [1, 2, 4, 8], minDifficulty: 'Novice' },
    { name: 'Septuplets', layers: [7], minDifficulty: 'Novice' },
    { name: '32nds', layers: [8], minDifficulty: 'Novice' },
    { name: '4 + 6', layers: [4, 6], minDifficulty: 'Novice' },
    { name: '3 + 4 + 6', layers: [3, 4, 6], minDifficulty: 'Novice' },
    { name: '2 + 3 (Poly)', layers: [2, 3], minDifficulty: 'Novice' },
    { name: '5 + 4', layers: [5, 4], minDifficulty: 'Novice' },
    { name: '1–4 Pyramid', layers: [1, 2, 3, 4], minDifficulty: 'Novice' },
    { name: '1–6 Pyramid', layers: [1, 2, 3, 4, 5, 6], minDifficulty: 'Novice' },
    { name: 'Full Pyramid', layers: [1, 2, 3, 4, 5, 6, 7, 8], minDifficulty: 'Novice' },
];

const DIFFICULTY_ORDER: Difficulty[] = ['Novice', 'Intermediate', 'Advanced', 'Pro', 'Virtuoso'];

function difficultyRank(d: Difficulty): number {
    return DIFFICULTY_ORDER.indexOf(d);
}

export default function PyramidLab() {
    const { bpm, setCurrentBpm, difficulty, metronomeEnabled, setMetronomeEnabled } = useRhythmStore();
    const { startAudio } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeLayers, setActiveLayers] = useState<Set<number>>(new Set([1]));
    const [autoRandomize, setAutoRandomize] = useState(true);
    const [nextLayer, setNextLayer] = useState<number | null>(null);
    const [repetitionsLeft, setRepetitionsLeft] = useState<number>(0);
    const [scatPhrase, setScatPhrase] = useState<string | null>(null);
    const scheduleIdRef = useRef<number | null>(null);
    const nextLayerRef = useRef<number | null>(null);
    const activeLayersRef = useRef<Set<number>>(activeLayers);
    const repsLeftAudioRef = useRef<number>(0);
    const maxSubRef = useRef<number>(8);
    const repetitionsRef = useRef<number>(4);
    activeLayersRef.current = activeLayers;
    nextLayerRef.current = nextLayer;

    useEffect(() => {
        return () => {
            engine.stopAll();
            if (scheduleIdRef.current != null) {
                Tone.Transport.clear(scheduleIdRef.current);
                scheduleIdRef.current = null;
            }
        };
    }, []);

    // Scat phrase for current subdivision (Nano or fallback)
    const activeLayerForScat = activeLayers.size > 0 ? Math.min(...activeLayers) : 1;
    const subdivisionNameForScat = SUBDIVISION_NAMES[activeLayerForScat - 1];
    useEffect(() => {
        if (!isNanoAvailableSync()) {
            setScatPhrase(KONNAKOL_SYLLABLES[activeLayerForScat - 1] ?? 'Ta-Ka');
            return;
        }
        let cancelled = false;
        setScatPhrase(null);
        getScatForSubdivision(subdivisionNameForScat).then((phrase) => {
            if (!cancelled) setScatPhrase(phrase);
        });
        return () => { cancelled = true; };
    }, [subdivisionNameForScat, activeLayerForScat]);

    const maxLayer = 8;
    const visiblePresets = LAYER_PRESETS.filter(
        (p) => difficultyRank(difficulty) >= difficultyRank(p.minDifficulty)
    );

    // Repetitions (bars) before switching subdivision: 4 at Novice down to 1 at Virtuoso
    const getRepetitionsForDifficulty = (): number => {
        switch (difficulty) {
            case 'Novice': return 4;
            case 'Intermediate': return 3;
            case 'Advanced': return 2;
            case 'Pro': return 2;
            case 'Virtuoso': return 1;
            default: return 4;
        }
    };

    const maxSubForDifficulty = (): number => {
        return 8; // User wants equal subdivisions from 1 to 8 for all levels
    };

    // Auto-switch: pick next randomly from 1..maxSub, always different from excluded (current) layer
    const pickNextLayerExcluding = (exclude: number | Set<number>): number => {
        const maxSub = maxSubRef.current;
        const excludeSet = typeof exclude === 'number' ? new Set([exclude]) : exclude;
        const available = Array.from({ length: maxSub }, (_, i) => i + 1).filter((l) => !excludeSet.has(l));
        const pool = available.length > 0 ? available : Array.from({ length: maxSub }, (_, i) => i + 1);
        return pool[Math.floor(Math.random() * pool.length)];
    };

    useEffect(() => {
        if (!autoRandomize || !isPlaying) {
            if (scheduleIdRef.current != null) {
                Tone.Transport.clear(scheduleIdRef.current);
                scheduleIdRef.current = null;
            }
            setNextLayer(null);
            setRepetitionsLeft(0);
            return;
        }

        const reps = getRepetitionsForDifficulty();
        const maxSub = maxSubForDifficulty();
        repetitionsRef.current = reps;
        repsLeftAudioRef.current = reps;
        maxSubRef.current = maxSub;

        const seed = pickNextLayerExcluding(activeLayersRef.current);
        nextLayerRef.current = seed;
        setNextLayer(seed);
        setRepetitionsLeft(reps);

        // Schedule switch on bar boundaries (1 repetition = 1 bar); first tick at 1m so we get full bars
        const id = Tone.Transport.scheduleRepeat((_time) => {
            repsLeftAudioRef.current -= 1;

            if (repsLeftAudioRef.current <= 0) {
                const next = nextLayerRef.current ?? pickNextLayerExcluding(activeLayersRef.current);

                // 1. Audio switching (Sample accurate)
                activeLayersRef.current.forEach((l) => engine.toggleLayer(l, false));
                engine.toggleLayer(next, true);

                repsLeftAudioRef.current = repetitionsRef.current;

                // 2. UI Updates (Visual Sync)
                Tone.Draw.schedule(() => {
                    setActiveLayers(new Set([next]));
                    setRepetitionsLeft(repetitionsRef.current);

                    const newNext = pickNextLayerExcluding(next);
                    nextLayerRef.current = newNext;
                    setNextLayer(newNext);
                }, _time);
            } else {
                Tone.Draw.schedule(() => {
                    setRepetitionsLeft(repsLeftAudioRef.current);
                }, _time);
            }
        }, '1m', '1m');
        scheduleIdRef.current = id;

        return () => {
            if (scheduleIdRef.current != null) {
                Tone.Transport.clear(scheduleIdRef.current);
                scheduleIdRef.current = null;
            }
        };
    }, [autoRandomize, isPlaying, difficulty]);

    const togglePlay = async () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
        } else {
            await startAudio();
            engine.metronomeEnabled = metronomeEnabled;
            engine.setBpm(bpm);
            activeLayers.forEach(l => engine.toggleLayer(l, true));
            await engine.start();
            setIsPlaying(true);
        }
    };

    const toggleLayer = (num: number) => {
        if (num > maxLayer) return;
        const next = new Set(activeLayers);
        if (next.has(num)) {
            next.delete(num);
            engine.toggleLayer(num, false);
        } else {
            next.add(num);
            engine.toggleLayer(num, true);
        }
        setActiveLayers(next);
    };

    return (
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full min-w-0 py-2 sm:py-4 fade-in flex-1 min-h-0">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-10 items-stretch md:items-stretch flex-1 min-h-0 min-w-0">
                {/* Visual Pyramid Visualization */}
                <div className="min-w-0 w-full min-h-[280px] md:min-h-[320px] bg-black/40 rounded-2xl sm:rounded-3xl lg:rounded-[40px] p-3 sm:p-5 lg:p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center gap-2 sm:gap-3 flex-[2]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                    <div className="text-center mb-1 sm:mb-2 lg:mb-4 space-y-0.5 sm:space-y-1 shrink-0">
                        <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black italic text-white">Fundamental Subdivisions</h3>
                        <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-widest">Master the Core Divisions</p>
                    </div>

                    {/* Pyramid: rows get wider toward the bottom; scale with container */}
                    <div className="flex flex-col items-center gap-1 sm:gap-2 w-full min-w-0 flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                        {Array.from({ length: maxLayer }, (_, i) => i + 1).map((num) => (
                            <motion.button
                                key={num}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => toggleLayer(num)}
                                className={`
                                    group relative rounded-lg sm:rounded-xl md:rounded-2xl flex items-center gap-2 sm:gap-3 md:gap-4 px-2 sm:px-3 md:px-5 transition-all duration-500 border shrink-0
                                    ${activeLayers.has(num)
                                        ? 'bg-indigo-500 text-white border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-10'
                                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                    }
                                    ${nextLayer === num && autoRandomize
                                        ? 'ring-2 ring-amber-500/50 border-amber-500/30 ring-offset-2 sm:ring-offset-4 ring-offset-black/40'
                                        : ''
                                    }
                                `}
                                style={{
                                    width: `${Math.min(40 + num * 7, 100)}%`,
                                    minWidth: 'min(100px, 90%)',
                                    maxWidth: '100%',
                                    height: 'clamp(2.25rem, 4.5vh, 3.5rem)',
                                    minHeight: '2.25rem',
                                }}
                            >
                                <span className="font-black italic text-sm sm:text-base md:text-lg w-5 sm:w-6 md:w-7 shrink-0 tabular-nums">{num}</span>
                                <div className="flex flex-col items-start leading-tight min-w-0 flex-1 text-left overflow-hidden">
                                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                                        <span className="text-[9px] sm:text-[10px] md:text-xs uppercase font-bold tracking-widest truncate">
                                            {SUBDIVISION_NAMES[num - 1]}
                                        </span>
                                        {nextLayer === num && autoRandomize && (
                                            <span className="text-[8px] bg-amber-500 text-black px-1 py-0.5 rounded-full font-black uppercase shrink-0">Next</span>
                                        )}
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] opacity-60 font-mono mt-0.5 truncate w-full">
                                        {KONNAKOL_SYLLABLES[num - 1]}
                                    </span>
                                </div>

                                {activeLayers.has(num) && isPlaying && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: (60 / bpm) / num, ease: 'linear' }}
                                        className="absolute right-2 sm:right-3 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white shadow-[0_0_15px_white] shrink-0"
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>

                    <div className="mt-2 sm:mt-3 lg:mt-4 p-2 sm:p-3 lg:p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg sm:rounded-xl w-full max-w-md shrink-0">
                        <p className="text-[9px] sm:text-[10px] md:text-xs text-amber-400 font-bold uppercase tracking-widest text-center">
                            {autoRandomize
                                ? (nextLayer != null ? (
                                    <span>
                                        Next: <span className="text-white">{SUBDIVISION_NAMES[nextLayer - 1]}</span> ({KONNAKOL_SYLLABLES[nextLayer - 1]}) in <span className="text-white tabular-nums">{repetitionsLeft}</span> {repetitionsLeft === 1 ? 'rep' : 'reps'}
                                    </span>
                                ) : (
                                    'Auto-switch: one division at a time'
                                ))
                                : 'Enable auto-switch for practice (one division at a time)'}
                        </p>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="w-full md:w-64 lg:w-72 xl:w-80 space-y-3 sm:space-y-4 shrink-0 min-w-0 flex flex-col overflow-y-auto custom-scrollbar max-h-full">
                    <div className="bg-white/5 rounded-2xl sm:rounded-[32px] p-3 sm:p-5 lg:p-6 border border-white/5 shadow-xl space-y-3 sm:space-y-4 lg:space-y-6">
                        <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5">
                            <button
                                onClick={togglePlay}
                                className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl shrink-0
                                    ${isPlaying ? 'bg-red-500 shadow-red-500/20 scale-95' : 'bg-indigo-500 shadow-indigo-500/20 hover:scale-105'}`}
                            >
                                {isPlaying ? <Square fill="currentColor" size={24} className="text-white sm:w-7 sm:h-7" /> :
                                    <Play fill="currentColor" className="text-white ml-0.5 w-6 h-6 sm:w-8 sm:h-8 md:ml-1 md:w-9 md:h-9" />}
                            </button>

                            {/* Scat phrase above metronome (Phase 7 Step 23) */}
                            {scatPhrase && (
                                <div className="px-3 sm:px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center w-full min-w-0">
                                    <span className="text-[9px] text-white/40 uppercase tracking-widest">Say</span>
                                    <p className="text-xs sm:text-sm font-bold text-white/90 italic mt-0.5 truncate">&ldquo;{scatPhrase}&rdquo;</p>
                                </div>
                            )}

                            {/* Metronome Toggle */}
                            <button
                                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest w-full justify-center
                                    ${metronomeEnabled ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}
                            >
                                <Activity size={14} className="shrink-0" />
                                Metronome: {metronomeEnabled ? 'ON' : 'OFF'}
                            </button>

                            {/* Auto-Switch Toggle (every level) */}
                            <button
                                onClick={() => setAutoRandomize(!autoRandomize)}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest w-full justify-center
                                    ${autoRandomize ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/5 text-white/20'}`}
                            >
                                <Shuffle size={14} className="shrink-0" />
                                Auto-Switch: {autoRandomize ? 'ON' : 'OFF'}
                            </button>

                            <div className="w-full space-y-3 sm:space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    <span>Global Tempo</span>
                                    <span className="text-white font-mono text-base sm:text-lg">{bpm}</span>
                                </div>
                                <input
                                    type="range" min="40" max="220" value={bpm}
                                    onChange={(e) => setCurrentBpm(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8 border border-white/5 shadow-xl space-y-4 sm:space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500 shrink-0" /> Layer Presets
                        </h4>
                        <p className="text-[10px] text-white/30">
                            More presets unlock at higher difficulties.
                        </p>
                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2 max-h-[min(16rem,35vh)] sm:max-h-[min(18rem,40vh)] overflow-y-auto custom-scrollbar">
                            {visiblePresets.map((p) => (
                                <button
                                    key={p.name + p.layers.join('-')}
                                    onClick={() => {
                                        const newLayers = new Set(p.layers);
                                        activeLayers.forEach((l) => engine.toggleLayer(l, false));
                                        setActiveLayers(newLayers);
                                        newLayers.forEach((l) => engine.toggleLayer(l, true));
                                    }}
                                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-all text-left group"
                                >
                                    <div className="text-white font-bold text-xs group-hover:text-indigo-400 transition-colors">{p.name}</div>
                                    <div className="text-[9px] text-white/20 mt-0.5 uppercase tracking-widest">{p.layers.join(' + ')}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-500/10 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 border border-amber-500/20 shadow-xl">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2 sm:mb-3">
                            Difficulty Info
                        </h4>
                        <p className="text-[10px] sm:text-xs text-white/60 leading-relaxed">
                            At <span className="text-amber-400 font-bold">{difficulty}</span> level,
                            subdivision switches every <span className="text-white font-bold">{getRepetitionsForDifficulty()} {getRepetitionsForDifficulty() === 1 ? 'rep' : 'reps'}</span> when auto-switch is on.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
