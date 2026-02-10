import { useState, useEffect } from 'react';
import { PyramidEngine } from '../../../utils/pyramidEngine';
import { Play, Square, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRhythmStore } from '../state/useRhythmStore';

const engine = new PyramidEngine();

const SUBDIVISION_NAMES = [
    'Whole Note', 'Half Notes', 'Triplets', '16th Notes',
    'Quintuplets', 'Sextuplets', 'Septuplets', '32nd Notes',
    'Nontuplets', 'Decuplets', 'Endecuplets', 'Dodecuplets'
];

const KONNAKOL_SYLLABLES = [
    'Ta', 'Ta-Ka', 'Ta-Ki-Ta', 'Ta-Ka-Di-Mi',
    'Ta-Di-Gi-Na-Thom', 'Ta-Ki-Ta-Ta-Ki-Ta', 'Ta-Ki-Ta-Ta-Ka-Di-Mi', 'Ta-Ka-Di-Mi-Ta-Ka-Di-Mi'
];

export default function PyramidLab() {
    const { bpm, setCurrentBpm, difficulty, metronomeEnabled, setMetronomeEnabled } = useRhythmStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeLayers, setActiveLayers] = useState<Set<number>>(new Set([4]));

    useEffect(() => {
        return () => {
            engine.stopAll();
        };
    }, []);

    const maxLayer = difficulty === 'Novice' ? 4 : difficulty === 'Intermediate' ? 6 : difficulty === 'Advanced' ? 8 : 12;

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

                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <motion.button
                            key={num}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{
                                opacity: num <= maxLayer ? 1 : 0.2,
                                x: 0,
                                filter: num <= maxLayer ? 'none' : 'grayscale(1)'
                            }}
                            onClick={() => toggleLayer(num)}
                            disabled={num > maxLayer}
                            className={`
                                group relative h-12 rounded-2xl flex items-center gap-4 px-6 transition-all duration-500 border
                                ${activeLayers.has(num)
                                    ? 'bg-indigo-500 text-white border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.3)] z-10'
                                    : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                }
                            `}
                            style={{
                                width: `${20 + (num * 6.5)}%`,
                                minWidth: '160px'
                            }}
                        >
                            <span className="font-black italic text-lg w-8">{num}</span>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] uppercase font-bold tracking-widest hidden md:block">
                                    {SUBDIVISION_NAMES[num - 1] || 'Poly-let'}
                                </span>
                                {KONNAKOL_SYLLABLES[num - 1] && (
                                    <span className="text-[9px] opacity-40 font-mono mt-1 hidden md:block">
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
                                    className="absolute right-4 w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white]"
                                />
                            )}
                        </motion.button>
                    ))}
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
                                { name: 'Fundamental', layers: [1, 2, 4], color: 'indigo' },
                                { name: 'Hemiola (3:2)', layers: [2, 3], color: 'purple' },
                                { name: 'Septal Drift', layers: [4, 7], color: 'emerald' },
                            ].map(p => (
                                <button
                                    key={p.name}
                                    onClick={() => setActiveLayers(new Set(p.layers))}
                                    className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-all text-left group"
                                >
                                    <div className="text-white font-bold text-xs group-hover:text-indigo-400 transition-colors">{p.name}</div>
                                    <div className="text-[9px] text-white/20 mt-1 uppercase tracking-widest">{p.layers.join(' + ')}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
