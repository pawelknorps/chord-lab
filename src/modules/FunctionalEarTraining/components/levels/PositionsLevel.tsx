import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Play, Search, Info, Guitar } from 'lucide-react';
import * as Tone from 'tone';
import { CHROMATIC_SCALE, getAllScaleNotesOnFretboard, getScaleNotes, CAGED_POSITIONS, C_AM_POSITION_RANGES } from '../../utils/positionUtils';

const GUITAR_STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];

export const PositionsLevel: React.FC = () => {
    const [root, setRoot] = useState('C');
    const [scaleType, setScaleType] = useState('major');
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

    const scaleNotes = useMemo(() => getScaleNotes(root, scaleType), [root, scaleType]);
    const fretboardNotes = useMemo(() => getAllScaleNotesOnFretboard(root, scaleType), [root, scaleType]);

    const playScale = async () => {
        await Tone.start();
        const synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { release: 1 }
        }).toDestination();

        const now = Tone.now();
        scaleNotes.forEach((note, i) => {
            synth.triggerAttackRelease(note + "4", "8n", now + i * 0.2);
        });
        // Play octave
        synth.triggerAttackRelease(scaleNotes[0] + "5", "4n", now + scaleNotes.length * 0.2);

        setTimeout(() => synth.dispose(), (scaleNotes.length + 2) * 200);
    };

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-5xl min-w-0 fade-in relative z-10 px-4">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-white tracking-tighter italic uppercase"
                >
                    Fretboard Geometry
                </motion.h2>
                <motion.p
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/40 font-bold uppercase tracking-widest text-xs"
                >
                    Visualize scale structures across the fretboard field.
                </motion.p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full glass-panel p-6 rounded-3xl border border-white/5">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Root</span>
                    <div className="flex flex-wrap gap-1">
                        {CHROMATIC_SCALE.map(n => (
                            <button
                                key={n}
                                onClick={() => setRoot(n)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${root === n ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Type</span>
                    <div className="flex gap-1">
                        {['major', 'minor'].map(t => (
                            <button
                                key={t}
                                onClick={() => setScaleType(t)}
                                className={`px-4 py-2 rounded-lg text-[10px] uppercase font-black transition-all ${scaleType === t ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 text-white/40 hover:text-white'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Playback</span>
                    <button
                        onClick={playScale}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] uppercase font-black text-white transition-all flex items-center gap-2"
                    >
                        <Play size={12} fill="currentColor" /> Play Scale
                    </button>
                </div>
            </div>

            {/* Fretboard Explorer */}
            <div className="w-full max-w-full min-w-0 glass-panel p-8 rounded-[40px] border border-white/10 overflow-x-auto no-scrollbar">
                <div className="relative min-w-[800px]">
                    <div className="flex ml-12 mb-4">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} className="flex-1 text-center text-[10px] font-black text-white/10">
                                {i}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-1 relative">
                        {/* Fret lines */}
                        <div className="absolute inset-0 flex ml-12 pointer-events-none">
                            {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="flex-1 border-r border-white/10" />
                            ))}
                        </div>

                        {GUITAR_STRINGS.map((string, sIdx) => (
                            <div key={sIdx} className="flex items-center h-8 relative z-10">
                                <div className="w-12 text-xs font-black text-white/20 uppercase text-right pr-4">{string}</div>
                                <div className="flex-1 flex">
                                    {Array.from({ length: 16 }).map((_, fIdx) => {
                                        const note = fretboardNotes.find(n => n.string === sIdx + 1 && n.fret === fIdx);
                                        return (
                                            <div key={fIdx} className="flex-1 h-8 flex items-center justify-center relative">
                                                {note && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className={`
                                                            w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black
                                                            ${note.isRoot ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-white/10 text-white/60'}
                                                        `}
                                                    >
                                                        {note.note}
                                                    </motion.div>
                                                )}
                                                {/* String line */}
                                                <div className="absolute left-0 right-0 h-[1px] bg-white/5 -z-10" style={{ top: '50%' }} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend / Info */}
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-white/30">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    Tonic (Root)
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    Scale Degrees
                </div>
                <div className="flex items-center gap-2">
                    <Guitar size={14} />
                    Geometric Reference
                </div>
            </div>
        </div>
    );
};
