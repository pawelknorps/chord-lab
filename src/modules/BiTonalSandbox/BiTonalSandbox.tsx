import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Volume2, Mic } from 'lucide-react';
import { useSplitBrainAudio } from './hooks/useSplitBrainAudio';
import { generateExercise } from './exerciseGenerator';
import type { BiTonalExercise } from './exerciseGenerator';
import { noteNameToMidi, midiToNoteName } from '../../core/theory';
import SingingArchitect from './SingingArchitect';
import { InteractivePiano } from '../../components/InteractivePiano';

const BiTonalSandbox: React.FC = () => {
    const { playShell, playUpperStructure, setDissonance, stopAll } = useSplitBrainAudio();

    const [exercise, setExercise] = useState<BiTonalExercise | null>(null);
    const [status, setStatus] = useState<'idle' | 'listening' | 'success'>('idle');
    const [dissonanceAmount, setDissonanceAmount] = useState(0);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [mode, setMode] = useState<'keyboard' | 'mic'>('keyboard');

    // Initialize exercise
    useEffect(() => {
        newExercise();
    }, []);

    const newExercise = useCallback(() => {
        stopAll();
        const ex = generateExercise();
        setExercise(ex);
        setStatus('idle');
        setDissonanceAmount(0);
        setDissonance(0);
        setActiveNotes(new Set());

        // Auto-play shell after a delay
        setTimeout(() => {
            playShell(ex.shellNotes, '2m'); // Play for 2 measures
        }, 500);
    }, [playShell, stopAll, setDissonance]);

    const handlePlayShell = () => {
        if (exercise) playShell(exercise.shellNotes, '1m');
    };

    const handleSingingPitch = (midi: number) => {
        if (mode !== 'mic') return;

        setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.add(midi); // Add note
            return newSet;
        });
    };

    // MIDI Logic handled via InteractivePiano callbacks
    const handleMidiNoteOn = useCallback((midi: number) => {
        if (mode !== 'keyboard' || !exercise) return;
        setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.add(midi);
            return newSet;
        });
    }, [mode, exercise]);

    const handleMidiNoteOff = useCallback((midi: number) => {
        if (mode !== 'keyboard' || !exercise) return;
        setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(midi);
            return newSet;
        });
    }, [mode, exercise]);

    // Check active notes against target
    useEffect(() => {
        if (!exercise || activeNotes.size === 0) {
            if (mode === 'keyboard') {
                // Reset dissonance if no notes held
                if (activeNotes.size === 0) {
                    setDissonanceAmount(0);
                    setDissonance(0);
                }
            }
            return;
        }

        const targetMidi = exercise.upperStructureNotes.map(n => noteNameToMidi(n));
        const targetPCs = new Set(targetMidi.map(n => n % 12));

        const activeMidi = Array.from(activeNotes);
        const activePCs = activeMidi.map(n => n % 12);

        // Check if ALL active notes are in the target
        const allCorrect = activePCs.every(pc => targetPCs.has(pc));
        // Check if ALL target notes are present (complete triad)
        const completesTriad = targetPCs.size <= new Set(activePCs).size && allCorrect;

        if (completesTriad) {
            setStatus('success');
            setDissonanceAmount(0);
            setDissonance(0);
            // We don't necessarily need to play the chord as InteractivePiano plays the inputs
            // But playing the "Ideal" voicing (upper structure) on success is good reinforcement.
            playUpperStructure(targetMidi.map(n => midiToNoteName(n)), '1n');

            if (mode === 'mic') {
                setTimeout(() => setActiveNotes(new Set()), 2000);
            }
        } else if (allCorrect) {
            // Partial match - low dissonance
            setDissonanceAmount(0.2);
            setDissonance(0.2);
        } else {
            // Wrong notes - high dissonance
            setDissonanceAmount(1);
            setDissonance(1);
        }

    }, [activeNotes, exercise, playUpperStructure, setDissonance, mode]);


    if (!exercise) return <div>Loading...</div>;

    return (
        <div className="flex flex-col h-full bg-gradient-to-b from-gray-900 to-black text-white p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold neon-text">
                    <span className="text-purple-400">Target:</span> {exercise.targetColor}
                </h2>

                <div className="flex gap-4">
                    <div className="flex bg-white/10 rounded-full p-1">
                        <button
                            onClick={() => { setMode('keyboard'); setActiveNotes(new Set()); }}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${mode === 'keyboard' ? 'bg-purple-600 text-white' : 'hover:bg-white/10'}`}
                        >
                            <Volume2 size={16} /> Keyboard
                        </button>
                        <button
                            onClick={() => { setMode('mic'); setActiveNotes(new Set()); }}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${mode === 'mic' ? 'bg-purple-600 text-white' : 'hover:bg-white/10'}`}
                        >
                            <Mic size={16} /> Sing
                        </button>
                    </div>

                    <button
                        onClick={newExercise}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <RefreshCw size={20} /> Next Exercise
                    </button>
                </div>
            </div>

            {mode === 'mic' && (
                <div className="mb-8">
                    <SingingArchitect
                        isActive={true}
                        targetNotes={exercise.upperStructureNotes}
                        onPitchDetected={handleSingingPitch}
                    />
                    <div className="text-center mt-2 text-sm text-gray-400">
                        Sing the notes of the Upper Structure: {exercise.upperStructureRoot} {exercise.upperStructureQuality}
                        <div className="flex justify-center gap-2 mt-2">
                            {exercise.upperStructureNotes.map(note => {
                                const noteMidi = noteNameToMidi(note);
                                const isSung = Array.from(activeNotes).some(n => n % 12 === noteMidi % 12);
                                return (
                                    <span key={note} className={`px-2 py-1 rounded ${isSung ? 'bg-green-500 text-black' : 'bg-gray-700'}`}>
                                        {note}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Split Brain Visualization */}
            <div className="flex-1 flex gap-8 items-center justify-center relative">

                {/* Left Hemisphere (Shell) */}
                <div className="flex-1 flex flex-col items-center">
                    <motion.div
                        className="w-64 h-64 rounded-full bg-indigo-900/30 border-2 border-indigo-500/50 flex items-center justify-center relative glow-blue"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2">{exercise.shellRoot}{exercise.shellQuality}</div>
                            <div className="text-sm text-indigo-300">Left Ear (Shell)</div>
                        </div>
                    </motion.div>

                    <button
                        onClick={handlePlayShell}
                        className="mt-8 p-4 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-full transition-all"
                    >
                        <Volume2 size={32} />
                    </button>
                </div>

                {/* Connection / Separator */}
                <div className="w-px h-64 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

                {/* Right Hemisphere (Upper Structure) */}
                <div className="flex-1 flex flex-col items-center">
                    <motion.div
                        className={`
              w-64 h-64 rounded-full flex items-center justify-center relative border-2 transition-colors duration-300
              ${status === 'success'
                                ? 'bg-green-900/30 border-green-500/50 glow-green'
                                : 'bg-pink-900/30 border-pink-500/50 glow-pink'}
            `}
                        animate={
                            dissonanceAmount > 0
                                ? { x: [-5, 5, -3, 3, 0], filter: ["blur(0px)", "blur(2px)", "blur(0px)"] }
                                : { scale: status === 'success' ? [1, 1.1, 1] : 1 }
                        }
                        transition={dissonanceAmount > 0 ? { duration: 0.2, repeat: Infinity } : { duration: 1 }}
                    >
                        <div className="text-center">
                            {status === 'success' ? (
                                <>
                                    <div className="text-4xl font-bold mb-2 text-green-400">{exercise.upperStructureRoot} {exercise.upperStructureQuality}</div>
                                    <div className="text-sm text-green-300">Locked In!</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-5xl font-bold mb-2 text-pink-400">?</div>
                                    <div className="text-sm text-pink-300">Right Ear (Grip)</div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <div className="mt-8 flex gap-4">
                        <div className="text-center">
                            <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Play on {mode === 'keyboard' ? 'MIDI Keyboard' : 'Mic'}</div>
                            <div className="h-2 w-32 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                                    animate={{ width: `${(1 - dissonanceAmount) * 100}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Stability</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Instructions */}
            <div className="mt-8">
                {mode === 'keyboard' && (
                    <div className="flex justify-center mb-6">
                        <InteractivePiano
                            startOctave={3}
                            endOctave={6}
                            onNoteOn={handleMidiNoteOn}
                            onNoteOff={handleMidiNoteOff}
                            enableSound={true}
                        />
                    </div>
                )}

                <div className="text-center text-white/40">
                    <p>Listen to the Shell in your Left Ear. Find the Triad that creates the target color.</p>
                    <p className="text-xs mt-2">
                        {dissonanceAmount > 0.5 ? "Too Dissonant! Try a different root." :
                            status === 'success' ? "Nice Job!" : "Getting closer..."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BiTonalSandbox;
