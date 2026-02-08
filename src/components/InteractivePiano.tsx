import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { PianoKeyboard } from '../modules/ChordLab/components/PianoKeyboard';
import { useMidi } from '../context/MidiContext';
import { useAudio } from '../context/AudioContext';

interface InteractivePianoProps {
    startOctave?: number;
    endOctave?: number;
    onNoteOn?: (midi: number) => void;
    onNoteOff?: (midi: number) => void;
    showInput?: boolean; // Whether to show generic MIDI input
    enableSound?: boolean; // Whether to play generic piano sound
}

export function InteractivePiano({
    startOctave = 3,
    endOctave = 5,
    onNoteOn,
    onNoteOff,
    showInput = true,
    enableSound = true
}: InteractivePianoProps) {
    const { lastNote, selectedInput } = useMidi();
    const { isReady } = useAudio();
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());

    // PolySynth for "Nice Piano" sound (Simple implementation for now)
    const synthRef = useRef<Tone.PolySynth | null>(null);

    useEffect(() => {
        if (!enableSound || !isReady) return;

        // Create a nice sounding synth
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
            envelope: {
                attack: 0.02,
                decay: 0.1,
                sustain: 0.3,
                release: 1
            },
            oscillator: {
                type: "triangle"
            },
            volume: -10
        }).toDestination();

        // Add Reverb for "Nice" feel
        const reverb = new Tone.Reverb(1.5).toDestination();
        synthRef.current.connect(reverb);

        return () => {
            synthRef.current?.dispose();
        };
    }, [isReady, enableSound]);

    useEffect(() => {
        if (!showInput || !lastNote) return;

        // Update visual state
        setActiveNotes(prev => {
            const newSet = new Set(prev);
            if (lastNote.type === 'noteon') {
                newSet.add(lastNote.note);
                // Trigger sound
                if (enableSound && synthRef.current && isReady) {
                    synthRef.current.triggerAttack(Tone.Frequency(lastNote.note, "midi").toNote(), Tone.now(), lastNote.velocity / 127);
                }
                onNoteOn?.(lastNote.note);
            } else {
                newSet.delete(lastNote.note);
                // Release sound
                if (enableSound && synthRef.current && isReady) {
                    synthRef.current.triggerRelease(Tone.Frequency(lastNote.note, "midi").toNote());
                }
                onNoteOff?.(lastNote.note);
            }
            return newSet;
        });

    }, [lastNote, showInput, enableSound, isReady]);

    // Handle mouse clicks on keyboard (Mirror MIDI behavior)
    // PianoKeyboard currently uses chords, but we can pass a dummy handler if we want simple note triggers?
    // The current PianoKeyboard handles "ChordInfo" clicks. 
    // We might need to upgrade PianoKeyboard to handle single note clicks if we want mouse to play single notes.
    // For now, let's just focus on MIDI INPUT visualization.

    return (
        <div className="relative">
            {!selectedInput && showInput && (
                <div className="absolute -top-6 left-0 text-xs text-red-400 animate-pulse">
                    ⚠️ No MIDI Device Selected
                </div>
            )}
            <PianoKeyboard
                startOctave={startOctave}
                endOctave={endOctave}
                highlightedNotes={Array.from(activeNotes)}
                // We pass empty chords/handler for now as this is a "Visualizer/Player" mostly
                chords={[]}
                onChordClick={() => { }}
            />
        </div>
    );
}
