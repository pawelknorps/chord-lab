

// Ron Miller's "Modal Jazz Composition & Harmony" Grips
// These are 3-4 note voicings usually played in the left hand, or as a specific color.
// They are defined by intervals from the TOP note downwards.

export interface Grip {
    name: string;
    label: string;
    description: string;
    intervalsDown: number[]; // Intervals from top note in semitones
    color: string; // Hex color for UI
}

export const GRIPS: Grip[] = [
    {
        name: 'Q1',
        label: 'Q1 (Quartal 1)',
        description: 'm7 - 4 - 4 (e.g. C - G - D - A)',
        intervalsDown: [0, 5, 10, 15], // From top: 0, 4th down, 4th down, 3rd down (m7)
        // Wait, Miller's Q1 is usually stack of 4ths. Let's stick to standard Quartal:
        // 3-note Quartal: 0, 5, 10.
        // 4-note: 0, 5, 10, 15.
        // Let's use strict intervals relative to TOP note.
        // if Top is C(60).
        // Quartal: G(55), D(50), A(45).
        // Intervals down: 5, 10, 15.
        color: '#3b82f6' // Blue
    },
    {
        name: 'Q2',
        label: 'Q2 (So What)',
        description: 'Major 3rd + 4ths', // The "So What" chord inverted?
        // Actually Q2 in some texts implies 3rd on top? 
        // Let's use the standard "So What" voicing structure:
        // Root, 5, b7, 11, 1? No that's the whole chord.
        // We are planing "Grips" under a melody.
        // Let's define a specific beautiful color.
        // "Lydian Grip": Top note is #11. Below: 9, 5, 1.
        // C (#11). Start C. Down to A(9) [min3/3semis], G(5) [maj2/2semis], C?
        // Let's use generic intervallic structures that sound good planed.

        // Structure: M3 down, then 4ths.
        // Top C. Ab (M3 down). Eb (4th). Bb (4th).
        intervalsDown: [0, 4, 9, 14],
        color: '#8b5cf6' // Purple
    },
    {
        name: 'V7alt',
        label: 'Altered Dominant',
        description: 'Tritone + 4ths',
        // Top C. F# (Tritone). C# (4th). G# (4th).
        intervalsDown: [0, 6, 11, 16],
        color: '#ef4444' // Red
    },
    {
        name: 'Maj7',
        label: 'Drop-2 Maj7',
        description: 'Standard Drop 2',
        // Top C. G (4th). E (min3). B (4th). -> C G E B (Cmaj7)
        // C to G (5 down/7up). C to E (min6 down). C to B (min2/maj7 down).
        // Intervals down: 0 (C), 5 (G), 8 (E), 13 (B-1oct) ? 
        // Let's verify Drop 2 Cmaj7: C E G B.
        // Close: C E G B.
        // Drop 2: G C E B. (G in bass).
        // Under a melody note C:
        // The voicing is A minor 7? Or C major 6?
        // Let's just use a fixed "Cluster" grip.
        // Seconds: C, B, G, E.
        intervalsDown: [0, 1, 5, 8],
        color: '#10b981' // Emerald
    },
    {
        name: 'Dim7',
        label: 'Diminished',
        description: 'Minor 3rds stacked',
        intervalsDown: [0, 3, 6, 9],
        color: '#f59e0b' // Amber
    }
];

// Function to Construct Grip under a melody note
export function constructGrip(topNoteMidi: number, gripName: string): number[] {
    const grip = GRIPS.find(g => g.name === gripName);
    if (!grip) return [topNoteMidi];

    // Simply subtract intervals
    return grip.intervalsDown.map(interval => topNoteMidi - interval);
}

// Generate a random "Non-Functional" Melody
// e.g. Random notes from a chromatic or Whole tone scale to encourage color hearing
export function generateMelody(length: number = 8): number[] {
    const scale = [60, 62, 64, 66, 68, 70, 72]; // Whole tone-ish
    // Or just simple C major scale but completely random order

    const melody = [];
    for (let i = 0; i < length; i++) {
        // Random move
        // -3 to +3 scale steps
        // This is pseudo logic, let's just pick random notes from a set
        const note = scale[Math.floor(Math.random() * scale.length)];
        melody.push(note);
    }
    return melody;
}
