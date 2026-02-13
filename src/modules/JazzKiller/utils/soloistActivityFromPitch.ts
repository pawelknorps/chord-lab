/**
 * Phase 19: Soloist-Responsive Playback.
 * Derives a 0–1 "soloist activity" from pitch + onset (rhythm) over a rolling window.
 * Ignores RMS; relies on auto gain. Focus on rhythms: onset count + pitch duty cycle.
 * Used to steer band density (more space when soloist plays, more backing when soloist rests).
 */

export interface PitchSample {
    frequency: number;
    clarity: number;
    rms: number;
    onset: number;
}

/** Shorter window = snappier reaction to soloist rhythms. */
const DEFAULT_WINDOW_MS = 1200;
const DEFAULT_SAMPLE_INTERVAL_MS = 100;
const PITCH_CONFIDENCE_THRESHOLD = 0.7;
const MAX_SAMPLES = 20;
/** Onsets in window above this map to 1.0 rhythm component (~4 attacks in ~1.2 s = busy rhythm). */
const ONSET_CAP = 4;

/**
 * Rolling soloist intensity over a short window (~1.2 s): focus on rhythms via onset count + pitch duty cycle.
 * Shorter window makes the band react more to soloist rhythms. No RMS; auto gain assumed.
 * When getLatestPitch returns null (no mic / store not ready), treat as 0.
 */
export function createSoloistActivitySampler(options?: {
    windowMs?: number;
    sampleIntervalMs?: number;
    confidenceThreshold?: number;
    onsetCap?: number;
}) {
    const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
    const sampleIntervalMs = options?.sampleIntervalMs ?? DEFAULT_SAMPLE_INTERVAL_MS;
    const confidenceThreshold = options?.confidenceThreshold ?? PITCH_CONFIDENCE_THRESHOLD;
    const onsetCap = options?.onsetCap ?? ONSET_CAP;
    const maxSamples = Math.min(MAX_SAMPLES, Math.ceil(windowMs / sampleIntervalMs));

    /** Per slot: [hasPitch, hadOnset]. */
    const pitchBuffer: boolean[] = [];
    const onsetBuffer: boolean[] = [];
    let ptr = 0;

    /**
     * Push one sample: pitch presence and onset (attack). Call at sampleIntervalMs.
     */
    function push(reading: PitchSample | null): void {
        const hasPitch =
            reading != null &&
            reading.frequency > 0 &&
            reading.clarity >= confidenceThreshold;
        const hadOnset = reading != null && reading.onset > 0;
        if (pitchBuffer.length < maxSamples) {
            pitchBuffer.push(hasPitch);
            onsetBuffer.push(hadOnset);
        } else {
            pitchBuffer[ptr] = hasPitch;
            onsetBuffer[ptr] = hadOnset;
            ptr = (ptr + 1) % maxSamples;
        }
    }

    /**
     * Get current soloist activity 0–1: max(pitch duty cycle, rhythm from onset count).
     */
    function get(): number {
        if (pitchBuffer.length === 0) return 0;
        const pitchCount = pitchBuffer.filter(Boolean).length;
        const pitchDuty = pitchCount / pitchBuffer.length;
        const onsetCount = onsetBuffer.filter(Boolean).length;
        const rhythmComponent = Math.min(1, onsetCount / onsetCap);
        return Math.max(pitchDuty, rhythmComponent);
    }

    return { push, get };
}
