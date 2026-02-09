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
        <div className="flex flex-col h-full bg-[var(--bg-app)] text-[var(--text-primary)] p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight">
                    <span className="text-[var(--accent)]">Target:</span> {exercise.targetColor}
                </h2>

                <div className="flex gap-4">
                    <div className="flex bg-[var(--bg-surface)] rounded-md p-1 border border-[var(--border-subtle)]">
                        <button
                            onClick={() => { setMode('keyboard'); setActiveNotes(new Set()); }}
                            className={`px-4 py-2 rounded-sm flex items-center gap-2 transition-all text-sm font-medium ${mode === 'keyboard' ? 'bg-[var(--bg-hover)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            <Volume2 size={16} /> Keyboard
                        </button>
                        <button
                            onClick={() => { setMode('mic'); setActiveNotes(new Set()); }}
                            className={`px-4 py-2 rounded-sm flex items-center gap-2 transition-all text-sm font-medium ${mode === 'mic' ? 'bg-[var(--bg-hover)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            <Mic size={16} /> Sing
                        </button>
                    </div>

                    <button
                        onClick={newExercise}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] rounded-md transition-all text-sm font-medium"
                    >
                        <RefreshCw size={18} /> Next Exercise
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
                    <div className="text-center mt-2 text-sm text-[var(--text-muted)]">
                        Sing the notes of the Upper Structure: {exercise.upperStructureRoot} {exercise.upperStructureQuality}
                        <div className="flex justify-center gap-2 mt-2">
                            {exercise.upperStructureNotes.map(note => {
                                const noteMidi = noteNameToMidi(note);
                                const isSung = Array.from(activeNotes).some(n => n % 12 === noteMidi % 12);
                                return (
                                    <span key={note} className={`px-2 py-1 rounded text-xs font-mono border ${isSung ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]'}`}>
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
                        className="w-64 h-64 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--border-active)] flex items-center justify-center relative"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-2 tracking-tighter">{exercise.shellRoot}{exercise.shellQuality}</div>
                            <div className="text-sm text-[var(--text-muted)] uppercase tracking-wider font-semibold">Left Ear (Shell)</div>
                        </div>
                    </motion.div>

                    <button
                        onClick={handlePlayShell}
                        className="mt-8 p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-full transition-all"
                    >
                        <Volume2 size={24} />
                    </button>
                </div>

                {/* Connection / Separator */}
                <div className="w-px h-64 bg-[var(--border-subtle)]"></div>

                {/* Right Hemisphere (Upper Structure) */}
                <div className="flex-1 flex flex-col items-center">
                    <motion.div
                        className={`
              w-64 h-64 rounded-full flex items-center justify-center relative border-2 transition-colors duration-300
              ${status === 'success'
                                ? 'bg-green-900/10 border-green-500'
                                : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'}
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
                                    <div className="text-4xl font-bold mb-2 text-green-500 tracking-tighter">{exercise.upperStructureRoot} {exercise.upperStructureQuality}</div>
                                    <div className="text-sm text-green-600 font-medium uppercase tracking-wider">Locked In!</div>
                                </>
                            ) : (
                                <>
                                    <div className="text-5xl font-bold mb-2 text-[var(--text-muted)]">?</div>
                                    <div className="text-sm text-[var(--text-muted)] uppercase tracking-wider font-semibold">Right Ear (Grip)</div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    <div className="mt-8 flex gap-4 w-64">
                        <div className="text-center w-full">
                            <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-2">Stability</div>
                            <div className="h-1 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[var(--accent)]"
                                    animate={{ width: `${(1 - dissonanceAmount) * 100}%`, opacity: (1 - dissonanceAmount) }}
                                />
                            </div>
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

                <div className="text-center text-[var(--text-muted)]">
                    <p>Listen to the Shell in your Left Ear. Find the Triad that creates the target color.</p>
                    <p className="text-xs mt-2 font-medium text-[var(--accent)]">
                        {dissonanceAmount > 0.5 ? "Too Dissonant! search for consonance." :
                            status === 'success' ? "Nice Job!" : "Getting closer..."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BiTonalSandbox;
