import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Square, ArrowRight, ArrowLeft, RefreshCw, Undo2, Music, Zap, Layers, Download } from 'lucide-react';
import { useAudioCleanup } from '../../../hooks/useAudioManager';
import { useMidiExport } from '../../../hooks/useMidiExport';

interface MotiStep {
    active: boolean;
    pitch: string;
}

export default function MotivicDisplacement() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [motive, setMotive] = useState<MotiStep[]>(
        new Array(16).fill(null).map((_, i) => ({
            active: i % 4 === 0,
            pitch: 'C3'
        }))
    );
    const [shift, setShift] = useState(0);
    const [bpm, setBpm] = useState(100);
    const { exportMidi } = useMidiExport();

    const synthRef = useRef<Tone.PolySynth | null>(null);
    const sequenceRef = useRef<Tone.Sequence | null>(null);
    useAudioCleanup('displacement');

    useEffect(() => {
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
        }).toDestination();

        return () => {
            synthRef.current?.dispose();
            sequenceRef.current?.dispose();
        };
    }, []);

    const getShiftedMotive = useCallback(() => {
        const len = motive.length;
        const s = ((shift % len) + len) % len;
        const rightPart = motive.slice(len - s);
        const leftPart = motive.slice(0, len - s);
        return [...rightPart, ...leftPart];
    }, [motive, shift]);

    useEffect(() => {
        if (sequenceRef.current) {
            sequenceRef.current.events = getShiftedMotive();
        }
    }, [motive, shift, getShiftedMotive]);


    const togglePlay = async () => {
        if (isPlaying) {
            Tone.Transport.stop();
            sequenceRef.current?.stop();
            setIsPlaying(false);
        } else {
            await Tone.start();
            Tone.Transport.bpm.value = bpm;

            if (sequenceRef.current) sequenceRef.current.dispose();

            const seq = getShiftedMotive();

            sequenceRef.current = new Tone.Sequence((time, step) => {
                if (step.active && synthRef.current) {
                    synthRef.current.triggerAttackRelease(step.pitch, "16n", time);
                }
            }, seq, "16n").start(0);

            Tone.Transport.start();
            setIsPlaying(true);
        }
    };

    const handleStepClick = (index: number) => {
        const newM = [...motive];
        newM[index] = { ...newM[index], active: !newM[index].active };
        setMotive(newM);
    };

    const randomize = () => {
        const pitches = ['C3', 'D3', 'Eb3', 'G3', 'Ab3'];
        const next = motive.map(() => ({
            active: Math.random() > 0.7,
            pitch: pitches[Math.floor(Math.random() * pitches.length)]
        }));
        setMotive(next);
    };

    const reverse = () => {
        setMotive([...motive].reverse());
    };

    const handleShift = (dir: number) => {
        setShift(s => s + dir);
    };

    const handleExport = () => {
        const current = getShiftedMotive();
        const notes = current.map((step, i) => {
            if (!step.active) return null;
            return {
                name: step.pitch,
                time: i * Tone.Time("16n").toSeconds(),
                duration: Tone.Time("16n").toSeconds(),
                velocity: 0.9
            };
        }).filter(n => n !== null) as any[];

        exportMidi(notes, { bpm, name: `Displacement-Ratio-${shift}` });
    };

    const shiftedMotive = getShiftedMotive();

    return (
        <div className="max-w-6xl mx-auto h-full flex flex-col gap-8 p-6">
            {/* Header */}
            <div className="flex items-end justify-between px-2">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Motivic Displacement</h2>
                    <p className="text-[var(--text-muted)] mt-1">Shift and permute melodic motives across the grid.</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={randomize} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                        <RefreshCw size={14} /> Randomize
                    </button>
                    <button onClick={reverse} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                        <Undo2 size={14} /> Reverse
                    </button>
                    <button onClick={handleExport} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20">
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Visualizer and Input */}
                <div className="lg:col-span-3 space-y-4 flex flex-col items-center justify-center bg-[var(--bg-panel)] rounded-[2.5rem] p-12 border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                    <div className="w-full space-y-8">
                        {/* Original Motive Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] uppercase tracking-widest font-black text-purple-400">Original Motive</span>
                                <span className="text-[10px] uppercase tracking-widest font-black text-[var(--text-muted)]">Edit Below</span>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {[0, 1, 2, 3].map(beat => (
                                    <div key={beat} className="flex gap-1.5">
                                        {[0, 1, 2, 3].map(step => {
                                            const idx = beat * 4 + step;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleStepClick(idx)}
                                                    className={`
                                                        flex-1 h-14 rounded-xl transition-all duration-300 border
                                                        ${motive[idx].active
                                                            ? 'bg-purple-500 border-purple-400 shadow-lg shadow-purple-900/40 scale-105'
                                                            : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                        }
                                                    `}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Arrows / Displacement Hud */}
                        <div className="flex items-center justify-center gap-8 py-4">
                            <button
                                onClick={() => handleShift(-1)}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <div className="text-center px-8 border-x border-white/5">
                                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-[var(--text-muted)] mb-1">Total Shift</div>
                                <div className="text-3xl font-black text-white font-mono">{shift > 0 ? `+${shift}` : shift}</div>
                            </div>

                            <button
                                onClick={() => handleShift(1)}
                                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 hover:scale-110 transition-all"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>

                        {/* Displaced Output Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400">Current Displacement</span>
                                {isPlaying && <span className="text-[10px] uppercase tracking-widest font-black text-indigo-400 animate-pulse flex items-center gap-2"> <Music size={12} /> Live Output</span>}
                            </div>
                            <div className="grid grid-cols-4 gap-4 opacity-80">
                                {[0, 1, 2, 3].map(beat => (
                                    <div key={beat} className="flex gap-1.5">
                                        {[0, 1, 2, 3].map(step => {
                                            const idx = beat * 4 + step;
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`
                                                        flex-1 h-16 rounded-xl transition-all duration-300 border
                                                        ${shiftedMotive[idx].active
                                                            ? 'bg-gradient-to-b from-indigo-400 to-indigo-600 border-indigo-300 shadow-xl shadow-indigo-900/60 scale-110 z-10'
                                                            : 'bg-white/[0.02] border-white/5'
                                                        }
                                                    `}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-3 text-[var(--text-secondary)] text-xs font-medium">
                        <Zap size={14} className="text-amber-500" />
                        Tip: Click the top row to define a rhythm, then use arrows to displace it.
                    </div>
                </div>

                {/* Side Controls */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[var(--bg-panel)] rounded-[2.5rem] p-8 border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

                        <div className="flex flex-col gap-8">
                            <div className="flex items-center gap-6">
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
                                        <label className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">Tempo</label>
                                        <span className="text-xl font-black text-white">{bpm} <span className="text-sm font-medium text-[var(--text-muted)]">BPM</span></span>
                                    </div>
                                    <input
                                        type="range"
                                        min="40"
                                        max="180"
                                        value={bpm}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setBpm(val);
                                            Tone.Transport.bpm.value = val;
                                        }}
                                        className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Presets / Techniques */}
                    <div className="bg-[var(--bg-panel)] rounded-[2.5rem] p-8 border border-[var(--border-subtle)] shadow-xl">
                        <h3 className="text-sm font-black text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={16} className="text-purple-400" />
                            Displacement Presets
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: 'Tresillo Shift', shift: 3, motive: [true, false, false, true, false, false, true, false, false, false, false, false, false, false, false, false] },
                                { name: 'Clave Displacement', shift: 4, motive: [true, false, false, true, false, false, true, false, false, false, true, false, true, false, false, false] },
                                { name: 'Paradiddle Permute', shift: 1, motive: [true, true, false, false, true, true, false, false, true, true, false, false, true, true, false, false] }
                            ].map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setMotive(preset.motive.map(m => ({ active: m, pitch: 'C3' })));
                                        setShift(preset.shift);
                                    }}
                                    className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left group"
                                >
                                    <div className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors">{preset.name}</div>
                                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">Shift {preset.shift} &bull; Grid 16n</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
