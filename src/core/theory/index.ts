// All note names
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

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
  'maj': [0, 4, 7],
  'min': [0, 3, 7],
  'dim': [0, 3, 6],
  'aug': [0, 4, 8],
  'maj7': [0, 4, 7, 11],
  'min7': [0, 3, 7, 10],
  'dom7': [0, 4, 7, 10],
  'dim7': [0, 3, 6, 9],
  'm7b5': [0, 3, 6, 10], // Half-diminished
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '7sus4': [0, 5, 7, 10],
  'maj9': [0, 4, 7, 11, 14],
  'min9': [0, 3, 7, 10, 14],
  '9': [0, 4, 7, 10, 14],
  '11': [0, 4, 7, 10, 14, 17],
  'min11': [0, 3, 7, 10, 14, 17], // For "So What" chords
  '13': [0, 4, 7, 10, 14, 21],
  '13b9': [0, 4, 7, 10, 13, 21], // Bill Evans V chord
  '6': [0, 4, 7, 9],
  'm6': [0, 3, 7, 9],
  '7alt': [0, 4, 10, 13, 20], // 1-3-b7-b9-#13 (Shell voicing style)
  '9sus4': [0, 5, 7, 10, 14], // Maiden Voyage chord
};

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

// Get note name from MIDI number
export function midiToNoteName(midi: number, useFlats = false): string {
  if (isNaN(midi) || !isFinite(midi)) return 'C4'; // Validation fallback
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  const noteName = useFlats ? NOTE_NAMES_FLAT[noteIndex] : NOTE_NAMES[noteIndex];
  return `${noteName}${octave}`;
}

// Get MIDI number from note name
export function noteNameToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return 60; // Default to middle C

  let note = match[1];
  const octave = parseInt(match[2]);

  // Convert flat to sharp
  if (note.includes('b')) {
    const flatIndex = NOTE_NAMES_FLAT.indexOf(note as any);
    note = NOTE_NAMES[flatIndex];
  }

  const noteIndex = NOTE_NAMES.indexOf(note as any);
  return (octave + 1) * 12 + noteIndex;
}

// Get all chords in a scale
export function getScaleChords(root: string, scaleName: string, octave = 4): ChordInfo[] {
  const scale = SCALES[scaleName];
  if (!scale) return [];

  const rootIndex = NOTE_NAMES.indexOf(root as any) ?? NOTE_NAMES_FLAT.indexOf(root as any);
  if (rootIndex === -1) return [];

  return scale.intervals.map((interval, degree) => {
    const chordRoot = (rootIndex + interval) % 12;
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
    const baseMidi = (octave + 1) * 12 + chordRoot;

    const midiNotes = chordIntervals.map(i => baseMidi + i);
    const notes = midiNotes.map(m => midiToNoteName(m));

    return {
      root: NOTE_NAMES[chordRoot],
      quality,
      roman: displayRoman,
      degree,
      notes,
      midiNotes,
    };
  });
}

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
  const rootIndex = NOTE_NAMES.indexOf(root as any) ?? NOTE_NAMES_FLAT.indexOf(root as any);
  if (rootIndex === -1) return [];

  const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['maj'];
  const baseMidi = (octave + 1) * 12 + rootIndex;

  const midiNotes = intervals.map(i => baseMidi + i);
  return applyVoicing(midiNotes, voicing);
}

// Parse a complex chord string into components
export function parseChord(chordName: string): { root: string; quality: string; bass?: string } {
  // Handle slash chords (e.g., C/G)
  const parts = chordName.split('/') as [string] | [string, string];
  const base = parts[0];
  const bass = parts[1];

  // Regex to separate root from quality
  const match = base.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return { root: 'C', quality: 'maj', bass };

  const root = match[1];
  let quality = match[2];

  // Normalize quality strings
  if (!quality || quality === 'M' || quality === 'maj') quality = 'maj';
  else if (quality === 'm' || quality === '-') quality = 'min';
  else if (quality === '7') quality = 'dom7';
  else if (quality === 'M7' || quality === 'maj7' || quality === 'Δ') quality = 'maj7';
  else if (quality === 'm7' || quality === '-7') quality = 'min7';
  else if (quality === 'm7b5' || quality === 'ø') quality = 'm7b5';
  else if (quality === 'dim' || quality === '°') quality = 'dim';
  else if (quality === 'dim7' || quality === '°7') quality = 'dim7';

  // Return the best match or fallback (the audio engine needs to support these qualities)
  return { root, quality, bass };
}
