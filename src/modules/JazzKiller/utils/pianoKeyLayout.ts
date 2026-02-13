/**
 * Maps MIDI note numbers to horizontal positions that match UnifiedPiano layout.
 * Used so falling notes in NoteWaterfall align with the piano keys below.
 */

const WHITE_KEY_IN_OCTAVE = [0, 0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6] as const;
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

export type OctaveRange = [number, number];

/** Piano key horizontal layout (0..1) matching UnifiedPiano CSS */
export function midiToPianoKeyLayout(
    midi: number,
    octaveRange: OctaveRange
): { xCenter: number; width: number; isBlack: boolean } | null {
    const [startOctave, endOctave] = octaveRange;
    const totalWhiteKeys = (endOctave - startOctave + 1) * 7;
    const octave = Math.floor(midi / 12) - 1;
    const noteInOctave = midi % 12;

    if (octave < startOctave || octave > endOctave) return null;

    const whiteKeyInOctave = WHITE_KEY_IN_OCTAVE[noteInOctave];
    const whiteKeyIndex = (octave - startOctave) * 7 + whiteKeyInOctave;
    const isBlack = IS_BLACK[noteInOctave];

    if (isBlack) {
        const left = (whiteKeyIndex + 0.7) / totalWhiteKeys;
        const width = 0.03;
        const xCenter = left + width / 2;
        return { xCenter, width, isBlack: true };
    }
    const left = whiteKeyIndex / totalWhiteKeys;
    const width = 1 / totalWhiteKeys;
    const xCenter = left + width / 2;
    return { xCenter, width, isBlack: false };
}

/** Default octave range for JazzKiller waterfall (matches typical comping range) */
export const DEFAULT_WATERFALL_OCTAVE_RANGE: OctaveRange = [3, 5];
