import { spellPitchClassInKey as spellPitchClassInKeyFromEnharmonic, NOTE_NAMES as ENHARMONIC_NOTE_NAMES, NOTE_NAMES_FLAT as ENHARMONIC_NOTE_NAMES_FLAT } from './enharmonicSpelling';
export * from './analysis';
import { getChordDna, getChordDnaIntervals, getChordToneLabelMap, type ChordDnaResult } from './ChordDna';
import { CompingEngine, type Voicing } from './CompingEngine';
import { RhythmEngine, type RhythmPattern, type RhythmPatternOptions, type RhythmTemplateName, type AnswerContext, type TempoSubdivisionLimit, type PatternType } from './RhythmEngine';
import { JazzMarkovEngine } from './JazzMarkovEngine';
import { QuestionAnswerCoordinator, type LastBarSummary, type AnswerDecision } from './QuestionAnswerCoordinator';
import { DrumEngine, type DrumHit, type DrumInstrument } from './DrumEngine';
import { GrooveManager, type GrooveInstrument } from './GrooveManager';
import { WalkingBassEngine } from './WalkingBassEngine';
import { BassRhythmVariator, type BassEvent } from './BassRhythmVariator';
import { ReactiveCompingEngine, type CompingHit, type BassMode, type StepLike } from './ReactiveCompingEngine';
import { CHORD_INTERVALS } from './chordIntervals';
import { parseChord } from './parseChord';
import { toTonalChordSymbol } from './chordSymbolForTonal';

export { getChordDna, getChordDnaIntervals, getChordToneLabelMap, type ChordDnaResult, CompingEngine, type Voicing, RhythmEngine, type RhythmPattern, type RhythmPatternOptions, type RhythmTemplateName, type AnswerContext, type TempoSubdivisionLimit, type PatternType, JazzMarkovEngine, DrumEngine, type DrumHit, type DrumInstrument, GrooveManager, type GrooveInstrument, WalkingBassEngine, BassRhythmVariator, type BassEvent, ReactiveCompingEngine, type CompingHit, type BassMode, type StepLike, QuestionAnswerCoordinator, type LastBarSummary, type AnswerDecision };
export { CHORD_INTERVALS, parseChord, toTonalChordSymbol };
export { getLiveOverrides, classifyChordTone, type LiveOverrides, type PitchBufferEntry } from './liveHarmonicGrounding';

export const NOTE_NAMES = ENHARMONIC_NOTE_NAMES;
export const NOTE_NAMES_FLAT = ENHARMONIC_NOTE_NAMES_FLAT;

// Comprehensive list of keys for UI
export const ALL_KEYS = [
  'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'Cb'
] as const;

export type NoteName = typeof NOTE_NAMES[number];

// Scale intervals (semitones from root)
export const SCALES: Record<string, { intervals: number[]; chordQualities: string[] }> = {
  'Major': {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    chordQualities: ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']
  },
  'Natural Minor': {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    chordQualities: ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj']
  },
  'Harmonic Minor': {
    intervals: [0, 2, 3, 5, 7, 8, 11],
    chordQualities: ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim']
  },
  'Dorian': {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    chordQualities: ['min', 'min', 'maj', 'maj', 'min', 'dim', 'maj']
  },
  'Mixolydian': {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    chordQualities: ['maj', 'min', 'dim', 'maj', 'min', 'min', 'maj']
  },
  'Phrygian': {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    chordQualities: ['min', 'maj', 'maj', 'min', 'dim', 'maj', 'min']
  },
  'Lydian': {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    chordQualities: ['maj', 'maj', 'min', 'dim', 'maj', 'min', 'min']
  },
};

// Roman numeral notation
export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
export const ROMAN_NUMERALS_MINOR = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

// Helper for enharmonic spelling
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BASE_MIDI: Record<string, number> = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };

/**
 * Returns correctly spelled notes for a scale to ensure unique letter names.
 */
export function getSpelledScale(rootName: string, intervals: number[]): string[] {
  const rootLetter = rootName[0];
  let letterIndex = LETTERS.indexOf(rootLetter);
  const rootMidi = noteNameToMidi(rootName + '0') % 12;

  return intervals.map((interval) => {
    const targetMidiNormalized = (rootMidi + interval) % 12;
    const targetLetter = LETTERS[letterIndex];
    letterIndex = (letterIndex + 1) % 7;

    const baseMidi = BASE_MIDI[targetLetter];
    let diff = targetMidiNormalized - baseMidi;

    // Handle wrap around
    while (diff > 6) diff -= 12;
    while (diff < -6) diff += 12;

    let accidental = '';
    if (diff === 1) accidental = '#';
    else if (diff === 2) accidental = '##';
    else if (diff === -1) accidental = 'b';
    else if (diff === -2) accidental = 'bb';

    return `${targetLetter}${accidental}`;
  });
}

