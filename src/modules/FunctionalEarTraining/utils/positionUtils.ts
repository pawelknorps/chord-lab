
export const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const STRING_TUNING = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

export const CAGED_POSITIONS = ['C', 'A', 'G', 'E', 'D'];

export const C_AM_POSITION_RANGES: Record<string, { fretStart: number, fretEnd: number }> = {
    'C': { fretStart: 0, fretEnd: 3 },
    'A': { fretStart: 2, fretEnd: 5 },
    'G': { fretStart: 5, fretEnd: 8 },
    'E': { fretStart: 7, fretEnd: 10 },
    'D': { fretStart: 10, fretEnd: 13 },
};

export function getScaleNotes(root: string, scaleType: string) {
    const rootIndex = CHROMATIC_SCALE.indexOf(root);
    const intervals = scaleType === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
    return intervals.map(interval => CHROMATIC_SCALE[(rootIndex + interval) % 12]);
}

export function getAllScaleNotesOnFretboard(root: string, scaleType: string) {
    const scaleNotes = getScaleNotes(root, scaleType);
    const notes = [];
    for (let string = 1; string <= 6; string++) {
        const openNote = STRING_TUNING[string - 1];
        const openIndex = CHROMATIC_SCALE.indexOf(openNote.slice(0, -1));
        for (let fret = 0; fret <= 15; fret++) {
            const note = CHROMATIC_SCALE[(openIndex + fret) % 12];
            if (scaleNotes.includes(note)) {
                notes.push({ string, fret, note, isRoot: note === root });
            }
        }
    }
    return notes;
}
