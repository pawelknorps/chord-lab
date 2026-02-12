/**
 * Phase 19: Soloist-Responsive Playback.
 * Derives a 0–1 "soloist activity" from pitch/onset over a rolling window.
 * High when user is playing more/faster; low when silent or sparse.
 * Used to steer band density (more space when soloist plays, more backing when soloist rests).
 */

export interface PitchSample {
    frequency: number;
    clarity: number;
    rms: number;
    onset: number;
}

const DEFAULT_WINDOW_MS = 1600;
const DEFAULT_SAMPLE_INTERVAL_MS = 100;
const PITCH_CONFIDENCE_THRESHOLD = 0.8;
const MAX_SAMPLES = 32;

/**
 * Rolling "has pitch" duty cycle over the last ~1–2 s.
 * Returns fraction of samples where frequency > 0 && clarity >= threshold.
 * When getLatestPitch returns null (no mic / store not ready), treat as 0.
 */
export function createSoloistActivitySampler(options?: {
    windowMs?: number;
    sampleIntervalMs?: number;
    confidenceThreshold?: number;
}) {
    const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
    const sampleIntervalMs = options?.sampleIntervalMs ?? DEFAULT_SAMPLE_INTERVAL_MS;
    const confidenceThreshold = options?.confidenceThreshold ?? PITCH_CONFIDENCE_THRESHOLD;
    const maxSamples = Math.min(MAX_SAMPLES, Math.ceil(windowMs / sampleIntervalMs));

    const buffer: boolean[] = [];
    let ptr = 0;

    /**
     * Push one sample: true if "has pitch" (frequency > 0 && clarity >= threshold).
     * Call this at sampleIntervalMs (e.g. from setInterval in useSoloistActivity).
     */
    function push(reading: PitchSample | null): void {
        const hasPitch =
            reading != null &&
            reading.frequency > 0 &&
            reading.clarity >= confidenceThreshold;
        if (buffer.length < maxSamples) {
            buffer.push(hasPitch);
        } else {
            buffer[ptr] = hasPitch;
            ptr = (ptr + 1) % maxSamples;
        }
    }

    /**
     * Get current soloist activity 0–1 (duty cycle of "has pitch" over the window).
     */
    function get(): number {
        if (buffer.length === 0) return 0;
        const count = buffer.filter(Boolean).length;
        return count / buffer.length;
    }

    return { push, get };
}
