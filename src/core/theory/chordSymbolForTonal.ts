/**
 * Unified theory: convert iReal-style chord symbols to @tonaljs Chord.get() format.
 * Uses parseChord (single source of truth) so Scale Explorer, Comping, WalkingBass, and playback agree.
 */
import { parseChord } from './parseChord';

/** Our quality (parseChord output) → Tonal chord-type suffix for Chord.get(root + suffix) */
const QUALITY_TO_TONAL_SUFFIX: Record<string, string> = {
  maj: '',
  min: 'm',
  dim: 'dim',
  aug: 'aug',
  maj7: 'maj7',
  min7: 'm7',
  dom7: '7',
  dim7: 'dim7',
  m7b5: 'm7b5',
  aug7: '7#5',
  mM7: 'mM7',
  '6': '6',
  m6: 'm6',
  '9': '9',
  maj9: 'maj9',
  min9: 'm9',
  '7b9': '7b9',
  '7#9': '7#9',
  '7alt': '7alt',
  sus4: 'sus4',
  sus2: 'sus2',
  '7sus4': '7sus4',
  '7b5': '7b5',
  '7#5': '7#5',
  '7#11': '7#11',
  '7b13': '7b13',
  '13': '13',
  maj13: 'maj13',
  min13: 'm13',
  b9sus4: '7sus4b9',
};

/**
 * Convert any chord symbol (iReal-style or standard) to a symbol @tonaljs/chord Chord.get() understands.
 * Uses unified parseChord so interpretation is consistent everywhere.
 */
export function toTonalChordSymbol(symbol: string): string {
  if (!symbol || typeof symbol !== 'string') return symbol;
  const trimmed = symbol.trim();
  if (!trimmed) return trimmed;

  const { root, quality } = parseChord(trimmed);
  const suffix = QUALITY_TO_TONAL_SUFFIX[quality] ?? quality;
  const rootNorm = root.charAt(0).toUpperCase() + (root.length > 1 ? root.slice(1) : '');
  return suffix ? rootNorm + suffix : rootNorm;
}

/** @deprecated Use toTonalChordSymbol. Kept for compatibility. */
export function chordSymbolForTonal(symbol: string): string {
  return toTonalChordSymbol(symbol);
}
