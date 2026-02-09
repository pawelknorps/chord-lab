
export const CHORD_DEFINITIONS = {
    'C': ['C4', 'E4', 'G4'],
    'C#': ['C#4', 'F4', 'G#4'],
    'D': ['D4', 'F#4', 'A4'],
    'D#': ['D#4', 'G4', 'A#4'],
    'E': ['E4', 'G#4', 'B4'],
    'F': ['F4', 'A4', 'C5'],
    'F#': ['F#4', 'A#4', 'C#5'],
    'G': ['G4', 'B4', 'D5'],
    'G#': ['G#4', 'C5', 'D#5'],
    'A': ['A4', 'C#5', 'E5'],
    'A#': ['A#4', 'D5', 'F5'],
    'B': ['B4', 'D#5', 'F#5'],
    'Cm': ['C4', 'Eb4', 'G4'],
    'C#m': ['C#4', 'E4', 'G#4'],
    'Dm': ['D4', 'F4', 'A4'],
    'D#m': ['D#4', 'F#4', 'A#4'],
    'Em': ['E4', 'G4', 'B4'],
    'Fm': ['F4', 'Ab4', 'C5'],
    'F#m': ['F#4', 'A4', 'C#5'],
    'Gm': ['G4', 'Bb4', 'D5'],
    'G#m': ['G#4', 'B4', 'D#5'],
    'Am': ['A4', 'C5', 'E5'],
    'A#m': ['A#4', 'C#5', 'F5'],
    'Bm': ['B4', 'D5', 'F#5']
};

export const getChordTones = (chord: string) => {
    const CHORD_TONES: Record<string, string[]> = {
        'C': ['C', 'E', 'G'],
        'C#': ['C#', 'F', 'G#'],
        'D': ['D', 'F#', 'A'],
        'D#': ['D#', 'G', 'A#'],
        'E': ['E', 'G#', 'B'],
        'F': ['F', 'A', 'C'],
        'F#': ['F#', 'A#', 'C#'],
        'G': ['G', 'B', 'D'],
        'G#': ['G#', 'C', 'D#'],
        'A': ['A', 'C#', 'E'],
        'A#': ['A#', 'D', 'F'],
        'B': ['B', 'D#', 'F#'],
        'Cm': ['C', 'Eb', 'G'],
        'C#m': ['C#', 'E', 'G#'],
        'Dm': ['D', 'F', 'A'],
        'D#m': ['D#', 'F#', 'A#'],
        'Em': ['E', 'G', 'B'],
        'Fm': ['F', 'Ab', 'C'],
        'F#m': ['F#', 'A', 'C#'],
        'Gm': ['G', 'Bb', 'D'],
        'G#m': ['G#', 'B', 'D#'],
        'Am': ['A', 'C', 'E'],
        'A#m': ['A#', 'C#', 'F'],
        'Bm': ['B', 'D', 'F#']
    };
    return CHORD_TONES[chord] || [];
};

export const PROGRESSION_LIBRARY = [
    { id: 'i-v-vi-iv', name: 'I-V-vi-IV (Pop)', chords: ['C', 'G', 'Am', 'F'] },
    { id: 'i-vi-iv-v', name: 'I-vi-IV-V (50s)', chords: ['C', 'Am', 'F', 'G'] },
    { id: 'i-iv-v', name: 'I-IV-V (Blues)', chords: ['C', 'F', 'G'] },
    { id: 'ii-v-i', name: 'ii-V-I (Jazz)', chords: ['Dm', 'G', 'C'] },
    { id: 'i-vi-ii-v', name: 'I-vi-ii-V (Circle)', chords: ['C', 'Am', 'Dm', 'G'] },
    { id: 'vi-iv-i-v', name: 'vi-IV-I-V (Sensitive)', chords: ['Am', 'F', 'C', 'G'] }
];
