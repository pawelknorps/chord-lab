import { midiToNoteName } from '../../core/theory';

// Tonnetz Coordinates:
// x-axis: Perfect 5ths (7 semitones)
// y-axis: Major 3rds (4 semitones)
//
// Note(x, y) = (x * 7 + y * 4) % 12
//
// P (Parallel): Share 5th. Major (R, 3, 5) <-> Minor (R, b3, 5). 
// L (Leittonwechsel): Share Maj 3rd. Major (R, 3, 5) <-> Minor (3, 5, 7=R-1).
// R (Relative): Share Min 3rd. Major (R, 3, 5) <-> Minor (6, R, 3).

export interface Triad {
    root: number; // 0-11
    quality: 'Major' | 'Minor';
    notes: number[]; // [Root, 3rd, 5th]
    center: [number, number]; // Centroid for visualization
}

// Get the notes of a triad given a root and quality
export function getTriadNotes(root: number, quality: 'Major' | 'Minor'): number[] {
    const r = root % 12;
    if (quality === 'Major') {
        // Root, M3, P5
        return [r, (r + 4) % 12, (r + 7) % 12];
    } else {
        // Root, m3, P5
        return [r, (r + 3) % 12, (r + 7) % 12];
    }
}

// Transformation Logic
export function transformP(triad: Triad): Triad {
    // Parallel: Same Root, flip quality.
    // C Major (C, E, G) -> C Minor (C, Eb, G).
    // Root stays same.
    const newQuality = triad.quality === 'Major' ? 'Minor' : 'Major';
    return {
        root: triad.root,
        quality: newQuality,
        notes: getTriadNotes(triad.root, newQuality),
        center: [0, 0] // Recalculate later
    };
}

export function transformL(triad: Triad): Triad {
    // Leittonwechsel:
    // C Major (C, E, G) -> E Minor (E, G, B). Root moves up M3 (4 semitones). Quality flips.
    // C Minor (C, Eb, G) -> Ab Major (Ab, C, Eb). Root moves down M3 (8 semitones / -4). Quality flips.

    let newRoot: number;
    if (triad.quality === 'Major') {
        newRoot = (triad.root + 4) % 12; // C -> E
    } else {
        newRoot = (triad.root + 8) % 12; // C -> Ab
    }
    const newQuality = triad.quality === 'Major' ? 'Minor' : 'Major';

    return {
        root: newRoot,
        quality: newQuality,
        notes: getTriadNotes(newRoot, newQuality),
        center: [0, 0]
    };
}

export function transformR(triad: Triad): Triad {
    // Relative:
    // C Major (C, E, G) -> A Minor (A, C, E). Root moves down m3 (9 semitones / -3). Quality flips.
    // C Minor (C, Eb, G) -> Eb Major (Eb, G, Bb). Root moves up m3 (3 semitones). Quality flips.

    let newRoot: number;
    if (triad.quality === 'Major') {
        newRoot = (triad.root + 9) % 12; // C -> A
    } else {
        newRoot = (triad.root + 3) % 12; // C -> Eb
    }
    const newQuality = triad.quality === 'Major' ? 'Minor' : 'Major';

    return {
        root: newRoot,
        quality: newQuality,
        notes: getTriadNotes(newRoot, newQuality),
        center: [0, 0]
    };
}

// Helper to get descriptive text
export function getTriadName(triad: Triad): string {
    const rootName = midiToNoteName(triad.root + 60).slice(0, -1); // use middle C octave for naming
    return `${rootName} ${triad.quality}`;
}
