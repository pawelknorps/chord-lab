/**
 * Harmonic DNA Decomposition
 *
 * Instead of looking up a chord in a giant map, we calculate it from its core components:
 * 1. Root — the anchor (Tier 1)
 * 2. Triad Core — 3rd and 5th set the fundamental vibe (Tier 2)
 * 3. Extension/Alteration Layer — 7th and tensions add the "Jazz" character (Tier 3)
 *
 * Note names use the Chord Lab enharmonic system: core chord tones follow spellPitchClassInKey
 * (flat vs sharp by key/root); alterations (#9, b9, #11, b13) use interval spelling (#→sharp, b→flat).
 */

import * as Note from '@tonaljs/note';
import { spellPitchClassInKey } from './enharmonicSpelling';

/** Interval name (Tonal-style) → semitones from root. Used to build the DNA set. */
const INTERVAL_SEMITONES: Record<string, number> = {
  '1P': 0, '2m': 1, '2M': 2, '2A': 3, '3m': 3, '3M': 4, '4P': 5, '4A': 6,
  '5d': 6, '5P': 7, '5A': 8, '6m': 8, '6M': 9, '7m': 10, '7M': 11,
};

/** Interval name → chord-tone label for piano/analyser (unified with Chord Lab detection). */
export const INTERVAL_NAME_TO_CHORD_LABEL: Record<string, string> = {
  '1P': 'R', '2m': 'b9', '2M': '9', '2A': '#9', '3m': 'm3', '3M': 'M3', '4P': '11', '4A': '#11',
  '5d': 'b5', '5P': '5', '5A': '#5', '6m': 'b13', '6M': '13', '7m': 'b7', '7M': 'M7',
};

function intervalNameToSemitones(name: string): number {
  return INTERVAL_SEMITONES[name] ?? 0;
}

/** Semitones → interval name for Note.transpose. */
const SEMITONES_TO_INTERVAL: Record<number, string> = {
  0: '1P', 1: '2m', 2: '2M', 3: '3m', 4: '3M', 5: '4P', 6: '4A', 7: '5P', 8: '5A', 9: '6M', 10: '7m', 11: '7M',
};

/** Alteration intervals: spell from symbol (#→sharp, b→flat), not from key. */
const ALTERATION_INTERVALS = new Set<string>(['2m', '2A', '4A', '6m']);

export interface ChordDnaResult {
  root: string;
  /** Semitones from root (0–11 for pitch class; compound e.g. 14 for 9th allowed). */
  intervals: number[];
  /** Interval names used (for debugging). */
  intervalNames: string[];
  /** Note names (root octave). */
  noteNames: string[];
  /** Core triad: 3rd and 5th type for bass/playback rules. */
  core: { third: 'major' | 'minor' | 'sus4' | 'sus2'; fifth: 'perfect' | 'diminished' | 'augmented' };
  /** Extension layer: has 7th, and count of alterations (e.g. alt = 4). */
  extension: { hasSeventh: boolean; alterationCount: number };
}

function toSemitones(name: string): number {
  return intervalNameToSemitones(name);
}

/**
 * Parse a chord symbol into Root + Triad Core + Extension Layer (Harmonic DNA).
 * Does not look up a template; builds the note set from the symbol string.
 */
