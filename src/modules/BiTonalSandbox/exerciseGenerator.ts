import { noteNameToMidi, midiToNoteName } from '../../core/theory';

// Definitions for Bi-Tonal exercises
// Based on Bill Dobbins / Berklee theory

export interface BiTonalExercise {
    shellRoot: string;
    shellQuality: string; // 'Dom7' mostly
    shellNotes: string[]; // e.g. ["C3", "Bb3"]
    upperStructureRoot: string; // e.g. "D"
    upperStructureQuality: string; // "Major" or "Minor"
    upperStructureNotes: string[]; // e.g. ["D4", "F#4", "A4"]
    targetColor: string; // Display name, e.g. "Lydian Dominant"
    dissonanceNotes: string[]; // Notes that would cause maximum wobble if played
}

const SHELL_ROOTS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'G', 'D', 'A', 'E', 'B', 'F#'];

const UPPER_STRUCTURES = [
    {
        interval: 2, // 2 (Major 9) -> D over C7 -> Lydian Dominant
        quality: 'Major',
        color: 'Lydian Dominant (13 #11)',
        semitonesFromRoot: 2
    },
    {
        interval: 6, // 6 (Major 13) -> A over C7 -> 13b9 (Diminished scale sound) - wait, A over C7 is A C# E. C7 is C E G Bb. 
        // A (13), C# (b9), E (3). 13b9. Correct. 
        quality: 'Major',
        color: '13 (b9)',
        semitonesFromRoot: 9
    },
    {
        interval: 9, // b6 (Minor 13) -> Ab over C7 -> Alt? Ab(b13) C(1) Eb(#9). 
        // Ab Major: Ab C Eb. 
        // C7: C E G Bb
        // Ab is b13. C is 1. Eb is #9.
        // So Ab Major over C7 = #9 b13. "Altered"
        quality: 'Major',
        color: 'Altered (#9 b13)',
        semitonesFromRoot: 8
    },
    {
        interval: 5.5, // F# over C7 -> F#( #11), A# (b7), C# (b9).
        // F# Major: F# A# C#.
        // C7: C E G Bb.
        // F# (#11), A# is Bb (b7), C# (b9).
        // So Tri-Tone sub triad? Or just #11 b9.
        quality: 'Major',
        color: 'Altered (#11 b9)',
        semitonesFromRoot: 6
    }
];

export function generateExercise(): BiTonalExercise {
    const root = SHELL_ROOTS[Math.floor(Math.random() * SHELL_ROOTS.length)];
    const us = UPPER_STRUCTURES[Math.floor(Math.random() * UPPER_STRUCTURES.length)];

    // 1. Generate Shell (Root + 7th or Root + 3rd + 7th)
    // Simple shell: Root (octave 2) + b7 (octave 3)
    const rootMidi = noteNameToMidi(`${root}2`);
    const b7Midi = rootMidi + 10; // m7 interval
    const shellNotes = [midiToNoteName(rootMidi), midiToNoteName(b7Midi)];

    // 2. Generate Upper Structure
    const usRootMidi = rootMidi + us.semitonesFromRoot + 12; // Octave up
    // Note: getChordNotes returns MIDI numbers. noteNameToMidi expects "C3".

    // Re-calculate strictly
    // usRootMidi is the MIDI of the triad root.
    // We need to convert it back to Note Name to use getChordNotes??
    // Actually getChordNotes takes (root, quality).
    // Let's implement a simpler triad calculator here to avoid circular dep or complexity

    const triadIntervals = us.quality === 'Major' ? [0, 4, 7] : [0, 3, 7];
    const upperStructureMidi = triadIntervals.map(i => usRootMidi + i);
    const upperStructureNotes = upperStructureMidi.map(m => midiToNoteName(m));

    // 3. Dissonance Notes (random chromatic notes not in the scale)
    // For simplicity, just notes a semitone away from target
    const dissonanceNotes = upperStructureMidi.map(m => midiToNoteName(m + 1));

    return {
        shellRoot: root,
        shellQuality: '7',
        shellNotes,
        upperStructureRoot: midiToNoteName(usRootMidi).slice(0, -1),
        upperStructureQuality: us.quality,
        upperStructureNotes,
        targetColor: us.color,
        dissonanceNotes
    };
}
