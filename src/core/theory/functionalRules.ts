/**
 * Jazz Functional Music Theory Rules
 * Used for correct enharmonic spelling of non-diatonic notes.
 */

export const SECONDARY_DOMINANT_OVERRIDE: Record<string, Record<number, string>> = {
    'C': {
        61: 'C#', // V/ii (A7) 3rd
        68: 'G#', // V/vi (E7) 3rd
        66: 'F#', // V/V (D7) 3rd
        63: 'D#', // V/iii (B7) 3rd
        70: 'Bb', // V/IV (C7) 7th
    }
};

export const MODAL_INTERCHANGE_OVERRIDE: Record<string, Record<number, string>> = {
    'C': {
        68: 'Ab', // iv (Fm) 3rd, bVI (Ab) root
        63: 'Eb', // bIII (Eb) root
        70: 'Bb', // bVII (Bb) root
        61: 'Db', // bII (Db) root
    }
};

// Generic pitch class based rules (Tonic-agnostic if possible, but usually relative to tonic)
export function getFunctionalPitchClassOverride(pc: number, tonic: string, chordContext?: string): string | null {
    // Relative PC to tonic
    // TODO: Implement more generic chromatic relative logic
    // For now, C major specific as requested for foundation
    if (tonic === 'C') {
        if (chordContext?.startsWith('V/')) return SECONDARY_DOMINANT_OVERRIDE['C'][pc + 60] || null;
        if (['iv', 'bVI', 'bVII', 'bII', 'ii7b5'].includes(chordContext || '')) return MODAL_INTERCHANGE_OVERRIDE['C'][pc + 60] || null;
    }
    return null;
}