export function getChordDna(symbol: string): ChordDnaResult | null {
  if (!symbol || typeof symbol !== 'string') return null;

  const trimmed = symbol.trim();
  const parts = trimmed.split('/') as [string] | [string, string];
  const base = (parts[0] ?? '').replace(/\(.*?\)/g, '').replace(/[\[\]]/g, '');
  const match = base.match(/^([A-Ga-g][b#]?)(.*)$/);
  if (!match) return null;

  const root = match[1].charAt(0).toUpperCase() + (match[1].length > 1 ? match[1].slice(1).toLowerCase() : '');
  const rest = (match[2] ?? '').toLowerCase();

  const intervalNames: string[] = ['1P'];

  // —— Tier 2: Triad Core (3rd and 5th) ——
  let third: ChordDnaResult['core']['third'] = 'major';
  let fifth: ChordDnaResult['core']['fifth'] = 'perfect';

  if (/sus4/.test(rest)) {
    intervalNames.push('4P');
    third = 'sus4';
  } else if (/sus2/.test(rest)) {
    intervalNames.push('2M');
    third = 'sus2';
  } else if (/^o7$|^07$|^dim7$|^o$|^0$/.test(rest)) {
    intervalNames.push('3m');
    third = 'minor';
  } else if (/-|^m(?!aj)|min/.test(rest) || (rest.startsWith('m') && !/maj|major/.test(rest))) {
    intervalNames.push('3m');
    third = 'minor';
  } else {
    intervalNames.push('3M');
  }

  if (/\+|#5|aug/.test(rest)) {
    intervalNames.push('5A');
    fifth = 'augmented';
  } else if (/b5|dim|ø|o7?|07/.test(rest)) {
    intervalNames.push('5d');
    fifth = 'diminished';
  } else {
    intervalNames.push('5P');
  }

  // dim7: bb7 is 6M (9 semitones). iReal: o7, 07 (zero-7), dim7, or standalone o.
  const isDim7 = /o7|07|dim7/.test(rest) || rest === 'o' || rest === '0';

  // —— Tier 3: Extension / Alteration Layer ——
  let hasSeventh = false;
  const alterationNames: string[] = [];
  const slashPart = (parts[1] ?? '').toLowerCase().replace(/\(.*?\)/g, '').trim();
  const isMinMaj7 = (slashPart === 'maj7' || /maj7|m\(M7\)/.test(trimmed)) && third === 'minor';

  if (isDim7) {
    intervalNames.push('6M');
    hasSeventh = true;
  } else if (isMinMaj7) {
    intervalNames.push('7M');
    hasSeventh = true;
  } else if (/\^|maj7|∆|major\s*7/.test(rest) || slashPart === 'maj7') {
    intervalNames.push('7M');
    hasSeventh = true;
  } else if (/7|9|11|13/.test(rest)) {
    intervalNames.push('7m');
    hasSeventh = true;
  }

  if (/b9/.test(rest)) {
    alterationNames.push('2m');
    intervalNames.push('2m');
  }
  // #9 spells as D# (2A), not Eb (3m): e.g. C7#9 = C E G Bb D#
  if (/#9/.test(rest)) {
    alterationNames.push('2A');
    intervalNames.push('2A');
  }
  if (/#11/.test(rest)) {
    alterationNames.push('4A');
    intervalNames.push('4A');
  }
  if (/b13/.test(rest)) {
    alterationNames.push('6m');
    intervalNames.push('6m');
  }
  if (/alt/.test(rest)) {
    ['2m', '2A', '4A', '6m'].forEach(name => {
      if (!intervalNames.includes(name)) {
        alterationNames.push(name);
        intervalNames.push(name);
      }
    });
  }

  const intervals = [...new Set(intervalNames.map(toSemitones))].filter(
    (s, i, arr) => arr.indexOf(s) === i
  ).sort((a, b) => a - b);

  // Note names: Chord Lab enharmonic system. Alterations (#9, b9, #11, b13) use interval spelling;
  // core chord tones use spellPitchClassInKey(root) so flats/sharps match the key.
  const uniqueIntervalNames = [...new Set(intervalNames)];
  const noteNames = intervals.map(s => {
    const pc = s % 12;
    const intervalName = uniqueIntervalNames.find(n => toSemitones(n) === pc) ?? SEMITONES_TO_INTERVAL[pc] ?? '1P';
    if (ALTERATION_INTERVALS.has(intervalName)) {
      const note = Note.transpose(root + '4', intervalName);
      return Note.get(note).name ?? note;
    }
    return spellPitchClassInKey(pc, root);
  });

  return {
    root,
    intervals,
    intervalNames: [...new Set(intervalNames)],
    noteNames,
    core: { third, fifth },
    extension: {
      hasSeventh,
      alterationCount: alterationNames.length,
    },
  };
}

/**
 * Get chord DNA intervals as semitones from root, suitable for voicing engines.
 * Returns null if symbol cannot be parsed; otherwise always returns a non-empty set.
 */
export function getChordDnaIntervals(symbol: string): number[] | null {
  const dna = getChordDna(symbol);
  if (!dna || dna.intervals.length === 0) return null;
  return dna.intervals;
}

/**
 * Build semitone (0–11) → chord-tone label map for a chord symbol.
 * Used by getChordToneLabel so piano/analyser show #9 not m3 for C7#9.
 */
export function getChordToneLabelMap(chordSymbol: string): Record<number, string> | null {
  const dna = getChordDna(chordSymbol);
  if (!dna || dna.intervalNames.length === 0) return null;
  const map: Record<number, string> = {};
  for (const name of dna.intervalNames) {
    const s = intervalNameToSemitones(name) % 12;
    const label = INTERVAL_NAME_TO_CHORD_LABEL[name];
    if (label) map[s] = label;
  }
  return Object.keys(map).length > 0 ? map : null;
}
