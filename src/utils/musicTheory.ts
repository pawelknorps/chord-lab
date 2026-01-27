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
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
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
  genre: string;
  degrees: number[];
  description: string;
}

// Common chord progressions
export const PRESETS: Progression[] = [
  { name: 'Pop Classic', genre: 'Pop', degrees: [0, 4, 5, 3], description: 'I - V - vi - IV' },
  { name: 'Axis of Awesome', genre: 'Pop', degrees: [0, 5, 3, 4], description: 'I - vi - IV - V' },
  { name: '50s Progression', genre: 'Pop', degrees: [0, 5, 3, 4], description: 'I - vi - IV - V' },
  { name: 'Pachelbel\'s Canon', genre: 'Classical', degrees: [0, 4, 5, 2, 3, 0, 3, 4], description: 'I - V - vi - iii - IV - I - IV - V' },
  { name: 'Jazz ii-V-I', genre: 'Jazz', degrees: [1, 4, 0], description: 'ii - V - I' },
  { name: 'Jazz Turnaround', genre: 'Jazz', degrees: [0, 5, 1, 4], description: 'I - vi - ii - V' },
  { name: 'Blues Shuffle', genre: 'Blues', degrees: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4], description: '12-bar blues' },
  { name: 'Lo-fi Chill', genre: 'Lo-fi', degrees: [1, 4, 0, 5], description: 'ii - V - I - vi' },
  { name: 'Neo Soul', genre: 'R&B', degrees: [0, 3, 1, 4], description: 'I - IV - ii - V (extended)' },
  { name: 'Andalusian Cadence', genre: 'Flamenco', degrees: [5, 4, 3, 0], description: 'vi - V - IV - I' },
  { name: 'Royal Road', genre: 'J-Pop', degrees: [3, 4, 2, 0], description: 'IV - V - iii - I' },
  { name: 'Creep Progression', genre: 'Rock', degrees: [0, 2, 3, 3], description: 'I - III - IV - iv' },
];

// Get note name from MIDI number
export function midiToNoteName(midi: number, useFlats = false): string {
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
  
  if (baseQuality === 'maj' && extension === '7th') return 'maj7';
  if (baseQuality === 'min' && extension === '7th') return 'min7';
  if (baseQuality === 'dim' && extension === '7th') return 'dim7';
  if (baseQuality === 'maj' && extension === 'dom7') return 'dom7';
  
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
