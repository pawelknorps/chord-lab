import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trophy, GraduationCap, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import * as Tone from 'tone';
import { useAudio } from '../../context/AudioContext';
import { useMidi } from '../../context/MidiContext';
import { midiToNoteName } from '../../core/theory';
import { getTargetVoicing, SCALE_C6_DIM, isChordTone } from './barryHarrisLogic';

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
    const { activeNotes } = useMidi();

    const [mode, setMode] = useState<'practice' | 'challenge'>('practice');
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [fallingNotes, setFallingNotes] = useState<FallingNote[]>([]);
    const [practiceMidi, setPracticeMidi] = useState<number>(60); // Start with C4
    const [showHint, setShowHint] = useState(true);
    const [feedback, setFeedback] = useState<string>('');
    const [successPulse, setSuccessPulse] = useState(false);

    const nextId = useRef(0);
    const synthRef = useRef<Tone.PolySynth | null>(null);

    // Audio Init
    useEffect(() => {
        if (isReady && !synthRef.current) {
            synthRef.current = new Tone.PolySynth(Tone.Synth, {
                volume: -12,
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.05, decay: 0.2, sustain: 0.2, release: 0.8 }
            }).toDestination();
        }
    }, [isReady]);

    const prevActiveNotes = useRef<Set<number>>(new Set());

    // MIDI Synth Trigger with robust synchronization to activeNotes
    useEffect(() => {
        if (!synthRef.current) return;

        const currentSelected = activeNotes;
        const previousSelected = prevActiveNotes.current;

        // Notes to start: in current but not in previous
        currentSelected.forEach(note => {
            if (!previousSelected.has(note)) {
                synthRef.current?.triggerAttack(midiToNoteName(note));
            }
        });

        // Notes to stop: in previous but not in current
        previousSelected.forEach(note => {
            if (!currentSelected.has(note)) {
                synthRef.current?.triggerRelease(midiToNoteName(note));
            }
        });

        prevActiveNotes.current = new Set(currentSelected);
    }, [activeNotes]);

    // Watch for Practice Mode Success
    const currentTargetVoicing = useMemo(() => getTargetVoicing(practiceMidi), [practiceMidi]);

    useEffect(() => {
        if (mode !== 'practice') return;

        const isCorrect = currentTargetVoicing.every(n => activeNotes.has(n));
        // Check if user is holding EXACTLY the target voicing (or at least the target voicing)
        // Usually in practice, holding extra notes is okay, but let's be strict-ish
        if (isCorrect) {
            setFeedback('Excellent!');
            setSuccessPulse(true);
            setTimeout(() => {
                setSuccessPulse(false);
                nextPracticeNote();
            }, 800);
        }
    }, [activeNotes, currentTargetVoicing, mode]);

    const nextPracticeNote = () => {
        setPracticeMidi(prev => {
            const currentIndex = SCALE_C6_DIM.indexOf(prev % 12);
            const nextIndex = (currentIndex + 1) % SCALE_C6_DIM.length;
            const nextPc = SCALE_C6_DIM[nextIndex];
            const octave = Math.floor(prev / 12) - 1;
            return nextPc + 12 * (octave + 1);
        });
        setFeedback('');
    };

    const prevPracticeNote = () => {
        setPracticeMidi(prev => {
            const currentIndex = SCALE_C6_DIM.indexOf(prev % 12);
            const nextIndex = (currentIndex - 1 + SCALE_C6_DIM.length) % SCALE_C6_DIM.length;
            const nextPc = SCALE_C6_DIM[nextIndex];
            const octave = Math.floor(prev / 12) - 1;
            return nextPc + 12 * (octave + 1);
        });
        setFeedback('');
    };

    // Challenge Mode - Spawn Notes
    useEffect(() => {
        if (!isPlaying || mode !== 'challenge') return;

        const interval = setInterval(() => {
            const pc = SCALE_C6_DIM[Math.floor(Math.random() * SCALE_C6_DIM.length)];
            const octave = Math.random() > 0.5 ? 4 : 5;
            const midi = pc + 12 * (octave + 1);
            const target = getTargetVoicing(midi);

            setFallingNotes(prev => [
                ...prev,
                {
                    id: nextId.current++,
                    midi,
                    x: Math.random() * 80 + 10,
                    y: 0,
                    targetVoicing: target
                }
            ]);
        }, SPAWN_RATE);

        return () => clearInterval(interval);
    }, [isPlaying, mode]);

    // Challenge Mode - Game Loop
    useEffect(() => {
        if (!isPlaying || mode !== 'challenge') return;

        const loop = setInterval(() => {
            setFallingNotes(prev => {
                const next = prev.map(n => ({ ...n, y: n.y + 0.5 })).filter(n => n.y < 110);

                // Check collision/success for falling notes
                next.forEach(note => {
                    const isMatched = note.targetVoicing.every(n => activeNotes.has(n));
                    if (isMatched) {
                        setScore(s => s + 100);
                        setFeedback('Perfect!');
                        // We'll mark it for removal in the filter below if we wanted, 
                        // but let's just use the fact that we can filter it out now.
                    }
                });

                return next.filter(note => !note.targetVoicing.every(n => activeNotes.has(n)));
            });
        }, 30);

        return () => clearInterval(loop);
    }, [isPlaying, mode, activeNotes]);

    const startGame = async () => {
        if (!isReady) await startAudio();
        setIsPlaying(true);
        setScore(0);
        setFallingNotes([]);
        setFeedback('');
    };

    // Piano Keyboard Helper
    const PianoKey: React.FC<{ midi: number; type: 'white' | 'black'; isGhost?: boolean; isActive?: boolean }> = ({ midi, type, isGhost, isActive }) => {
        const isHeld = activeNotes.has(midi);
        const colorClass = type === 'white'
            ? (isHeld ? 'bg-green-400' : isGhost ? 'bg-blue-200/50' : 'bg-white')
            : (isHeld ? 'bg-green-600' : isGhost ? 'bg-blue-600/50' : 'bg-gray-800');

        return (
            <div
                className={`
                    ${type === 'white' ? 'w-10 h-32 border border-gray-300 rounded-b-md' : 'w-6 h-20 -mx-3 z-10 rounded-b-sm'} 
                    ${colorClass} transition-colors duration-150 flex items-end justify-center pb-2
                `}
            >
                {isActive && <div className="w-2 h-2 rounded-full bg-red-500 mb-1" />}
            </div>
        );
    };

    const renderPiano = (startMidi: number, endMidi: number) => {
        const keys = [];
        for (let m = startMidi; m <= endMidi; m++) {
            const pc = m % 12;
            const isBlack = [1, 3, 6, 8, 10].includes(pc);
            keys.push(
                <PianoKey
                    key={m}
                    midi={m}
                    type={isBlack ? 'black' : 'white'}
                    isGhost={showHint && currentTargetVoicing.includes(m)}
                    isActive={m === practiceMidi}
                />
            );
        }
        return <div className="flex items-start justify-center">{keys}</div>;
    };

    return (
        <div className="h-full min-w-0 flex flex-col items-center justify-start bg-[#0a0a0f] text-white p-8 overflow-y-auto">
            {/* Header / Nav */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        BARRY HARRIS LAB
                    </h1>
                    <p className="text-gray-500 font-medium">Master the 6th Diminished scale & Drop-2 voicings</p>
                </div>

                <div className="flex gap-4 items-center bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
                    <button
                        onClick={() => setMode('practice')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${mode === 'practice' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <GraduationCap size={18} /> Practice
                    </button>
                    <button
                        onClick={() => setMode('challenge')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all ${mode === 'challenge' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Trophy size={18} /> Challenge
                    </button>
                </div>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {mode === 'practice' ? (
                        <div className={`relative bg-white/5 border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center transition-all ${successPulse ? 'ring-4 ring-green-500/50 bg-green-500/10' : ''}`}>
                            <div className="absolute top-6 left-6 flex gap-2">
                                <button onClick={() => setShowHint(!showHint)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400" title="Toggle Hint">
                                    {showHint ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>

                            <div className="text-center mb-12">
                                <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Target Melody Note</span>
                                <h2 className="text-8xl font-black mt-2">{midiToNoteName(practiceMidi).replace(/\d/, '')}</h2>
                                <p className="text-gray-500 text-xl mt-2">
                                    {isChordTone(practiceMidi) ? 'C Major 6th' : 'B Diminished 7th'}
                                </p>
                            </div>

                            <div className="flex items-center gap-12 mb-12">
                                <button onClick={prevPracticeNote} className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                    <ArrowLeft size={32} />
                                </button>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex gap-4">
                                        {currentTargetVoicing.map(midi => (
                                            <div key={midi} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold border-2 transition-all ${activeNotes.has(midi) ? 'bg-green-500 border-green-400 scale-110 shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                                {midiToNoteName(midi).replace(/\d/, '')}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600 font-mono tracking-tighter">DROP-2 VOICING REQUIRED</p>
                                </div>

                                <button onClick={nextPracticeNote} className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                    <ArrowRight size={32} />
                                </button>
                            </div>

                            {/* Piano Guide */}
                            <div className="w-full overflow-x-auto pb-4">
                                {renderPiano(48, 72)}
                            </div>

                            <div className="mt-8 text-2xl font-bold text-green-400 h-8">
                                {feedback}
                            </div>
                        </div>
                    ) : (
                        <div className="relative h-[600px] bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            {/* Game Header */}
                            <div className="absolute top-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
                                <div className="flex items-center gap-2 text-2xl font-bold text-yellow-500">
                                    <Trophy size={24} /> {score}
                                </div>
                                {!isPlaying ? (
                                    <button onClick={startGame} className="flex items-center gap-2 px-8 py-3 bg-blue-600 rounded-full font-bold hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                                        <Play size={20} fill="currentColor" /> START MISSION
                                    </button>
                                ) : (
                                    <button onClick={() => setIsPlaying(false)} className="p-3 bg-white/10 rounded-full hover:bg-white/20">
                                        <Pause size={24} />
                                    </button>
                                )}
                            </div>

                            {/* Falling Notes Area */}
                            <div className="relative h-full w-full">
                                <AnimatePresence>
                                    {fallingNotes.map(note => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ top: -50, opacity: 0 }}
                                            animate={{ top: `${note.y}%`, opacity: 1 }}
                                            exit={{ scale: 1.5, opacity: 0 }}
                                            style={{
                                                position: 'absolute',
                                                left: `${note.x}%`,
                                            }}
                                            className="group flex flex-col items-center"
                                        >
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center font-black text-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-white/20">
                                                {midiToNoteName(note.midi).replace(/\d/, '')}
                                            </div>
                                            <div className="mt-2 flex gap-1">
                                                {note.targetVoicing.map((_, i) => (
                                                    <div key={i} className="w-2 h-2 rounded-full bg-blue-400/50" />
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {fallingNotes.length === 0 && !isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-medium italic">
                                        Ready to test your speed?
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <GraduationCap className="text-blue-400" /> Theory Guide
                        </h3>
                        <div className="space-y-4 text-sm text-gray-400">
                            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <p className="text-blue-300 font-bold mb-1">C6 Scale Tones</p>
                                <p>C, E, G, A &rarr; Harmonize with <span className="text-white">C Maj6</span></p>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <p className="text-purple-300 font-bold mb-1">C6 Non-Scale Tones</p>
                                <p>D, F, Ab, B &rarr; Harmonize with <span className="text-white">B Dim7</span></p>
                            </div>
                            <p className="mt-4 leading-relaxed">
                                Barry Harris famously used this "scale of thirds" to create smooth movement between stable 6th chords and passing diminished chords.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-xl font-bold mb-4">MIDI Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {activeNotes.size > 0 ? (
                                Array.from(activeNotes).sort((a, b) => a - b).map(n => (
                                    <div key={n} className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm font-bold">
                                        {midiToNoteName(n)}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 italic text-sm">No notes detected...</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold text-white mb-2">Drop-2 Rule</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Take a close-position voicing, identify the 2nd voice from the top, and drop it down exactly one octave.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BarryHarris;
