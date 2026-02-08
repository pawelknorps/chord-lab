import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trophy } from 'lucide-react';
import * as Tone from 'tone';
import { useAudio } from '../../context/AudioContext';
import { useMidi } from '../../context/MidiContext';
import { midiToNoteName } from '../../core/theory';
import { getTargetVoicing, SCALE_C6_DIM } from './barryHarrisLogic';


const SPAWN_RATE = 4000; // ms

interface FallingNote {
    id: number;
    midi: number;
    x: number; // 0-100%
    y: number; // 0-100%
    targetVoicing: number[];
}

const BarryHarris: React.FC = () => {
    const { isReady, startAudio } = useAudio();
    // MidiContext doesn't expose activeNotes, so we track them locally using lastNote
    const { lastNote } = useMidi();
    const [heldNotes, setHeldNotes] = useState<Set<number>>(new Set());

    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
    const nextId = useRef(0);
    const [feedback, setFeedback] = useState<string>('');

    const synthRef = useRef<Tone.PolySynth | null>(null);

    // Audio Init
    useEffect(() => {
        if (isReady && !synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                volume: -10,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
            }).toDestination();
        }
    }, [isReady]);

    // MIDI Tracker
    useEffect(() => {
        if (!lastNote) return;
        if (lastNote.type === 'noteon') {
            setHeldNotes(prev => new Set(prev).add(lastNote.note));
            synthRef.current?.triggerAttack(midiToNoteName(lastNote.note));
        } else {
            setHeldNotes(prev => {
                const s = new Set(prev);
                s.delete(lastNote.note);
                return s;
            });
            synthRef.current?.triggerRelease(midiToNoteName(lastNote.note));
        }
    }, [lastNote]);

    // Game Loop - Spawn Notes
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            // Pick a random note from C6 Dim scale (octave 4 or 5)
            const pc = SCALE_C6_DIM[Math.floor(Math.random() * SCALE_C6_DIM.length)];
            const octave = Math.random() > 0.5 ? 4 : 5;
            const midi = pc + 12 * (octave + 1); // Tone.js octave convention? 60 is C4.
            const target = getTargetVoicing(midi);

            setFallingNotes(prev => [
                ...prev,
                {
                    id: nextId.current++,
                    midi,
                    x: Math.random() * 80 + 10, // 10-90%
                    y: 0, // top
                    targetVoicing: target
                }
            ]);
        }, SPAWN_RATE);

        return () => clearInterval(interval);
    }, [isPlaying]);

    // Game Loop - Move Notes & Check Collision
    useEffect(() => {
        if (!isPlaying) return;

        const loop = setInterval(() => {
            setFallingNotes(prev => {
                const next = prev.map(n => ({ ...n, y: n.y + 1 })).filter(n => n.y < 110);

                // Check harmonization for lowest/closest note?
                // Actually, check if User is holding the target voicing for the lowest note
                const lowest = next[0];
                if (lowest) {
                    checkHarmonization(lowest);
                }

                return next;
            });
        }, 50); // 20fps logic

        return () => clearInterval(loop);
    }, [isPlaying, heldNotes]);

    const checkHarmonization = (note: FallingNote) => {
        // Target Voicing: [n1, n2, n3, n4]
        // User currently holds: heldNotes (Set)
        // Check if all target notes are held

        // Allow for some looseness? No, strict.
        const required = new Set(note.targetVoicing); // These are MIDI numbers

        let match = true;
        // Check if user holds at least the required notes
        // (ignoring extra notes? maybe strict is better)
        if (heldNotes.size < required.size) match = false;
        else {
            for (const n of required) {
                if (!heldNotes.has(n)) {
                    match = false;
                    break;
                }
            }
        }

        if (match) {
            // Success!
            setScore(s => s + 100);
            setFeedback('Perfect!');
            // Remove the note
            setFallingNotes(prev => prev.filter(n => n.id !== note.id));

            // Visual feedback sound?
            // Already hearing user notes.
        }
    };

    const startGame = async () => {
        if (!isReady) await startAudio();
        setIsPlaying(true);
        setScore(0);
        setFallingNotes([]);
        setFeedback('');
    };

    return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            {/* Header */}
            <div className="absolute top-8 w-full flex justify-between px-12 items-center z-10">
                <div>
                    <h2 className="text-3xl font-bold neon-text">Barry Harris Staircase</h2>
                    <p className="text-gray-400">Harmonize the falling melody notes with Drop-2 voicings.</p>
                </div>
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2 text-2xl font-bold text-yellow-400">
                        <Trophy /> {score}
                    </div>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all font-bold"
                    >
                        {isPlaying ? <Pause /> : <Play />}
                    </button>
                    {!isPlaying && (
                        <button onClick={startGame} className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-500 font-bold">
                            New Game
                        </button>
                    )}
                </div>
            </div>

            {/* Game Area */}
            <div className="relative w-[800px] h-[600px] border-b-4 border-white/20 bg-black/20 backdrop-blur-sm rounded-xl overflow-hidden mt-16">
                {/* Feedback */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-bold text-green-400 animate-pulse">
                    {feedback}
                </div>

                {/* Falling Notes */}
                <AnimatePresence>
                    {fallingNotes.map(note => (
                        <motion.div
                            key={note.id}
                            initial={{ top: -50, opacity: 0 }}
                            animate={{ top: `${note.y}%`, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.1 }} // Smooth transform via logic loop? 
                            // Actually framer motion normal usage is layout. 
                            // Here we update state 'note.y' frequently. 
                            // Better to use 'style' prop directly for performance.
                            style={{
                                position: 'absolute',
                                left: `${note.x}%`,
                                top: `${note.y}%`
                            }}
                            className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_#3b82f6] text-white font-bold z-10"
                        >
                            {midiToNoteName(note.midi).slice(0, -1)}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Piano Keyboard Visualizer at bottom? */}
                <div className="absolute bottom-0 w-full h-12 bg-white/5">
                    {/* Simplified visual of held notes */}
                    <div className="flex justify-center h-full items-end gap-1 px-4 pb-2">
                        {Array.from(heldNotes).sort((a, b) => a - b).map(n => (
                            <div key={n} className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                {midiToNoteName(n).slice(0, -1)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 text-gray-400 text-sm max-w-lg text-center">
                <p>Rules: Create a Drop-2 voicing for the melody note.</p>
                <p className="mt-2">If Melody is Chord Tone (C E G A) &rarr; C6 Drop 2.</p>
                <p>If Melody is Non-Chord Tone (D F G# B) &rarr; Bdim7 Drop 2.</p>
            </div>
        </div>
    );
};

export default BarryHarris;
