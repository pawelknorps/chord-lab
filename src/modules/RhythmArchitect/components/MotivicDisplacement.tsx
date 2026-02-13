import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Play, Square, ArrowRight, ArrowLeft, RefreshCw, Undo2, Music, Zap, Layers, Download, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRhythmStore } from '../state/useRhythmStore';
import { useAudio } from '../../../context/AudioContext';

interface MotiStep {
    active: boolean;
    pitch: string;
}

export default function DisplacementLab() {
    const { bpm, setCurrentBpm, difficulty } = useRhythmStore();
    const { startAudio } = useAudio();
    const [isPlaying, setIsPlaying] = useState(false);
    const [motive, setMotive] = useState<MotiStep[]>(
        new Array(16).fill(null).map((_, i) => ({
            active: i % 4 === 0,
            pitch: 'C3'
        }))
    );
    const [shift, setShift] = useState(0);

    const synthRef = useRef<Tone.PolySynth | null>(null);
    const sequenceRef = useRef<Tone.Sequence | null>(null);

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
        if (sequenceRef.current) sequenceRef.current.events = getShiftedMotive();
    }, [motive, shift, getShiftedMotive]);

    const togglePlay = async () => {
        if (isPlaying) {
            Tone.Transport.stop();
            sequenceRef.current?.stop();
            setIsPlaying(false);
        } else {
            await startAudio();
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

    const shiftedMotive = getShiftedMotive();

    return (
        <div className="flex flex-col gap-10 w-full max-w-6xl py-4 fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Visual Grid and displacement area */}
                <div className="bg-black/60 rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">Primary Motive</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Edit Grid</span>
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                            {motive.map((step, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        const next = [...motive];
                                        next[idx] = { ...next[idx], active: !next[idx].active };
                                        setMotive(next);
                                    }}
                                    className={`aspect-square rounded-lg transition-all border ${step.active ? 'bg-purple-500 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-10 py-6 border-y border-white/5 bg-white/[0.02] rounded-3xl">
                        <button onClick={() => setShift(s => s - 1)} className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-xl hover:scale-110"><ArrowLeft size={24} /></button>
                        <div className="text-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Total Offset</div>
                            <div className="text-5xl font-black italic tracking-tighter text-white font-mono">{shift % 16}</div>
                        </div>
                        <button onClick={() => setShift(s => s + 1)} className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-xl hover:scale-110"><ArrowRight size={24} /></button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Shifted Resultant</span>
                            {isPlaying && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 animate-pulse flex items-center gap-2"> <Music size={12} /> Live Output</span>}
                        </div>
                        <div className="grid grid-cols-8 gap-2">
                            {shiftedMotive.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    animate={{
                                        scale: step.active ? 1.05 : 1,
                                        opacity: step.active ? 1 : 0.2
                                    }}
                                    className={`aspect-square rounded-lg transition-all border ${step.active ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-white/5 border-transparent'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 shadow-xl space-y-10">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={togglePlay}
                                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl
                                    ${isPlaying ? 'bg-red-500 shadow-red-500/20 scale-95' : 'bg-indigo-500 shadow-indigo-500/20 hover:scale-105'}`}
                            >
                                {isPlaying ? <Square fill="currentColor" size={32} className="text-white" /> :
                                    <Play fill="currentColor" size={40} className="text-white ml-2" />}
                            </button>
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    <span>Global Tempo</span>
                                    <span className="text-white font-mono text-lg">{bpm}</span>
                                </div>
                                <input type="range" min="40" max="240" value={bpm} onChange={(e) => setCurrentBpm(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                            <button onClick={() => setMotive(motive.map(() => ({ active: Math.random() > 0.7, pitch: 'C3' })))} className="flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-all border border-white/5">
                                <RefreshCw size={14} /> Randomize
                            </button>
                            <button onClick={() => setMotive([...motive].reverse())} className="flex items-center justify-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 transition-all border border-white/5">
                                <Undo2 size={14} /> Reverse
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-[40px] p-10 border border-white/5 shadow-xl space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Move size={14} className="text-purple-400" /> Logic Presets
                        </h4>
                        <div className="space-y-3">
                            {[
                                { name: 'Tresillo Shift', motive: [true, false, false, true, false, false, true, false, false, false, false, false, false, false, false, false], shift: 3 },
                                { name: 'Jati Permutation', motive: [true, true, true, false, true, true, false, true, true, true, false, false, false, false, false, false], shift: 1 }
                            ].map(p => (
                                <button
                                    key={p.name}
                                    onClick={() => {
                                        setMotive(p.motive.map(m => ({ active: m, pitch: 'C3' })));
                                        setShift(p.shift);
                                    }}
                                    className="w-full p-5 bg-white/[0.03] border border-white/5 hover:bg-white/10 rounded-2xl transition-all text-left group"
                                >
                                    <div className="text-white font-bold text-sm group-hover:text-purple-400 transition-colors">{p.name}</div>
                                    <div className="text-[9px] text-white/20 uppercase tracking-widest mt-1">Preset Offset: {p.shift}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
