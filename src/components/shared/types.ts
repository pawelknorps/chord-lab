// Shared types for UnifiedPiano and UnifiedFretboard components

export type PianoMode = 'display' | 'input' | 'playback' | 'highlight';
export type NoteLabel = 'none' | 'note-name' | 'interval' | 'scale-degree' | 'chord-tone';
export type FretboardMode = 'notes' | 'intervals' | 'scale-degrees' | 'chord-tones';
export type FretboardTuning = 'standard' | 'drop-d' | 'open-g' | 'custom';

export interface UnifiedPianoProps {
    mode: PianoMode;
    highlightedNotes?: number[];
    activeNotes?: number[];
    onNoteClick?: (note: number) => void;
    onNotePress?: (note: number) => void;
    onNoteRelease?: (note: number) => void;
    showLabels?: NoteLabel;
    showIntervals?: boolean;
    rootNote?: number;
    /** When showLabels is chord-tone, pass chord symbol so labels match Chord Lab (e.g. #9 not m3 for C7#9). */
    chordSymbol?: string;
    octaveRange?: [number, number];
    disabled?: boolean;
    playSound?: boolean;
    className?: string;
}

export interface PianoKey {
    note: number;
    isBlack: boolean;
    position: number;
    noteName: string;
}

export interface UnifiedFretboardProps {
    mode: FretboardMode;
    tuning?: FretboardTuning | string[];
    highlightedNotes?: number[];
    activeNotes?: number[];
    /** When true, highlight all fret positions that match the pitch classes of the given notes (full neck). */
    highlightByPitchClass?: boolean;
    onNoteClick?: (note: number, string: number, fret: number) => void;
    showFretNumbers?: boolean;
    showStringNames?: boolean;
    fretRange?: [number, number];
    rootNote?: number;
    /** When mode is chord-tones, pass chord symbol so labels match Chord Lab (e.g. #9 not m3). */
    chordSymbol?: string;
    interactive?: boolean;
    playSound?: boolean;
    className?: string;
}

export interface FretPosition {
    string: number;
    fret: number;
    note: number;
}

export interface ProgressionData {
    name?: string;
    chords: string[];
    key?: string;
    source?: string;
}

export interface ChordData {
    name?: string;
    root: string;
    quality: string;
    notes?: number[];
    source?: string;
}
