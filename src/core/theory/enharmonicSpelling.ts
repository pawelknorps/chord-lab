/**
 * Chord Lab enharmonic spelling: flats vs sharps by key context.
 * Used by ChordDna, midiToNoteName, and spellPitchClassInKey so all note names
 * follow the same system (flat keys vs sharp keys, functional overrides).
 */

import { getFunctionalPitchClassOverride } from './functionalRules';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];
const SHARP_HEAVY_KEYS = ['B', 'F#', 'C#', 'G#', 'D#', 'A#', 'E', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Em'];

/**
 * Spell a pitch class (0–11) using the Chord Lab enharmonic rules for the given key.
 * Sharp keys use # (e.g. D# in E), flat keys use b (e.g. Bb in F).
 */
export function spellPitchClassInKey(pc: number, keyContext: string): string {
  const tonic = (keyContext ?? 'C').replace(/[0-9-]/g, '') || 'C';

  const functionalOverride = getFunctionalPitchClassOverride(pc, tonic);
  if (functionalOverride) return functionalOverride;

  const isSharpKey = SHARP_HEAVY_KEYS.includes(tonic);
  let prefersFlats = !isSharpKey && (FLAT_KEYS.includes(tonic) || tonic.includes('b'));

  if (isSharpKey) {
    prefersFlats = false;
  } else {
    if (pc === 10) prefersFlats = true;
    if (pc === 3 && !['E', 'B'].includes(tonic)) prefersFlats = true;
    if (pc === 8 && !['A', 'E', 'B'].includes(tonic)) prefersFlats = true;
    if (pc === 1 && !['D', 'A', 'E', 'B', 'F#', 'C#'].includes(tonic)) prefersFlats = true;
  }

  return prefersFlats ? NOTE_NAMES_FLAT[pc] : NOTE_NAMES[pc];
}
