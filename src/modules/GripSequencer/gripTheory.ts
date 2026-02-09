

// Ron Miller's "Modal Jazz Composition & Harmony" Grips
// These are 3-4 note voicings usually played in the left hand, or as a specific color.
// They are defined by intervals from the TOP note downwards.

export interface Grip {
    name: string;
    label: string;
    description: string;
    intervalsDown: number[]; // Intervals from top note in semitones
    intervalsDownNames: string[]; // Academic interval names
    theory: string; // Theoretical explanation
    color: string; // Hex color for UI
}

export const GRIPS: Grip[] = [
    {
        name: 'Q1',
        label: 'Q1 (Quartal 1)',
        description: 'Stack of perfect 4ths',
        intervalsDown: [0, 5, 10, 15],
        intervalsDownNames: ['Unison', 'P4 down', 'm7 down', 'P11 down'],
        theory: 'A classic modern jazz sound. Built from 4th intervals, it avoids traditional major/minor third tensions, creating an "open" and versatile harmonic color.',
        color: '#3b82f6' // Blue
    },
    {
        name: 'Q2',
        label: 'Q2 (So What)',
        description: 'M3 + Stacked 4ths',
        intervalsDown: [0, 4, 9, 14],
        intervalsDownNames: ['Unison', 'M3 down', 'M6 down', 'M9 down'],
        theory: 'Famous from Bill Evans and Miles Davis (e.g. "So What"). It contains a major third at the top, giving it a slightly more Lydian or Dorian characteristic than strict quartals.',
        color: '#8b5cf6' // Purple
    },
    {
        name: 'V7alt',
        label: 'Altered Dominant',
        description: 'Tritone + 4ths',
        intervalsDown: [0, 6, 11, 16],
        intervalsDownNames: ['Unison', 'Tritone down', 'M7 down', 'P12 down'],
        theory: 'A high-tension grip used over altered dominant chords. It captures the #11, b7, and tensions like b9 or #9 depending on the root.',
        color: '#ef4444' // Red
    },
    {
        name: 'Maj7',
        label: 'Maj7 Cluster',
        description: 'Tight chordal tone',
        intervalsDown: [0, 1, 5, 8],
        intervalsDownNames: ['Unison', 'm2 down', 'P4 down', 'm6 down'],
        theory: 'A dense voicing that emphasizes the "rub" between the 7th and the tonic note. Great for modern ballad endings.',
        color: '#10b981' // Emerald
    },
    {
        name: 'Dim7',
        label: 'Diminished',
        description: 'Symmetric minor 3rd stack',
        intervalsDown: [0, 3, 6, 9],
        intervalsDownNames: ['Unison', 'm3 down', 'Tritone down', 'm6 down'],
        theory: 'Symmetric and highly unstable. Used as a passing structure or to create "dark" tension that wants to resolve in any direction.',
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
