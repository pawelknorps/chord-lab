/**
 * Whole-tune intensity arc: like a good composition — very calm at the beginning,
 * builds rhythmically toward the middle section, then winds down to the ending.
 * Affects the whole band: piano density, drums, bass activity (push/skip, ghost notes).
 * progress: 0 = start of tune, 1 = end.
 * Returns intensity in [0, 1]: very low at start (~0.06), gentle ramp in intro, peak ~1 at ~55–60%, ~0.4 at end.
 * Beginnings of all songs (including ballads) stay calmer longer.
 */
export function getTuneIntensity(progress: number): number {
    const p = Math.max(0, Math.min(1, progress));
    if (p <= 0.2) {
        // Very low intensity at start; gentle ramp over first 20% of tune
        return 0.06 + (p / 0.2) * 0.2;
    }
    if (p <= 0.58) {
        return 0.26 + ((p - 0.2) / 0.38) * 0.74;
    }
    return 1.0 - ((p - 0.58) / 0.42) * 0.6;
}