// Get note name from MIDI number - now functional and context aware
export function midiToNoteName(midi: number, context?: string | boolean): string {
  if (isNaN(midi) || !isFinite(midi)) return 'C4';
  const pc = midi % 12;
  const octave = Math.floor(midi / 12) - 1;

  // Handle boolean context (backward compatibility)
  if (typeof context === 'boolean') {
    return (context ? NOTE_NAMES_FLAT[pc] : NOTE_NAMES[pc]) + octave;
  }

  // Handle string context (Chord Lab enharmonic system)
  const tonic = typeof context === 'string' ? context.replace(/[0-9-]/g, '') : 'C';
  const noteName = spellPitchClassInKeyFromEnharmonic(pc, tonic);
  return `${noteName}${octave}`;
}

// Get MIDI number from note name
export function noteNameToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G][#b]*)(-?\d+)$/);
  if (!match) return 60;

  const notePart = match[1];
  const octave = parseInt(match[2]);

  let midi = BASE_MIDI[notePart[0]];
  for (let i = 1; i < notePart.length; i++) {
    const char = notePart[i];
    if (char === '#') midi += 1;
    if (char === 'b') midi -= 1;
  }

  return (octave + 1) * 12 + (midi % 12 + 12) % 12;
}

// Get all chords in a scale
export function getScaleChords(root: string, scaleName: string, octave = 4): ChordInfo[] {
  const scale = SCALES[scaleName];
  if (!scale) return [];

  // 1. Get correctly spelled scale notes
  const spelledNotes = getSpelledScale(root, scale.intervals);

  return scale.intervals.map((_, degree) => {
    const quality = scale.chordQualities[degree];
    const isMinor = quality === 'min' || quality === 'dim';

    const roman = isMinor
      ? ROMAN_NUMERALS_MINOR[degree]
      : ROMAN_NUMERALS[degree];

    const displayRoman = quality === 'dim'
      ? `${roman}°`
      : quality === 'aug'
        ? `${ROMAN_NUMERALS[degree]}+`
        : roman;

    const chordIntervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'];
    const chordRootName = spelledNotes[degree];
    const baseMidi = (octave + 1) * 12 + (noteNameToMidi(chordRootName + '0') % 12);

    const midiNotes = chordIntervals.map(i => baseMidi + i);

    // For chord member names, use the scale context for spelling if possible,
    // but for now simple context-aware midiToNoteName is good.
    const notes = midiNotes.map(m => midiToNoteName(m, root));

    return {
      root: chordRootName,
      quality,
      roman: displayRoman,
      degree,
      notes,
      midiNotes,
    };
  });
}

// Voicings - different ways to play chords
export const VOICINGS: Record<string, (notes: number[]) => number[]> = {
  'Root Position': (notes) => notes,
  '1st Inversion': (notes) => {
    if (notes.length < 2) return notes;
    return [...notes.slice(1), notes[0] + 12];
  },
  '2nd Inversion': (notes) => {
    if (notes.length < 3) return notes;
    return [...notes.slice(2), notes[0] + 12, notes[1] + 12];
  },
  'Open Voicing': (notes) => {
    if (notes.length < 3) return notes;
    return [notes[0], notes[1] + 12, notes[2]];
  },
  'Drop 2': (notes) => {
    if (notes.length < 4) return notes;
    return [notes[0], notes[2], notes[3], notes[1] + 12];
  },
  'Shell Voicing': (notes) => {
    // Return 3rd and 7th (or 3rd and 5th for triads)
    if (notes.length >= 4) return [notes[1], notes[3]]; // 3 + 7
    if (notes.length >= 3) return [notes[1], notes[2]]; // 3 + 5
    return notes;
  },
  'Jazz Rootless': (notes) => {
    // Basic rootless 9th voicing (3, 5, 7, 9)
    // If triad, return 3, 5 and add 9
    if (notes.length >= 5) return [notes[1], notes[2], notes[3], notes[4]];
    if (notes.length >= 4) return [notes[1], notes[2], notes[3], notes[0] + 14];
    if (notes.length >= 3) return [notes[1], notes[2], notes[0] + 14];
    return notes;
  },
};

