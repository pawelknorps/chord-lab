import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import * as Tone from 'tone';
import { useAudio } from '../../context/AudioContext';
import { useMidi } from '../../context/MidiContext';
import { midiToNoteName } from '../../core/theory';
import { getReflectedNote } from '../../core/theory/negativeHarmony';

const NegativeMirror: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    const { lastNote } = useMidi();

    // Axis angle in degrees. 0 = Vertical (C-F# axis? No, vertical usually C at top).
    // Let's standard: C at top (0 deg).
    // G at 30 deg (360/12).
    const [axisAngle, setAxisAngle] = useState(0);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [reflectedNotes, setReflectedNotes] = useState<Set<number>>(new Set());

    const synthRef = useRef<Tone.PolySynth | null>(null);
    const mirrorSynthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        if (isReady && !synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                volume: -8,
                oscillator: { type: 'sawtooth' },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }
            }).toDestination();

            mirrorSynthRef.current = new Tone.PolySynth(Tone.Synth, {
                volume: -8,
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 }
            }).toDestination();

            // Pan reflected notes to the left/right? or just centered.
            // Let's keep centered for now.
        }

        return () => {
            synthRef.current?.dispose();
            mirrorSynthRef.current?.dispose();
            synthRef.current = null;
            mirrorSynthRef.current = null;
        };
    }, [isReady]);

    // Handle MIDI Input
    useEffect(() => {
        if (!lastNote) return;

        if (lastNote.type === 'noteon') {
            const note = lastNote.note;
            const negNote = getReflectedNote(note, axisAngle);

            setActiveNotes(prev => new Set(prev).add(note));
            setReflectedNotes(prev => new Set(prev).add(negNote));

            if (synthRef.current && isReady) {
                synthRef.current.triggerAttack(midiToNoteName(note));
                mirrorSynthRef.current?.triggerAttack(midiToNoteName(negNote));
            }
        } else {
            const note = lastNote.note;
            const negNote = getReflectedNote(note, axisAngle);

            setActiveNotes(prev => {
                const s = new Set(prev);
                s.delete(note);
                return s;
            });
            setReflectedNotes(prev => {
                const s = new Set(prev);
                s.delete(negNote);
                return s;
            });

            if (synthRef.current && isReady) {
                synthRef.current.triggerRelease(midiToNoteName(note));
                mirrorSynthRef.current?.triggerRelease(midiToNoteName(negNote));
            }
        }
    }, [lastNote, axisAngle, isReady]);

    return (
        <div className="h-full flex flex-col items-center bg-gray-900 text-white p-8 overflow-hidden select-none">
            <div className="mb-4 text-center">
                <h2 className="text-3xl font-bold neon-text flex items-center justify-center gap-3">
                    <ArrowRightLeft /> Negative Mirror
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                    Chromatic Reflection. Drag the axis to explore Negative Harmony.
                </p>
            </div>

            <div className="flex-1 flex items-center justify-center w-full relative">
                {/* Main Disc */}
                <div className="relative w-[400px] h-[400px]">
                    {/* Chromatic Ring */}
                    <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#333" strokeWidth="1" />
                        {/* Notes */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const angle = i * 30;
                            const rad = (angle - 90) * (Math.PI / 180);
                            const x = 50 + 40 * Math.cos(rad);
                            const y = 50 + 40 * Math.sin(rad);
                            const pc = i;
                            const noteName = midiToNoteName(pc + 60).slice(0, -1);

                            const isActive = Array.from(activeNotes).some(n => n % 12 === pc);
                            const isReflected = Array.from(reflectedNotes).some(n => n % 12 === pc);

                            return (
                                <g key={i}>
                                    {/* Connection Line if active */}
                                    {isActive && (
                                        <line
                                            x1={x} y1={y}
                                            // Find reflected note position
                                            x2={50 + 40 * Math.cos((((2 * axisAngle - angle) % 360 - 90) * Math.PI / 180))}
                                            y2={50 + 40 * Math.sin((((2 * axisAngle - angle) % 360 - 90) * Math.PI / 180))}
                                            stroke={isReflected ? "#00ff88" : "#ff0055"}
                                            strokeWidth="0.5"
                                            strokeDasharray="2 1"
                                            className="opacity-50"
                                        />
                                    )}

                                    <circle
                                        cx={x} cy={y}
                                        r={isActive || isReflected ? "4" : "2"}
                                        fill={isActive ? "#ff0055" : isReflected ? "#00ff88" : "#444"}
                                    />
                                    <text
                                        x={x} y={y}
                                        dy={isActive || isReflected ? -6 : -4}
                                        textAnchor="middle"
                                        fontSize="5"
                                        fill={isActive ? "#ff0055" : isReflected ? "#00ff88" : "#888"}
                                        fontWeight="bold"
                                    >
                                        {noteName}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Axis of Symmetry - Interactive */}
                    <motion.div
                        className="absolute inset-0 z-10"
                        style={{ rotate: axisAngle }}
                    >
                        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] -translate-x-1/2 pointer-events-none"></div>
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-xs px-1 rounded text-black font-bold pointer-events-none">Axis</div>
                    </motion.div>

                    {/* Rotation Control - Invisible overlay for simple mouse interaction could work, 
                         or just a slider below is safer for reliable UI */}
                </div>
            </div>

            {/* Slider for Axis */}
            <div className="w-full max-w-md mt-8 bg-gray-800 p-4 rounded-xl relative">
                {!isReady && (
                    <button
                        onClick={() => startAudio()}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center text-blue-400 font-bold z-20 rounded-xl"
                    >
                        Click to Start Audio Engine
                    </button>
                )}
                <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>C Axis (0°)</span>
                    <span>F# Axis (180°)</span>
                    <span>C Axis (360°)</span>
                </div>
                <input
                    type="range"
                    min="0" max="360" step="15" // 15 degrees = semitone fidelity (30/2)
                    value={axisAngle}
                    onChange={(e) => setAxisAngle(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="text-center mt-2 font-mono text-blue-400">
                    Axis Angle: {axisAngle}°
                </div>
            </div>
        </div>
    );
};

export default NegativeMirror;
