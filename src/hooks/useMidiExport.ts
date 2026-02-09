import { useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';

interface MidiNote {
    name: string;
    time: number | string; // Transport time or seconds
    duration: number | string;
    velocity?: number;
}

interface ExportOptions {
    bpm?: number;
    name?: string;
    instrument?: string; // Optional metadata
}

export function useMidiExport() {

    const exportMidi = useCallback((notes: MidiNote[], options: ExportOptions = {}) => {
        const midi = new Midi();

        // Add a track
        const track = midi.addTrack();
        track.name = options.name || "Chord Lab Rhythm";

        // Set BPM if provided, defaulting to Tone.Transport.bpm.value if running (or 120)
        const bpm = options.bpm || Tone.Transport.bpm.value || 120;

        // @tonejs/midi 2.0+ uses setTempo(bpm) or tempos array manipulation.
        // It seems the type definitions might be slightly outdated or we need to access tempos array directly.
        // midi.header.setTempo(bpm) is the standard convenience method.
        try {
            midi.header.setTempo(bpm);
        } catch (e) {
            // Fallback for older/newer versions if setTempo is missing
            midi.header.tempos.push({ bpm, ticks: 0 });
        }

        // Add notes
        notes.forEach(n => {
            try {
                track.addNote({
                    midi: Tone.Frequency(n.name).toMidi(),
                    time: Tone.Time(n.time).toSeconds(),
                    duration: Tone.Time(n.duration).toSeconds(),
                    velocity: n.velocity || 0.8
                });
            } catch (e) {
                console.warn("Failed to add MIDI note:", n, e);
            }
        });

        // Generate Blob
        const array = midi.toArray();
        // Cast array to any to bypass strict ArrayBuffer checks if needed, or rely on standard behavior
        const blob = new Blob([array as any], { type: 'audio/midi' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${options.name || 'rhythm-export'}.mid`;
        document.body.appendChild(anchor);
        anchor.click();

        // Cleanup
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, []);

    return { exportMidi };
}
