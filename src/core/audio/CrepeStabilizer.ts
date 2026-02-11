/**
 * CrepeStabilizer (2026): Temporal pitch smoothing for real-time estimators.
 * Implements:
 * 1. Confidence Gate: Hold last stable pitch if current confidence is low.
 * 2. Running Median: Reject octave jumps and single-frame noise spikes (window size 5).
 * 3. Hysteresis: Prevent flicker between adjacent semitones (±20 cents).
 */
export class CrepeStabilizer {
    private lastStablePitch: number = 0;
    private pitchHistory: number[] = [];
    private windowSize: number = 5;
    private minConfidence: number = 0.85;
    private hysteresisCents: number = 20;

    constructor(options?: { windowSize?: number; minConfidence?: number; hysteresisCents?: number }) {
        if (options?.windowSize) this.windowSize = options.windowSize;
        if (options?.minConfidence) this.minConfidence = options.minConfidence;
        if (options?.hysteresisCents) this.hysteresisCents = options.hysteresisCents;
    }

    /**
     * Process a raw pitch frame.
     * @returns The stabilized frequency in Hz.
     */
    process(rawPitch: number, confidence: number): number {
        // 1. Confidence Gate
        if (confidence < this.minConfidence) {
            return this.lastStablePitch;
        }

        // 2. Running Median
        this.pitchHistory.push(rawPitch);
        if (this.pitchHistory.length > this.windowSize) {
            this.pitchHistory.shift();
        }

        if (this.pitchHistory.length < 3) {
            this.lastStablePitch = rawPitch;
            return rawPitch;
        }

        const sorted = [...this.pitchHistory].sort((a, b) => a - b);
        const medianPitch = sorted[Math.floor(sorted.length / 2)];

        // 3. Hysteresis
        if (this.lastStablePitch === 0) {
            this.lastStablePitch = medianPitch;
            return medianPitch;
        }

        const centDiff = 1200 * Math.log2(medianPitch / this.lastStablePitch);
        if (Math.abs(centDiff) > this.hysteresisCents) {
            this.lastStablePitch = medianPitch;
        }

        return this.lastStablePitch;
    }

    getLastStablePitch(): number {
        return this.lastStablePitch;
    }

    reset(): void {
        this.pitchHistory = [];
        this.lastStablePitch = 0;
    }
}
