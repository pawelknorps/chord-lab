import { useState, useEffect, useRef } from 'react';
import { PyramidEngine } from '../../../utils/pyramidEngine';
import { Play, Square, Zap, Activity, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRhythmStore } from '../state/useRhythmStore';

const engine = new PyramidEngine();

const SUBDIVISION_NAMES = [
    'Whole Note', 'Half Notes', '8th Notes'
];

const KONNAKOL_SYLLABLES = [
    'Ta', 'Ta-Ka', 'Ta-Ka-Di-Mi'
];

export default function PyramidLab() {
    const { bpm, setCurrentBpm, difficulty, metronomeEnabled, setMetronomeEnabled } = useRhythmStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeLayers, setActiveLayers] = useState<Set<number>>(new Set([2]));
    const [autoRandomize, setAutoRandomize] = useState(false);
    const randomizeIntervalRef = useRef<any>(null);

    useEffect(() => {
        return () => {
            engine.stopAll();
            if (randomizeIntervalRef.current) {
                clearInterval(randomizeIntervalRef.current);
            }
        };
    }, []);

    // Maximum subdivision is always 2 (8th notes)
    const maxLayer = 2;

    // Randomization interval based on difficulty
    const getRandomizeInterval = () => {
        switch (difficulty) {
            case 'Novice': return 0; // No randomization
            case 'Intermediate': return 8000; // Every 8 seconds
            case 'Advanced': return 4000; // Every 4 seconds
            case 'Pro': return 2000; // Every 2 seconds
            case 'Virtuoso': return 1000; // Every second
            default: return 0;
        }
    };

    // Random layer selection
    const randomizeLayers = () => {
        const numLayers = difficulty === 'Intermediate' ? 1 : difficulty === 'Advanced' ? 2 : 2;
        const availableLayers = [1, 2];
        const selected = new Set<number>();

        for (let i = 0; i < numLayers; i++) {
            const remaining = availableLayers.filter(l => !selected.has(l));
            if (remaining.length > 0) {
                const random = remaining[Math.floor(Math.random() * remaining.length)];
                selected.add(random);
            }
        }

        // Clear old layers
        activeLayers.forEach(l => engine.toggleLayer(l, false));

        // Set new layers
        setActiveLayers(selected);
        selected.forEach(l => engine.toggleLayer(l, true));
    };

    useEffect(() => {
        if (autoRandomize && isPlaying && difficulty !== 'Novice') {
            const interval = getRandomizeInterval();
            if (interval > 0) {
                randomizeIntervalRef.current = setInterval(randomizeLayers, interval);
            }
        } else {
            if (randomizeIntervalRef.current) {
                clearInterval(randomizeIntervalRef.current);
                randomizeIntervalRef.current = null;
            }
        }

        return () => {
            if (randomizeIntervalRef.current) {
                clearInterval(randomizeIntervalRef.current);
            }
        };
    }, [autoRandomize, isPlaying, difficulty]);

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
        } else {
            engine.metronomeEnabled = metronomeEnabled;
            engine.setBpm(bpm);
            activeLayers.forEach(l => engine.toggleLayer(l, true));
            engine.start();
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
        <div className="flex flex-col gap-10 w-full max-w-6xl py-4 fade-in">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Visual Pyramid Visualization */}
                <div className="flex-1 w-full bg-black/40 rounded-[40px] p-10 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center gap-4">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                    <div className="text-center mb-6 space-y-2">
                        <h3 className="text-2xl font-black italic text-white">Fundamental Subdivisions</h3>
                        <p className="text-xs text-white/40 uppercase tracking-widest">Master the Core Divisions</p>
                    </div>

                    {Array.from({ length: maxLayer }, (_, i) => i + 1).map((num) => (
                        <motion.button
                            key={num}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            onClick={() => toggleLayer(num)}
                            className={`
                                group relative h-16 rounded-2xl flex items-center gap-4 px-8 transition-all duration-500 border
                                ${activeLayers.has(num)
                                    ? 'bg-indigo-500 text-white border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-10'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                }
                            `}
                            style={{
                                width: `${40 + (num * 25)}%`,
                                minWidth: '200px'
                            }}
                        >
                            <span className="font-black italic text-2xl w-10">{num}</span>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-sm uppercase font-bold tracking-widest">
                                    {SUBDIVISION_NAMES[num - 1]}
                                </span>
                                {KONNAKOL_SYLLABLES[num - 1] && (
                                    <span className="text-xs opacity-40 font-mono mt-1">
                                        {KONNAKOL_SYLLABLES[num - 1]}
                                    </span>
                                )}
                            </div>

                            {activeLayers.has(num) && isPlaying && (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: (60 / bpm) / (num / 4),
                                        ease: "easeInOut"
                                    }}
                                    className="absolute right-6 w-3 h-3 rounded-full bg-white shadow-[0_0_15px_white]"
                                />
                            )}
                        </motion.button>
                    ))}

                    {difficulty !== 'Novice' && (
                        <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest text-center">
                                {difficulty} Challenge: {autoRandomize ? 'Auto-switching divisions active!' : 'Enable auto-randomization for practice'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Control Panel */}
                <div className="w-full md:w-80 space-y-6 shrink-0">
                    <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 shadow-xl space-y-8">
                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={togglePlay}
                                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
                                    ${isPlaying ? 'bg-red-500 shadow-red-500/20 scale-95' : 'bg-indigo-500 shadow-indigo-500/20 hover:scale-105'}`}
                            >
                                {isPlaying ? <Square fill="currentColor" size={32} className="text-white" /> :
                                    <Play fill="currentColor" size={40} className="text-white ml-2" />}
                            </button>

                            {/* Metronome Toggle */}
                            <button
                                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest
                                    ${metronomeEnabled ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-white/20'}`}
                            >
                                <Activity size={14} />
                                Metronome: {metronomeEnabled ? 'ON' : 'OFF'}
                            </button>

                            {/* Auto-Randomize Toggle (only for Intermediate+) */}
                            {difficulty !== 'Novice' && (
                                <button
                                    onClick={() => setAutoRandomize(!autoRandomize)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest
                                        ${autoRandomize ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/5 text-white/20'}`}
                                >
                                    <Shuffle size={14} />
                                    Auto-Switch: {autoRandomize ? 'ON' : 'OFF'}
                                </button>
                            )}

                            <div className="w-full space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    <span>Global Tempo</span>
                                    <span className="text-white font-mono text-lg">{bpm}</span>
                                </div>
                                <input
                                    type="range" min="40" max="220" value={bpm}
                                    onChange={(e) => setCurrentBpm(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Layer Presets
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                            {[
                                { name: 'Whole Notes', layers: [1], color: 'indigo' },
                                { name: 'Half Notes', layers: [2], color: 'purple' },
                                { name: 'Both (Hemiola)', layers: [1, 2], color: 'emerald' },
                            ].map(p => (
                                <button
                                    key={p.name}
                                    onClick={() => {
                                        const newLayers = new Set(p.layers);
                                        activeLayers.forEach(l => engine.toggleLayer(l, false));
                                        setActiveLayers(newLayers);
                                        newLayers.forEach(l => engine.toggleLayer(l, true));
                                    }}
                                    className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-all text-left group"
                                >
                                    <div className="text-white font-bold text-xs group-hover:text-indigo-400 transition-colors">{p.name}</div>
                                    <div className="text-[9px] text-white/20 mt-1 uppercase tracking-widest">{p.layers.join(' + ')}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {difficulty !== 'Novice' && (
                        <div className="bg-amber-500/10 rounded-[32px] p-6 border border-amber-500/20 shadow-xl">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3">
                                Difficulty Info
                            </h4>
                            <p className="text-xs text-white/60 leading-relaxed">
                                At <span className="text-amber-400 font-bold">{difficulty}</span> level,
                                divisions change every <span className="text-white font-bold">{getRandomizeInterval() / 1000}s</span> when auto-switch is enabled.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
