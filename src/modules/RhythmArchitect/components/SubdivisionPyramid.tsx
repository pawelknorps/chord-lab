import { useState, useEffect } from 'react';
import { PyramidEngine } from '../../../utils/pyramidEngine';
import { Play, Square, Zap, Info, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMidiExport } from '../../../hooks/useMidiExport';

const engine = new PyramidEngine();

const SUBDIVISION_NAMES = [
    'Whole Note',
    'Half Notes',
    'Triplets',
    '16th Notes',
    'Quintuplets',
    'Sextuplets',
    'Septuplets'
];

export default function SubdivisionPyramid() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState(60);
    const [activeLayers, setActiveLayers] = useState<Set<number>>(new Set([4]));
    const { exportMidi } = useMidiExport();

    useEffect(() => {
        return () => {
            engine.stopAll();
        };
    }, []);

    const togglePlay = () => {
        if (isPlaying) {
            engine.stop();
            setIsPlaying(false);
        } else {
            engine.setBpm(bpm);
            activeLayers.forEach(l => engine.toggleLayer(l, true));
            engine.start();
            setIsPlaying(true);
        }
    };

    const toggleLayer = (num: number) => {
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

    const handleExport = () => {
        const measureDur = (60 / bpm) * 4;
        const allNotes: any[] = [];
        const pitches = ['C2', 'E2', 'G2', 'C3', 'E3', 'G3', 'B3']; // Map 1-7

        activeLayers.forEach(layer => {
            const stepDur = measureDur / layer;
            for (let i = 0; i < layer; i++) {
                allNotes.push({
                    name: pitches[layer - 1] || 'C4',
                    time: i * stepDur,
                    duration: 0.1,
                    velocity: 0.8
                });
            }
        });

        exportMidi(allNotes, { bpm, name: `Pyramid-Layers-${Array.from(activeLayers).join('-')}` });
    };

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-8 p-6">
            <div className="flex items-end justify-between px-2">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Subdivision Pyramid</h2>
                    <p className="text-[var(--text-muted)] mt-1">Master rhythmic groupings and transitions.</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 flex flex-col gap-3 items-center justify-center bg-[var(--bg-panel)] rounded-3xl p-12 border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent pointer-events-none" />

                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <button
                            key={num}
                            onClick={() => toggleLayer(num)}
                            className={`
                                group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border
                                ${activeLayers.has(num)
                                    ? 'bg-[var(--accent)] text-white border-white/20 shadow-xl shadow-[var(--accent)]/20 scale-105 z-10'
                                    : 'bg-white/5 border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                            style={{
                                width: `${40 + (num * 8)}%`,
                                minWidth: '180px'
                            }}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl ${activeLayers.has(num) ? 'bg-white/20' : 'bg-black/20'}`}>
                                {num}
                            </div>
                            <div className="flex-1 text-left">
                                <div className={`font-bold tracking-tight ${activeLayers.has(num) ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                                    {SUBDIVISION_NAMES[num - 1]}
                                </div>
                                <div className={`text-[10px] uppercase tracking-widest font-bold opacity-60`}>
                                    {num === 1 ? 'Pulse' : `${num} Hits`}
                                </div>
                            </div>
                            {activeLayers.has(num) && isPlaying && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: (60 / bpm) / num }}
                                    className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]"
                                />
                            )}
                        </button>
                    ))}

                    <div className="mt-8 flex items-center gap-2 text-[var(--text-muted)] text-xs">
                        <Info size={14} />
                        Click layers to toggle subdivisions and build your own pyramid.
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[var(--bg-panel)] rounded-3xl p-8 border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={togglePlay}
                                    className={`
                                        w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                                        ${isPlaying
                                            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-900/40 scale-95'
                                            : 'bg-gradient-to-br from-[var(--accent)] to-indigo-700 text-white shadow-indigo-900/40 hover:scale-105'
                                        }
                                    `}
                                >
                                    {isPlaying ? <Square fill="currentColor" size={32} /> : <Play fill="currentColor" size={40} className="ml-2" />}
                                </button>

                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] text-[var(--accent)] uppercase tracking-widest font-bold">Tempo</label>
                                        <span className="text-xl font-mono text-white">{bpm} <span className="text-sm text-[var(--text-muted)]">BPM</span></span>
                                    </div>
                                    <input
                                        type="range"
                                        min="30"
                                        max="180"
                                        value={bpm}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setBpm(val);
                                            engine.setBpm(val);
                                        }}
                                        className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--bg-panel)] rounded-3xl p-8 border border-[var(--border-subtle)] shadow-xl">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" />
                            Pyramid Presets
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => {
                                    const next = new Set([1, 2, 4]);
                                    setActiveLayers(next);
                                    if (isPlaying) {
                                        [1, 2, 3, 4, 5, 6, 7].forEach(n => engine.toggleLayer(n, next.has(n)));
                                    }
                                }}
                                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                            >
                                <div className="text-white font-bold text-sm">Powers of Two</div>
                                <div className="text-[10px] text-[var(--text-muted)]">1, 2, 4</div>
                            </button>
                            <button
                                onClick={() => {
                                    const next = new Set([2, 3]);
                                    setActiveLayers(next);
                                    if (isPlaying) {
                                        [1, 2, 3, 4, 5, 6, 7].forEach(n => engine.toggleLayer(n, next.has(n)));
                                    }
                                }}
                                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                            >
                                <div className="text-white font-bold text-sm">Hemiola</div>
                                <div className="text-[10px] text-[var(--text-muted)]">2 vs 3</div>
                            </button>
                            <button
                                onClick={() => {
                                    const next = new Set([3, 4, 5]);
                                    setActiveLayers(next);
                                    if (isPlaying) {
                                        [1, 2, 3, 4, 5, 6, 7].forEach(n => engine.toggleLayer(n, next.has(n)));
                                    }
                                }}
                                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-left"
                            >
                                <div className="text-white font-bold text-sm">Odd Textures</div>
                                <div className="text-[10px] text-[var(--text-muted)]">3, 4, 5</div>
                            </button>
                        </div>

                        <button
                            onClick={handleExport}
                            className="mt-6 w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-sm font-bold text-emerald-400 transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
                        >
                            <Download size={18} />
                            Export Active Layers
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
