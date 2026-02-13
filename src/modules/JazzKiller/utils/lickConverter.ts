import * as Chord from '@tonaljs/chord';
import * as Note from '@tonaljs/note';
import { toTonalChordSymbol } from '../../../core/theory/chordSymbolForTonal';

/**
 * Map degree/shorthand to Tonal interval (from root).
 * Supports R, 1, 2, b3, 3, 4, #4, b5, 5, #5, 6, b7, 7, 9, 11, 13 etc.
 */
const DEGREE_TO_INTERVAL: Record<string, string> = {
  R: '1P',
  '1': '1P',
  '2': '2M',
  b2: '2m',
  '3': '3M',
  b3: '3m',
  '4': '4P',
  '#4': '4A',
  b5: '5d',
  '5': '5P',
  '#5': '5A',
  b6: '6m',
  '6': '6M',
  b7: '7m',
  '7': '7M',
  '8': '8P',
  '9': '9M',
  b9: '9m',
  '#9': '9A',
  '11': '11P',
  '#11': '11A',
  '13': '13M',
  b13: '13m',
};

export interface LickResult {
  chord: string;
  notes: string[];
  display: string;
}

/**
 * Convert a lick template (e.g. "1 2 b3 5" or "R b3 5 b7") into actual notes for a chord symbol.
 * Uses unified theory (toTonalChordSymbol) so iReal-style symbols work; Tonal.js for intervals.
 */
export function convertLick(lickTemplate: string, chordSymbol: string): LickResult {
  const chord = Chord.get(toTonalChordSymbol(chordSymbol));
  const root = chord.tonic;
  if (!root) {
    return { chord: chordSymbol, notes: [], display: '' };
  }

  const tokens = lickTemplate.trim().split(/\s+/).filter(Boolean);
  const octave = 4;
  const rootNote = root + octave;

  const notes: string[] = [];
  for (const token of tokens) {
    const normalized = token.replace(',', '').trim();
    const interval = DEGREE_TO_INTERVAL[normalized] ?? normalized;
    try {
      const note = Note.transpose(rootNote, interval);
      if (note) notes.push(note);
    } catch {
      // ignore invalid intervals
    }
  }

  const display = notes.map(n => Note.pitchClass(n) ?? n).join(' - ');
  return {
    chord: chordSymbol,
    notes,
    display: display || lickTemplate,
  };
}

/**
 * Apply a lick template to every unique chord in a song (chord list).
 * Returns one result per unique chord.
 */
export function applyLickToChords(
  lickTemplate: string,
  chords: string[]
): LickResult[] {
  const unique = Array.from(new Set(chords.filter(c => c && c.trim() !== '')));
  return unique.map(chord => convertLick(lickTemplate, chord));
}
