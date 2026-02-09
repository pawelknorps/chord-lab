import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { UnifiedPiano } from './shared/UnifiedPiano';
import { useMidi } from '../context/MidiContext';
import { useAudio } from '../context/AudioContext';

interface InteractivePianoProps {
    startOctave?: number;
    endOctave?: number;
    onNoteOn?: (midi: number) => void;
    onNoteOff?: (midi: number) => void;
    showInput?: boolean; // Whether to show generic MIDI input
    enableSound?: boolean; // Whether to play generic piano sound
    highlightedNotes?: number[]; // Externally controlled highlights
}

export function InteractivePiano({
    startOctave = 3,
    endOctave = 5,
    onNoteOn,
    onNoteOff,
    showInput = true,
    enableSound = true,
    highlightedNotes = []
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

        const { note, type, velocity } = lastNote;

        if (type === 'noteon') {
            setActiveNotes(prev => new Set(prev).add(note));
            // Trigger sound
            if (enableSound && synthRef.current && isReady) {
                synthRef.current.triggerAttack(Tone.Frequency(note, "midi").toNote(), Tone.now(), velocity / 127);
            }
            onNoteOn?.(note);
        } else {
            setActiveNotes(prev => {
                const newSet = new Set(prev);
                newSet.delete(note);
                return newSet;
            });
            // Release sound
            if (enableSound && synthRef.current && isReady) {
                synthRef.current.triggerRelease(Tone.Frequency(note, "midi").toNote());
            }
            onNoteOff?.(note);
        }

    }, [lastNote, showInput, enableSound, isReady, onNoteOn, onNoteOff]);

    const handleNoteClick = (note: number) => {
        if (enableSound && synthRef.current && isReady) {
            synthRef.current.triggerAttackRelease(Tone.Frequency(note, "midi").toNote(), "8n");
        }
        onNoteOn?.(note);
        setTimeout(() => onNoteOff?.(note), 200);
    };

    return (
        <div className="relative w-full flex justify-center">
            {!selectedInput && showInput && (
                <div className="absolute -top-6 left-0 text-xs text-red-400 animate-pulse">
                    ⚠️ No MIDI Device Selected
                </div>
            )}
            <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-black/20 shadow-xl">
                <UnifiedPiano
                    mode="input"
                    octaveRange={[startOctave, endOctave]}
                    activeNotes={Array.from(activeNotes)}
                    highlightedNotes={highlightedNotes}
                    onNoteClick={handleNoteClick}
                    showLabels="note-name"
                />
            </div>
        </div>
    );
}