export interface ChordInfo {
  root: string;
  quality: string;
  roman: string;
  degree: number;
  notes: string[];
  midiNotes: number[];
  /** Bass note for inversions/slash chords (e.g. "E" for C/E) */
  bass?: string;
}

export interface Progression {
  name: string;
  genre?: string;
  degrees?: number[];
  description?: string;
  chords?: string[]; // Optional explicit chord list for non-diatonic progressions
  compStyle?: string; // Optional stylistic guide for the rhythm section
}

// Common chord progressions
export const PRESETS: Progression[] = [
  // --- POP / STANDARD ---
  { name: 'Pop Classic', genre: 'Pop', degrees: [0, 4, 5, 3], description: 'I - V - vi - IV' },
  { name: 'Axis of Awesome', genre: 'Pop', degrees: [0, 5, 3, 4], description: 'I - vi - IV - V' },
  { name: '50s Progression', genre: 'Pop', degrees: [0, 5, 3, 4], description: 'I - vi - IV - V' },
  { name: 'Pachelbel\'s Canon', genre: 'Classical', degrees: [0, 4, 5, 2, 3, 0, 3, 4], description: 'I - V - vi - iii - IV - I - IV - V' },

  // --- JAZZ & R&B ---
  { name: 'Jazz ii-V-I', genre: 'Jazz', degrees: [1, 4, 0], description: 'ii - V - I' },
  { name: 'Jazz Turnaround', genre: 'Jazz', degrees: [0, 5, 1, 4], description: 'I - vi - ii - V' },
  { name: 'Bill Evans 2-5-1', genre: 'Jazz', degrees: [], description: 'Rootless voicings in C major', chords: ['Dm9', 'G13b9', 'Cmaj9', 'A7alt'] },
  { name: 'Minor 2-5-1', genre: 'Jazz', degrees: [], description: 'In C Minor', chords: ['Dm7b5', 'G7alt', 'Cm(maj7)'] },
  { name: 'Coltrane Changes', genre: 'Jazz', degrees: [], description: 'Cycles of major thirds', chords: ['Cmaj7', 'Eb7', 'Abmaj7', 'B7', 'Emaj7', 'G7', 'Cmaj7'] },

  // --- MODERN / NEO-SOUL ---
  { name: 'Neo Soul Swag', genre: 'R&B', degrees: [], description: 'Smooth movement', chords: ['Fmaj9', 'Em9', 'Dm9', 'Cmaj9'] },
  { name: 'Gospel Passing', genre: 'Gospel', degrees: [], description: 'Diminished passing chords', chords: ['Cmaj7', 'C#dim7', 'Dm9', 'D#dim7', 'Em7', 'A7alt', 'Dm7', 'G13'] },
  { name: 'Lo-fi Chill', genre: 'Lo-fi', degrees: [1, 4, 0, 5], description: 'ii - V - I - vi' },
  { name: 'Royal Road', genre: 'J-Pop', degrees: [3, 4, 2, 0], description: 'IV - V - iii - I' },
  { name: 'Creep Progression', genre: 'Rock', degrees: [0, 2, 3, 3], description: 'I - III - IV - iv' },
  { name: 'Andalusian Cadence', genre: 'Flamenco', degrees: [5, 4, 3, 0], description: 'vi - V - IV - I' },
];

// Apply voicing to chord
export function applyVoicing(midiNotes: number[], voicingName: string): number[] {
  const voicingFn = VOICINGS[voicingName];
  if (!voicingFn) return midiNotes;
  return voicingFn([...midiNotes]);
}

// Get chord extension (7th, etc.)
export function getExtendedChord(baseQuality: string, extension: string): string {
  if (extension === 'triad') return baseQuality;

  // Map basic qualities to their 7th versions
  if (extension === '7th') {
    if (baseQuality === 'maj') return 'maj7';
    if (baseQuality === 'min') return 'min7';
    if (baseQuality === 'dim') return 'm7b5'; // Natural minor 7th on dim triad is half-dim usually
    if (baseQuality === 'aug') return 'aug7'; // Not standard but implies dom7#5
  }

  // Map to 9th
  if (extension === '9th') {
    if (baseQuality === 'maj') return 'maj9';
    if (baseQuality === 'min') return 'min9';
    if (baseQuality === 'dom7') return '9';
  }

  // Map to 11th
  if (extension === '11th') {
    if (baseQuality === 'min') return 'min11';
    if (baseQuality === 'maj') return 'maj9#11'; // Lydian
    if (baseQuality === 'dom7') return '9#11';
  }

  return baseQuality;
}

