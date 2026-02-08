

// Negative Harmony Logic
// based on Ernst Levy / Jacob Collier
// Axis of symmetry is between the Minor 3rd and Major 3rd of the tonic.
// For C Major (Root=0): Axis is 3.5 (between Eb(3) and E(4)).
// Reflection formula: Note' = (Axis * 2) - Note
// Or: Note' = (Root + 7) - (Note - Root)  => (Root + 7 - Note + Root) => 2*Root + 7 - Note.

export const getNegativeNote = (midiNote: number, rootMidi: number = 60): number => {
    // We only care about Pitch Class for the calculation, but we want to preserve octave direction roughly?
    // STRICT Negative Harmony inverts the contour. Up becomes Down.
    // So we need a "Center of Inversion".

    // Axis in MIDI domain relative to Root:
    // Axis = Root + 3.5
    const axis = rootMidi + 3.5;

    // Reflection
    const diff = axis - midiNote;
    const reflected = axis + diff;

    // reflected = axis + axis - midiNote = 2*axis - midiNote
    // = 2*(Root + 3.5) - midiNote
    // = 2*Root + 7 - midiNote.

    return Math.round(reflected);
};

export const getNegativeChord = (notes: number[], root: number = 60): number[] => {
    return notes.map(n => getNegativeNote(n, root));
};
