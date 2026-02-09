
// Barry Harris 6th Diminished Logic
// C6 Dim Scale: C D E F G G# A B
// Pitch Classes: 0 2 4 5 7 8 9 11

export const SCALE_C6_DIM = [0, 2, 4, 5, 7, 8, 9, 11];

// Chord Tones (Major 6): C E G A (0, 4, 7, 9)
// Non-Chord Tones (Dim 7): D F G# B (2, 5, 8, 11) - Bdim7 (B D F Ab) which is dominant function to C.

export const isChordTone = (pc: number): boolean => {
    return [0, 4, 7, 9].includes(pc % 12);
};

// Get the Drop-2 voicing for a given melody note in C6 Dim scale
// Melody note is the TOP note of the voicing.
// Drop-2: Take the 2nd voice from top and drop it an octave.
//
// If Melody is C (0) -> C6 Chord (C E G A). Close: C E G A (A is top? No).
// If Top is C. Chord C6.
// Inversions of C6:
// 1. C E G A (Base position, A on top?). No, C E G A is root pos. A is top. 
// Voices from bottom: C E G A. Top=A.
// If Top is C: E G A C.
// If Top is E: G A C E.
// If Top is G: A C E G.
//
// Drop 2 rule:
// Close: 1 2 3 4 (1=Top). Drop voice 2 (3rd note from bottom).
// E.g. Top C. Close: E G A C. (Voices: E, G, A, C).
// Drop 2nd from top (A). Move A down octave.
// Result: A E G C. (Open voicing).
//
// Let's verify for all scale steps.

export const getTargetVoicing = (melodyMidi: number): number[] => {
    const pc = melodyMidi % 12;
    // We assume key of C Major for simplicity of the module

    let closeVoicing: number[] = [];

    // Construct Close Position voicing (4 notes, melody on top)
    if (isChordTone(pc)) {
        // Build C6 with melody on top
        if (pc === 0) closeVoicing = [4, 7, 9, 0]; // E G A C
        else if (pc === 4) closeVoicing = [7, 9, 0, 4]; // G A C E
        else if (pc === 7) closeVoicing = [9, 0, 4, 7]; // A C E G
        else if (pc === 9) closeVoicing = [0, 4, 7, 9]; // C E G A
    } else {
        // Build Bdim7 (D F Ab B) with melody on top, treating it as Ddim7 etc.
        // D F G# B
        if (pc === 2) closeVoicing = [5, 8, 11, 2]; // F G# B D
        else if (pc === 5) closeVoicing = [8, 11, 2, 5]; // G# B D F
        else if (pc === 8) closeVoicing = [11, 2, 5, 8]; // B D F G#
        else if (pc === 11) closeVoicing = [2, 5, 8, 11]; // D F G# B
    }

    // Map close voicing to MIDI relative to melodyMidi
    // The 'closeVoicing' array is just PC. We need actual Midi notes.
    // The last note in closeVoicing is the melody note (melodyMidi).
    // Works backwards.

    const voicingMidi: number[] = [];
    // Top note is melodyMidi
    voicingMidi[3] = melodyMidi;

    // Calculate others downwards
    // Voice 3 (2nd from top)
    const n3 = closeVoicing[2]; // PC
    // Find closest note below melodyMidi with this PC
    let m3 = melodyMidi - 1;
    while (m3 % 12 !== n3) m3--;
    voicingMidi[2] = m3;

    // Voice 2
    const n2 = closeVoicing[1];
    let m2 = m3 - 1;
    while (m2 % 12 !== n2) m2--;
    voicingMidi[1] = m2;

    // Voice 1 (Bottom)
    const n1 = closeVoicing[0];
    let m1 = m2 - 1;
    while (m1 % 12 !== n1) m1--;
    voicingMidi[0] = m1;

    // Apply Drop 2:
    // Take Voice 3 (2nd from top) -> voicingMidi[2].
    // Move it down 1 octave.
    const dropNote = voicingMidi[2] - 12;

    // New Voicing: [dropNote, voicingMidi[0], voicingMidi[1], voicingMidi[3]]
    // Sorted?
    // voicingMidi[0] (Bottom of close) ... dropNote is usually lower.

    return [dropNote, voicingMidi[0], voicingMidi[1], voicingMidi[3]].sort((a, b) => a - b);
};