// Get notes for any chord with extension and voicing
export function getChordNotes(
  root: string,
  quality: string,
  octave = 4,
  voicing = 'Root Position'
): number[] {
  const rootMidi = noteNameToMidi(root + '0') % 12;
  const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'];
  const baseMidi = (octave + 1) * 12 + rootMidi;

  const midiNotes = intervals.map(i => baseMidi + i);
  return applyVoicing(midiNotes, voicing);
}

/**
 * Chord recognition from symbol (e.g. iReal-style): parse symbol, build pitch-class set
 * including explicit extensions from the symbol, then use detectJazzChordByProfile to
 * produce a canonical quality (correct shell + extensions) for voicings.
 * Use this for JazzKiller and any consumer that needs correct shell and extensions from
 * symbols like "C^7(9)", "G7alt", "D-7(11)".
 */
export function recognizeChordFromSymbol(symbol: string): { root: string; quality: string; bass?: string } {
  if (!symbol || typeof symbol !== 'string') return { root: 'C', quality: 'maj' };

  const trimmed = symbol.trim();
  const parts = trimmed.split('/') as [string] | [string, string];
  const base = parts[0] ?? '';
  const bass = parts[1];

  const match = base.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return { root: 'C', quality: 'maj', bass };

  const root = match[1];
  const raw = match[2] ?? '';
  const normalizedForParse = root + raw.replace(/\(.*?\)/g, '').replace(/[\[\]]/g, '');
  const parsed = parseChord(normalizedForParse);
  const quality = parsed.quality;
  const baseIntervals = CHORD_INTERVALS[quality] ?? CHORD_INTERVALS['maj'];
  const basePcs = [...new Set(baseIntervals.map((i) => i % 12))].sort((a, b) => a - b);

  const extensionSemitones: number[] = [];
  if (/\(9\)/.test(raw)) extensionSemitones.push(2);
  if (/\(11\)/.test(raw) && !/\(#11\)/.test(raw)) extensionSemitones.push(5);
  if (/\(13\)/.test(raw) && !/\(b13\)/.test(raw)) extensionSemitones.push(9);
  if (/\(#11\)|7#11/.test(raw)) extensionSemitones.push(6);
  if (/\(b9\)|7b9/.test(raw)) extensionSemitones.push(1);
  if (/\(#9\)|7#9/.test(raw)) extensionSemitones.push(3);
  if (/\(b13\)|7b13/.test(raw)) extensionSemitones.push(8);
  if (/alt|7alt/.test(raw)) extensionSemitones.push(1, 3, 6, 8);

  const allPcs = [...new Set([...basePcs, ...extensionSemitones])].sort((a, b) => a - b);
  const canonical = allPcs.length >= 3 ? detectJazzChordByProfile(allPcs) : null;
  const finalQuality = canonical ?? quality;

  return { root, quality: finalQuality, bass };
}

/** Chord pc-set templates: quality -> sorted unique pitch classes (0–11) from root */
const CHORD_PC_TEMPLATES: { quality: string; pcs: number[] }[] = (() => {
  const out: { quality: string; pcs: number[] }[] = [];
  for (const [quality, intervals] of Object.entries(CHORD_INTERVALS)) {
    const pcs = [...new Set(intervals.map((i) => i % 12))].sort((a, b) => a - b);
    out.push({ quality, pcs });
  }
  return out;
})();

/** 12-bit bitmask: bit i = 1 if semitone i (from root) is present. Fast pitch-set comparison. */
export function pcsToBitmask(pcs: number[]): number {
  return pcs.reduce((mask, i) => mask | (1 << (i % 12)), 0);
}

/**
 * Functional decomposition: build chord quality from triad + 7th + extensions.
 * Uses interval profile (pitch classes from root). Never returns "custom"; produces
 * a theoretically correct symbol (e.g. maj7#5, min7, 7#11).
 */
export function detectJazzChordByProfile(intervalsFromRoot: number[]): string | null {
  if (intervalsFromRoot.length < 3) return null;
  const set = new Set(intervalsFromRoot);
  if (!set.has(0)) return null;

  const has = (i: number) => set.has(i);
  // Triad: 3rd and 5th
  const hasM3 = has(4);
  const hasm3 = has(3);
  const hasP5 = has(7);
  const hasAug5 = has(8);
  const hasDim5 = has(6);
  const hasSus4 = has(5) && !hasM3 && !hasm3;
  const hasSus2 = has(2) && !hasM3 && !hasm3;

  let quality: string;

  if (hasSus4 && hasP5 && has(10)) quality = '7sus4';
  else if (hasSus4 && hasP5) quality = 'sus4';
  else if (hasSus2 && hasP5) quality = 'sus2';
  else if (hasSus4) quality = 'sus4';
  else if (hasM3 && hasAug5) quality = 'aug';
  else if (hasM3 && hasP5) quality = 'maj';
  else if (hasm3 && hasP5) quality = 'min';
  else if (hasm3 && hasDim5) quality = 'dim';
  else if (hasM3 && hasDim5) quality = 'maj7b5';
  else if (hasm3 && hasAug5) quality = 'min7#5';
  else if (hasM3) quality = 'aug';
  else if (hasm3) quality = 'dim';
  else return null;

  // 7ths
  const hasMaj7 = has(11);
  const hasDom7 = has(10);
  const hasDim7 = has(9); // diminished 7th = 9 semitones from root
  if (hasMaj7) {
    if (quality === 'aug') quality = 'maj7#5';
    else if (quality === 'maj') quality = 'maj7';
    else if (quality === 'min') quality = 'mM7';
    else if (quality === 'dim') quality = 'dim7';
    else quality = quality + 'maj7';
  } else if (hasDim7 && quality === 'dim') {
    quality = 'dim7';
  } else if (hasDom7) {
    if (quality === 'aug') quality = '7#5';
    else if (quality === 'maj') quality = 'dom7';
    else if (quality === 'min') quality = 'min7';
    else if (quality === 'min7#5') quality = 'min7#5';
    else if (quality === 'dim') quality = 'm7b5';
    else quality = quality + '7';
  } else if (quality === 'min7#5') quality = 'min';

  // Extensions: map 7th chord + extension to standard symbol (no "maj79")
  const has7 = quality.includes('7');
  if (has7) {
    if (has(9) && (quality === 'dom7' || quality === 'min7' || quality === 'maj7')) {
      quality = quality === 'maj7' ? 'maj13' : quality === 'min7' ? 'min13' : '13';
    } else if (has(6) && quality === 'maj7') quality = 'maj7#11'; // #11 = semitone 6 from root
    else if (has(2) && (quality === 'dom7' || quality === 'min7' || quality === 'maj7')) {
      quality = quality === 'maj7' ? 'maj9' : quality === 'min7' ? 'min9' : '9';
    } else if (has(1) && quality === 'dom7') quality = '7b9';
    else if (has(3) && hasM3 && quality === 'dom7') quality = '7#9';
  } else if (quality === 'maj' && has(2)) quality = 'add9';
  else if (quality === 'min' && has(2)) quality = 'minadd9';

  return quality;
}

/**
 * Spell a pitch class (0–11) using the Chord Lab enharmonic rules for the given key.
 * Single source of truth: enharmonicSpelling.ts.
 */
export function spellPitchClassInKey(pc: number, keyContext: string): string {
  return spellPitchClassInKeyFromEnharmonic(pc, keyContext);
}

/**
 * Analyze a set of MIDI notes into chord root, quality, and optional bass (inversion).
 * 1. Tries CHORD_PC_TEMPLATES (fast, exact match).
 * 2. If null, uses functional decomposition (detectJazzChordByProfile) so any triad + 7th + extensions gets a proper name.
 * Does not assume the lowest note is the root; detects inversions and slash chords.
 */
export function analyzeChordFromNotes(notes: number[], keyContext?: string): { root: string; quality: string; bass?: string } | null {
  if (notes.length < 3) return null;

  const bassMidi = [...notes].sort((a, b) => a - b)[0];
  const bassPc = bassMidi % 12;
  const pitchClasses = [...new Set(notes.map((n) => n % 12))].sort((a, b) => a - b);

  const pcToName = keyContext
    ? (pc: number) => spellPitchClassInKey(pc, keyContext)
    : (pc: number) => NOTE_NAMES[pc];

  let best: { rootPc: number; quality: string } | null = null;

  // 1. Template match (speed)
  for (const candidateRoot of pitchClasses) {
    const intervalsFromRoot = pitchClasses.map((pc) => (pc - candidateRoot + 12) % 12).sort((a, b) => a - b);

    for (const { quality, pcs } of CHORD_PC_TEMPLATES) {
      if (pcs.length !== intervalsFromRoot.length) continue;
      if (!pcs.every((p, i) => p === intervalsFromRoot[i])) continue;

      if (!best || candidateRoot === bassPc) {
        best = { rootPc: candidateRoot, quality };
        if (candidateRoot === bassPc) break;
      }
    }
    if (best?.rootPc === bassPc) break;
  }

  // 2. Fallback: functional decomposition (no "custom")
  if (!best) {
    for (const candidateRoot of pitchClasses) {
      const intervalsFromRoot = pitchClasses.map((pc) => (pc - candidateRoot + 12) % 12).sort((a, b) => a - b);
      const quality = detectJazzChordByProfile(intervalsFromRoot);
      if (!quality) continue;
      if (!best || candidateRoot === bassPc) {
        best = { rootPc: candidateRoot, quality };
        if (candidateRoot === bassPc) break;
      }
    }
  }

  if (!best) return null;

  const rootName = pcToName(best.rootPc);
  const bassName = bassPc !== best.rootPc ? pcToName(bassPc) : undefined;
  return { root: rootName, quality: best.quality, bass: bassName };
}

// Transpose a chord symbol by a specified number of semitones
export function transposeChordSymbol(chordSymbol: string, semitones: number, keyContext?: string): string {
  if (semitones === 0 || !chordSymbol || chordSymbol === "") return chordSymbol;

  // Handle slash chords
  const parts = chordSymbol.split('/') as [string] | [string, string];
  const base = parts[0];
  const bass = parts[1];

  // Regex to separate root from quality
  const match = base.match(/^([A-G][#b]*)(.*)$/);
  if (!match) return chordSymbol;

  const root = match[1];
  const quality = match[2];

  // Shift root
  const rootMidi = noteNameToMidi(root + '4');
  const shiftedRootMidi = rootMidi + semitones;
  const newRoot = midiToNoteName(shiftedRootMidi, keyContext).replace(/[0-9-]/g, '');

  let transposedSymbol = newRoot + quality;

  // Shift bass if present
  if (bass) {
    const bassMatch = bass.match(/^([A-G][#b]*)(.*)$/);
    if (bassMatch) {
      const bassRoot = bassMatch[1];
      const bassQuality = bassMatch[2];
      const bassMidi = noteNameToMidi(bassRoot + '4');
      const shiftedBassMidi = bassMidi + semitones;
      const newBassRoot = midiToNoteName(shiftedBassMidi, keyContext).replace(/[0-9-]/g, '');
      transposedSymbol += '/' + newBassRoot + bassQuality;
    } else {
      transposedSymbol += '/' + bass;
    }
  }
  return transposedSymbol;
}

// Helper for interval names
export function getIntervalName(root: number, note: number): string {
  const semitones = (note - root) % 12;
  const names = ['R', 'm2', 'M2', 'm3', 'M3', 'P4', 'T', 'P5', 'm6', 'M6', 'm7', 'M7'];
  return names[(semitones + 12) % 12];
}

// Helper for scale degrees
export function getScaleDegree(root: number, note: number): string {
  const semitones = (note - root) % 12;
  const degrees = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
  return degrees[(semitones + 12) % 12];
}

/** Chord-tone labels (R, M3, 11, b7, etc.) — default when no chord symbol. */
export const CHORD_TONE_LABELS = ['R', 'b9', '9', 'm3', 'M3', '11', 'b5', '5', '#5', '13', 'b7', 'M7'] as const;

/**
 * Chord-tone label for a note given chord root (and optional chord symbol).
 * When chordSymbol is provided, uses ChordDna so C7#9 shows #9 not m3 for D#.
 * Unifies player, piano visualiser, and voicings analyser with Chord Lab detection.
 */
export function getChordToneLabel(chordRootMidi: number, noteMidi: number, chordSymbol?: string): string {
  const semitones = (noteMidi - chordRootMidi + 12) % 12;
  if (chordSymbol) {
    const map = getChordToneLabelMap(chordSymbol);
    if (map && map[semitones] !== undefined) return map[semitones];
  }
  return CHORD_TONE_LABELS[semitones];
}
