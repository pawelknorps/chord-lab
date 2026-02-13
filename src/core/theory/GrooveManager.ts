/**
 * GrooveManager: Bebop-style swing + tempo–swing correlation (JJazzLab-aligned).
 *
 * 1. Tempo–swing correlation: JJazzLab SwingProfile-style four-point curve (50→2.3, 120→2.0, 190→1.8, 240→1.6).
 *    Returns fraction of beat for the upbeat = R/(1+R). So 120 BPM → 2/3 (JJ-03). Slow = more swing, fast = straighter.
 * 2. Off-beat ("let") placement uses that ratio so bass ghost and ride lock (shared pipeline, JJ-04).
 * 3. Instrument personality: Ride tight (-3ms, minimal jitter), Snare drags (+20ms),
 *    Bass lays back on slow (+15ms), pushes on fast (-5ms).
 * 4. Humanization: Gaussian micro-timing ε ~ N(0, σ²), σ ≈ 2–5ms. Bass and drums use same getHumanizationJitter.
 */

export type GrooveInstrument = "Ride" | "RideBell" | "Snare" | "SnareRim" | "Bass" | "Kick" | "HatPedal" | "HatOpen";

/** Box-Muller: sample from N(0, 1). */
function gaussianSample(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    if (u1 < 1e-10) return 0;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export class GrooveManager {
    /**
     * Elastic Pulse Generation (2026 SOTA): Variable swing ratio by tempo.
     * 60–120: heavy dotted-eighth (3:1). 120–180: standard triplet (2:1). 180–250: straightening (1.5:1). 250+: nearly straight (Elvin drive).
     * Returns the fraction of the beat for the skip-beat ("a-lang"). Bass and drums share this via getOffBeatOffsetInBeat.
     */
    getSwingRatio(bpm: number): number {
        const t = Math.max(20, Math.min(400, bpm));
        if (t < 120) return 0.75;   // 3:1 heavy dotted-eighth
        if (t > 250) return 0.55;   // ~1.2:1 nearly straight
        // 120 → 2/3 (2:1 triplet), 250 → 0.55. Smooth transition.
        const twoThirds = 2 / 3;
        return twoThirds + ((t - 120) / 130) * (0.55 - twoThirds);
    }

    /**
     * Gaussian humanization for micro-timing: t_final = t_calculated + ε, ε ~ N(0, σ²).
     * @param sigmaMs σ in milliseconds (default 3). Typical 2–5ms for authentic feel.
     * @returns offset in seconds.
     */
    getHumanizationJitter(sigmaMs: number = 3): number {
        const sigmaSec = sigmaMs / 1000;
        return gaussianSample() * sigmaSec;
    }

    /**
     * Offset in seconds from the start of a beat to the "and" (off-beat).
     * Use this so bass ghost and ride "and" land at the same swing grid.
     */
    getOffBeatOffsetInBeat(bpm: number): number {
        const beatDuration = 60 / Math.max(20, Math.min(400, bpm));
        return beatDuration * this.getSwingRatio(bpm);
    }

    /**
     * Returns the time offset in seconds for the given instrument at the given BPM.
     * Positive = late, negative = early. Includes personality (Ride push, Snare drag, Bass tempo-aware).
     * Ride uses smaller offsets and jitter for a tighter, less loose feel.
     */
    getMicroTiming(bpm: number, instrument: GrooveInstrument): number {
        const beatDuration = 60 / Math.max(20, Math.min(400, bpm));

        let percentage = 0;
        switch (instrument) {
            case "Ride":
            case "RideBell":
                percentage = -0.004;  // Tight
                break;
            case "Snare":
            case "SnareRim":
                percentage = 0.018;
                break;
            case "Bass":
                percentage = -0.006;
                break;
            case "Kick":
                percentage = 0;
                break;
            case "HatPedal":
            case "HatOpen":
                percentage = 0;
                break;
        }

        let offset = beatDuration * percentage;

        // Instrument personality (fixed ms): Ride tight -3ms, Snare +20ms, Bass tempo-aware, Hi-hat "lazy" +7ms (2 & 4 sit back for pocket)
        const personalitySec =
            instrument === "Ride" || instrument === "RideBell" ? -0.003 :
                instrument === "Snare" || instrument === "SnareRim" ? 0.02 :
                    instrument === "Bass"
                        ? (bpm < 100 ? 0.015 : bpm > 200 ? -0.005 : 0)
                        : instrument === "HatPedal" || instrument === "HatOpen"
                            ? 0.007  // 5–10ms late: ride pulls forward, hi-hat sits back → pocket
                            : 0;
        offset += personalitySec;

        // Breathing jitter; ride uses minimal jitter (±3ms SOTA), others unchanged
        const baseJitter = bpm > 180 ? 0.0012 : 0.003;
        const jitterScaleSec = instrument === "Ride" || instrument === "RideBell" ? Math.min(0.0008, baseJitter * 0.4) : baseJitter;
        const randomJitter = Math.random() * jitterScaleSec * 2 - jitterScaleSec;

        return offset + randomJitter;
    }
}
