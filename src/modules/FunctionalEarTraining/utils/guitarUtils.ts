
export const GUITAR_STRINGS = [
    { name: 'e', index: 0, root: 'E4' },
    { name: 'B', index: 1, root: 'B3' },
    { name: 'G', index: 2, root: 'G3' },
    { name: 'D', index: 3, root: 'D3' },
    { name: 'A', index: 4, root: 'A2' },
    { name: 'E', index: 5, root: 'E2' }
];

export const FRET_DOTS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
export const DOUBLE_DOTS = [12, 24];

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const getNoteAtFret = (stringIndex: number, fret: number) => {
    const stringRoots = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
    const rootNote = stringRoots[stringIndex];

    // Basic MIDI note calculation
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootName = rootNote.slice(0, -1);
    const rootOctave = parseInt(rootNote.slice(-1));

    let noteIndex = noteNames.indexOf(rootName);
    let noteMidi = (rootOctave + 1) * 12 + noteIndex;

    const targetMidi = noteMidi + fret;
    const targetName = noteNames[targetMidi % 12];
    const targetOctave = Math.floor(targetMidi / 12) - 1;

    return {
        note: targetName,
        octave: targetOctave,
        fullNote: `${targetName}${targetOctave}`,
        midi: targetMidi
    };
};

export const checkNotePosition = (string: number, fret: number, targetNote: any) => {
    const noteAtPos = getNoteAtFret(string, fret);
    return noteAtPos.note === targetNote.noteName || noteAtPos.note === targetNote.note;
};
