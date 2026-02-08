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
    // We use Math.round to handle minor floating point drift from UI sliders
    const reflectedPC = Math.round(reflectedAngle / 30) % 12;

    // Determine Octave preservation
    // Simple strategy: Keep relatively close to original pitch
    // We calculate the difference in semitones and apply it
    // This allows C4 to map to something near C4, not C-1 or C9
    const diff = reflectedPC - notePC;

    // If the difference pushes us too far (e.g. > 6 semitones), we might want to adjust?
    // Actually, simple reflection usually works best if we just apply the PC difference directly.
    // Example: C (0) to G (7). Diff +7.
    // Example: C (0) across C-Axis (0). Reflected = 0. Diff 0.
    return midi + diff;
}

/**
 * Reflect a set of notes (chord)
 */
export function getReflectedChord(notes: number[], axisAngle: number): number[] {
    return notes.map(n => getReflectedNote(n, axisAngle));
}
