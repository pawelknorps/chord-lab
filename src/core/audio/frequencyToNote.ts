import * as Note from '@tonaljs/note';

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
 * Chromatic note conversion: n = 12*log2(f/440)+69 (MIDI note); cents offset = (n - round(n))*100.
 * Perfect intonation is defined as being within ±10 cents.
 */
export function frequencyToNote(frequency: number): NoteInfo | null {
    if (frequency <= 0) return null;

    // Chromatic: n (continuous semitones from A4); MIDI = round(n)+69; cents = (n - round(n))*100
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
