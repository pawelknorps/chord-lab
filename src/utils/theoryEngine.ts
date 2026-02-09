import * as Scale from 'tonal-scale';
import { midiToNoteName as coreMidiToNoteName } from '../core/theory';

/**
 * Theory Engine: The single source of truth for music theory logic in Chord Lab.
 * Focused on pedagogical correctness and jazz-standard functional harmony.
 */

export const KEYS = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
    'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'
];

export type ChordFunction =
    | 'Tonic'
    | 'Subdominant'
    | 'Dominant'
    | 'SecondaryDominant'
    | 'ModalInterchange'
    | 'UpperStructure';

/**
 * Get the correct enharmonic spelling for a MIDI note in a specific context.
 * 
 * @param midi The MIDI note number
 * @param tonic The current key center (e.g., "C", "Eb")
 * @param chordContext Optional chord symbol or functional context (e.g., "V/ii", "iv")
 */
export function getFunctionalNoteName(midi: number, tonic: string, chordContext?: string): string {
    // If no specific functional context is provided, use the harmonized core logic
    if (!chordContext) {
        return coreMidiToNoteName(midi, tonic);
    }

    const pc = midi % 12;
    const octave = Math.floor(midi / 12) - 1;

    // Handle Secondary Dominants (Jazz Rules)
    if (chordContext?.startsWith('V/')) {
        const target = chordContext.split('/')[1]; // e.g., "ii", "V"
        // Secondary dominants usually introduce a leading tone to the target
        if (target === 'ii' && pc === 1) return `C#${octave}`; // V/ii (A7) -> C# (3rd)
        if (target === 'vi' && pc === 8) return `G#${octave}`; // V/vi (E7) -> G# (3rd)
        if (target === 'V' && pc === 6) return `F#${octave}`;  // V/V (D7) -> F# (3rd)
        if (target === 'iii' && pc === 3) return `D#${octave}`; // V/iii (B7) -> D# (3rd)
        if (target === 'IV' && pc === 10) return `Bb${octave}`; // V/IV (C7) -> Bb (7th)
    }

    // Handle Modal Interchange (parallel minor)
    if (chordContext === 'iv' || chordContext === 'bVI' || chordContext === 'bVII' || chordContext === 'ii7b5') {
        if (pc === 8) return `Ab${octave}`; // b6 in major (from minor)
        if (pc === 3) return `Eb${octave}`; // b3 in major (from minor)
        if (pc === 10) return `Bb${octave}`; // b7 in major (from minor)
        if (pc === 1) return `Db${octave}`; // b2 in major (from minor/phrygian - Neapolitan)
    }

    // Fallback to core contextual naming
    return coreMidiToNoteName(midi, tonic);
}

/**
 * Identify the functional role of a chord in a key.
 */
export function getChordFunction(_chordRoot: string, _quality: string, _tonic: string): ChordFunction {
    // TODO: Implement calculation
    return 'Tonic';
}

/**
 * Minimal helper to get Secondary Dominant options for a key.
 */
export function getSecondaryDominants(tonic: string) {
    const scale = Scale.notes(tonic, 'major');
    return [
        { label: 'V/ii', root: scale[5], quality: 'dom7' }, // VI7 (6th degree)
        { label: 'V/iii', root: scale[6], quality: 'dom7' }, // VII7 (7th degree)
        { label: 'V/IV', root: scale[0], quality: 'dom7' }, // I7 (1st degree)
        { label: 'V/V', root: scale[1], quality: 'dom7' },  // II7 (2nd degree)
        { label: 'V/vi', root: scale[2], quality: 'dom7' }, // III7 (3rd degree)
    ];
}
