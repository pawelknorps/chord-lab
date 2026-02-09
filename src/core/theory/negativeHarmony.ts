/**
 * Negative Harmony / Chromatic Inversion Logic
 * Based on the concept of reflecting notes across an axis on the Chromatic Circle.
 * 
 * Standard Axis (Jacob Collier / Ernst Levy):
 * - "Axis of C Major" is often defined between E and Eb (Axis 3.5 in semitones, or 105 degrees).
 * - "Generator Axis" (C-G) implies reflection across the perfect fifth.
 * 
 * In this implementation, we use a visual 360-degree chromatic circle where C=0 degrees.
 */

/**
 * basic reflection of a MIDI note across an axis.
 * @param midi - The input MIDI note number
 * @param axisAngle - The angle of the axis in degrees (0 = C, 30 = C#, 180 = F#, etc.)
 * @returns The reflected MIDI note number
 */
export function getReflectedNote(midi: number, axisAngle: number): number {
    const notePC = midi % 12;
    const noteAngle = notePC * 30; // 30 degrees per semitone (360 / 12)

    // Formula: Reflected Angle = 2 * Axis - Original
    let reflectedAngle = (2 * axisAngle - noteAngle) % 360;

    // Normalize to 0-360
    if (reflectedAngle < 0) reflectedAngle += 360;

    // Round to nearest semitone (30 degrees)
    const reflectedPC = Math.round(reflectedAngle / 30) % 12;

    // Determine Octave preservation
    // Strategy: We want the reflected note to maintain a similar "range" 
    // but inverting the interval from the axis.
    const axisMidi = (axisAngle / 30); // Semantic axis in semitones

    // Calculate reflection in absolute semitone space relative to a central octave
    // We use a fixed reference to ensure consistency
    const refMidi = 60 + (axisMidi % 12);
    const diff = midi - refMidi;
    const reflectedAbsolute = refMidi - diff;

    // Round to nearest integer and ensure we have the correct pitch class
    let finalMidi = Math.round(reflectedAbsolute);
    while ((finalMidi % 12 + 12) % 12 !== reflectedPC) {
        finalMidi++; // This is a bit hacky, let's refine
    }

    return finalMidi;
}

/**
 * Standard Negative Harmony reflection across the Tonic/Dominant axis.
 * For a given root (I), the axis is between the minor 3rd and major 3rd (Root + 3.5).
 */
export function getNegativeNote(midi: number, rootMidi: number): number {
    const axis = rootMidi + 3.5;
    const reflected = 2 * axis - midi;
    return Math.round(reflected);
}

/**
 * Reflect a set of notes (chord)
 */
export function getReflectedChord(notes: number[], axisAngle: number): number[] {
    return notes.map(n => getReflectedNote(n, axisAngle));
}

/**
 * Get negative version of a chord based on a root
 */
export function getNegativeChord(notes: number[], rootMidi: number): number[] {
    return notes.map(n => getNegativeNote(n, rootMidi));
}
