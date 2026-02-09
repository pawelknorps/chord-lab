// All note names (Sharps)
import { getFunctionalPitchClassOverride } from './functionalRules';
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
// All note names (Flats)
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

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

// Chord intervals from root
export const CHORD_INTERVALS: Record<string, number[]> = {
  // Triads
  'maj': [0, 4, 7],
  'min': [0, 3, 7],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],

  // 7th Chords
  'maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  'dom7': [0, 4, 7, 10],
  'dim7': [0, 3, 6, 9],
  'm7b5': [0, 3, 6, 10], // Half-diminished
  'aug7': [0, 4, 8, 10], // 7#5
  'mM7': [0, 3, 7, 11], // Minor-Major 7
  '6': [0, 4, 7, 9],
  'm6': [0, 3, 7, 9],

  // Extended / Altered Dom
  '9': [0, 4, 7, 10, 14],
  'maj9': [0, 4, 7, 11, 14],
  'min9': [0, 3, 7, 10, 14],
  '11': [0, 4, 7, 10, 14, 17],
  'min11': [0, 3, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 21],
  'maj13': [0, 4, 7, 11, 14, 21],
  'min13': [0, 3, 7, 10, 14, 21],

  // Alterations
  '7b9': [0, 4, 7, 10, 13],
  '7#9': [0, 4, 7, 10, 15],
  '7b5': [0, 4, 6, 10],
  '7#5': [0, 4, 8, 10], // Alias for aug7
  '7alt': [0, 4, 10, 13, 20], // Simplified Alt (b9, b13)

  // Sus variations
  '7sus4': [0, 5, 7, 10],
  '9sus4': [0, 5, 7, 10, 14],
  'b9sus4': [0, 5, 7, 10, 13], // Phrygian chord
};

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

  // Handle string context (Functional Jazz Rules)
  let tonic = typeof context === 'string' ? context.replace(/[0-9-]/g, '') : 'C';

  // 1. Check for functional overrides (Jazz Rules)
  const functionalOverride = getFunctionalPitchClassOverride(pc, tonic);
  if (functionalOverride) return `${functionalOverride}${octave}`;

  // Determine flat preference based on tonic
  const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];
  let prefersFlats = FLAT_KEYS.includes(tonic) || tonic.includes('b');

  // Enharmonic Preference Logic for Neutral/Ambiguous Contexts
  // If we are in 'C' (neutral) or unknown context, we prefer commonly used jazz/pop keys.
  // Jazz heavily leans towards flats.

  // Specific Pitch Class Overrides
  const SHARP_HEAVY_KEYS = ['B', 'F#', 'C#', 'G#', 'D#', 'A#', 'E']; // Keys that MUST use sharps

  const isSharpKey = SHARP_HEAVY_KEYS.includes(tonic);

  if (!isSharpKey) {
    // Bb (10) vs A#
    // A# is only diatonic in B Major and F# Major.
    if (pc === 10) prefersFlats = true;

    // Eb (3) vs D#
    // D# is only diatonic in E Major and B Major.
    if (pc === 3 && !['E', 'B'].includes(tonic)) prefersFlats = true;

    // Ab (8) vs G#
    // G# is only diatonic in A Major and E Major.
    if (pc === 8 && !['A', 'E', 'B'].includes(tonic)) prefersFlats = true;

    // Db (1) vs C#
    // User requested explicitly: Flats circle is F -> Gb. This includes Db.
    // C# is only diatonic in D Major, A Major, E Major, B Major, F# Major.
    // So unless we are explicitly in D/A/E/B/F#, it should be Db.
    if (pc === 1 && !['D', 'A', 'E', 'B', 'F#', 'C#'].includes(tonic)) prefersFlats = true;
  }

  const noteName = prefersFlats ? NOTE_NAMES_FLAT[pc] : NOTE_NAMES[pc];
  return `${noteName}${octave}`;
}

