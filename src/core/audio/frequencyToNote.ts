import { Note } from '@tonaljs/tonal';

export interface NoteInfo {
    noteName: string;
    pitchClass: string;
    octave: number;
    centsDeviation: number;
    frequency: number;
    isPerfectIntonation: boolean;
}

/**
 * Converts a frequency (Hz) to note information using Tonal.js.
 * Perfect intonation is defined as being within ±10 cents.
 */
export function frequencyToNote(frequency: number): NoteInfo | null {
    if (frequency <= 0) return null;

    // Formula: cents = 1200 * log2(f / referenceF)
    // A4 = 440Hz is the standard reference.
    const n = 12 * Math.log2(frequency / 440);
    const midi = Math.round(n) + 69;
    const centsDeviation = Math.round((n - Math.round(n)) * 100);

    const noteName = Note.fromMidi(midi);
    const pitchClass = Note.pitchClass(noteName);
    const octave = Note.octave(noteName) ?? 0;

    return {
        noteName,
        pitchClass,
        octave,
        centsDeviation,
        frequency,
        isPerfectIntonation: Math.abs(centsDeviation) <= 10,
    };
}
