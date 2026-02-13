/**
 * Jazz Functional Music Theory Rules
 * Used for correct enharmonic spelling of non-diatonic notes.
 */

// Sharp keys: 7th scale degree (leading tone) should be spelled with # (e.g. E# in F#, not F)
const TONIC_PC: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11, Cb: 11,
};
const SHARP_KEY_LEADING_TONE: Record<string, string> = {
  'F#': 'E#', 'C#': 'B#', 'G#': 'F#', 'D#': 'C#', 'A#': 'G#', E: 'D#', B: 'A#',
  'F#m': 'E#', 'C#m': 'B#', 'G#m': 'F#', 'D#m': 'C#', 'A#m': 'G#', Em: 'D#', Bm: 'A#',
};

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
    // Sharp keys: spell 7th scale degree (leading tone) with #, e.g. E# in F# not F
    const leadingToneSpelling = SHARP_KEY_LEADING_TONE[tonic];
    if (leadingToneSpelling) {
        const tonicPc = TONIC_PC[tonic.replace(/m$/, '')] ?? TONIC_PC[tonic];
        if (tonicPc !== undefined && pc === (tonicPc + 11) % 12) return leadingToneSpelling;
    }
    // C major specific as requested for foundation
    if (tonic === 'C') {
        if (chordContext?.startsWith('V/')) return SECONDARY_DOMINANT_OVERRIDE['C'][pc + 60] || null;
        if (['iv', 'bVI', 'bVII', 'bII', 'ii7b5'].includes(chordContext || '')) return MODAL_INTERCHANGE_OVERRIDE['C'][pc + 60] || null;
    }
    return null;
}