// Get MIDI number from note name
export function noteNameToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G][#b]*)(-?\d+)$/);
  if (!match) return 60;

  const notePart = match[1];
  const octave = parseInt(match[2]);

  const letter = notePart[0];
  const accidentals = notePart.slice(1);

  let midi = BASE_MIDI[letter];
  for (const char of accidentals) {
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
}

export interface Progression {
  name: string;
  genre?: string;
  degrees?: number[];
  description?: string;
  chords?: string[]; // Optional explicit chord list for non-diatonic progressions
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

// Parse a complex chord string into components
export function parseChord(chordName: string): { root: string; quality: string; bass?: string } {
  if (!chordName) return { root: 'C', quality: 'maj' };

  // Handle slash chords (e.g., C/G)
  const parts = chordName.split('/') as [string] | [string, string];
  const base = parts[0];
  const bass = parts[1];

  // Robust Regex for Root + Quality
  // Matches: Root (A-G, optional #/b), Quality (everything else)
  const match = base.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return { root: 'C', quality: 'maj', bass };

  const root = match[1];
  let quality = match[2];

  // Strip parentheses/brackets
  quality = quality.replace(/[()\[\]]/g, '');

  // Normalize Logic
  if (!quality) quality = 'maj';

  // 1. Handle Diminished / Half-Diminished symbols first
  if (quality === '°' || quality === 'dim') quality = 'dim';
  else if (quality === '°7' || quality === 'dim7') quality = 'dim7';
  else if (quality === 'ø' || quality === 'ø7' || quality === 'm7b5' || quality === '-7b5') quality = 'm7b5';

  // 2. Handle Augmented
  else if (quality === '+' || quality === 'aug') quality = 'aug';
  else if (quality === '+7' || quality === 'aug7' || quality === '7#5') quality = 'aug7';

  // 3. Handle Minor
  else if ((quality.startsWith('m') && !quality.startsWith('maj')) || quality.startsWith('-')) {
    // Remove the 'm' or '-' indicator
    const rest = quality.substring(quality.startsWith('min') ? 3 : 1);

    if (!rest) quality = 'min';
    else if (rest === '7') quality = 'min7';
    else if (rest === '9') quality = 'min9';
    else if (rest === '11') quality = 'min11';
    else if (rest === '6') quality = 'm6';
    else if (rest === 'maj7' || rest === 'M7' || rest === 'Δ7') quality = 'mM7';
    else quality = 'min' + rest; // Fallback e.g. min13
  }

  // 4. Handle Major
  else if (quality.startsWith('M') || quality.startsWith('maj') || quality.startsWith('Δ')) {
    const rest = quality.replace(/^(M|maj|Δ)/, '');
    if (!rest) quality = 'maj';
    else if (rest === '7') quality = 'maj7';
    else if (rest === '9') quality = 'maj9';
    else if (rest === '13') quality = 'maj13';
    else quality = 'maj' + rest;
  }

  // 5. Handle Dominant / Numbers (Universal 7 is Dominant)
  if (quality === '7' || quality === 'dom7' || quality === 'dom') quality = 'dom7';
  else if (quality === '9') quality = '9';
  else if (quality === '11') quality = '11';
  else if (quality === '13') quality = '13';
  else if (quality === 'add9') quality = 'maj9';

  // 6. Handle Alterations
  else if (quality === '7b9') quality = '7b9';
  else if (quality === '7#9') quality = '7#9';
  else if (quality === '7b5') quality = '7b5';
  else if (quality === '7#5') quality = 'aug7';
  else if (quality === 'alt' || quality === '7alt') quality = '7alt';
  else if (quality === 'sus4' || quality === 'sus') quality = 'sus4';
  else if (quality === 'sus2') quality = 'sus2';
  else if (quality === '7sus4' || quality === '7sus') quality = '7sus4';
  else if (quality.includes('sus4') && quality.includes('b9')) quality = 'b9sus4';

  // Fallback map check to ensure we return a supported quality
  if (!CHORD_INTERVALS[quality]) {
    // Try to map to nearest known
    if (quality.includes('7')) quality = 'dom7';
    else if (quality.includes('min') || quality.includes('m')) quality = 'min';
    else quality = 'maj';
  }

  return { root, quality, bass };
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
