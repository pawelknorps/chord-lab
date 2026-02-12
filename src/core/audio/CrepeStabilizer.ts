/**
 * CrepeStabilizer (2026): Advanced temporal pitch smoothing for jazz instruments.
 * Implements:
 * 1. Confidence Gate: High threshold (0.92) to filter harmonic ghosts.
 * 2. Running Median: Reject octave jumps and noise spikes (window size 7).
 * 3. Schmitt Trigger (Hysteresis): Prevent semitone flicker (35 cents).
 * 4. Atonal Gate: Requires 3 consecutive frames of stable pitch before updating.
 */
/** In-place insertion sort for first n elements; no allocation. */
function insertionSort(arr: number[], n: number): void {
    for (let i = 1; i < n; i++) {
        const v = arr[i];
        let j = i;
        while (j > 0 && arr[j - 1] > v) {
            arr[j] = arr[j - 1];
            j--;
        }
        arr[j] = v;
    }
}

import { InstrumentProfile, INSTRUMENT_PROFILES } from './instrumentProfiles';

export class CrepeStabilizer {
    private lastStablePitch: number = 0;
    private currentNote: number = -1; // MIDI Note
    private lastRms: number = 0;
    private holdTimeMs: number = 0;

    // 2026 Jazz-Optimized Parameters
    private windowSize: number = 7;
    private minConfidence: number = 0.92;
    private profile: InstrumentProfile = INSTRUMENT_PROFILES.auto;

    private stableFrameCount: number = 0;
    private pendingPitch: number = 0;

    private pitchHistory: number[];
    private pitchHistoryCount: number = 0;
    private pitchHistoryPtr: number = 0;
    private sortedCopy: number[];

    constructor(options?: {
        windowSize?: number;
        minConfidence?: number;
        profileId?: string;
    }) {
        if (options?.windowSize !== undefined) this.windowSize = options.windowSize;
        if (options?.minConfidence !== undefined) this.minConfidence = options.minConfidence;
        if (options?.profileId) {
            this.profile = INSTRUMENT_PROFILES[options.profileId] || INSTRUMENT_PROFILES.auto;
        }
        this.pitchHistory = new Array(this.windowSize);
        this.sortedCopy = new Array(this.windowSize);
    }

    setProfile(profileId: string): void {
        this.profile = INSTRUMENT_PROFILES[profileId] || INSTRUMENT_PROFILES.auto;
    }

    /**
     * Process a raw pitch frame.
     * @param rawPitch Frequency in Hz
     * @param confidence Model confidence (0-1)
     * @param rms Current frame loudness
     * @returns The stabilized frequency in Hz.
     */
    process(rawPitch: number, confidence: number, rms: number = 0): number {
        // 1. Atonal/Transient Gating (RMS + Confidence)
        // If confidence is low but volume is rising sharply, it's likely a "chiff" or pluck.
        // We bridge this noise gap (approx 20ms/3 frames at 60fps) by holding the previous note.
        const rmsRising = rms > this.lastRms * 1.5;
        this.lastRms = rms;

        if (confidence < this.minConfidence) {
            if (rmsRising && this.lastStablePitch > 0 && this.holdTimeMs < 40) {
                this.holdTimeMs += 16; // approx ms per frame at 60fps
                return this.lastStablePitch;
            }
            this.stableFrameCount = 0;
            this.holdTimeMs = 0;
            return this.lastStablePitch;
        }

        this.holdTimeMs = 0;

        // 2. Running Median (circular buffer + in-place sort)
        const hist = this.pitchHistory;
        const cap = this.windowSize;
        let count = this.pitchHistoryCount;
        let ptr = this.pitchHistoryPtr;
        if (count < cap) {
            hist[count] = rawPitch;
            count++;
            this.pitchHistoryCount = count;
        } else {
            hist[ptr] = rawPitch;
            ptr = (ptr + 1) % cap;
            this.pitchHistoryPtr = ptr;
        }

        if (count < 3) {
            this.lastStablePitch = rawPitch;
            return rawPitch;
        }

        const sorted = this.sortedCopy;
        const n = count;
        if (count === cap) {
            for (let i = 0; i < n; i++) sorted[i] = hist[(ptr + i) % cap];
        } else {
            for (let i = 0; i < n; i++) sorted[i] = hist[i];
        }
        insertionSort(sorted, n);
        const medianPitch = sorted[Math.floor(n / 2)];

        // 3. Instrument-Aware Schmitt Trigger (Hysteresis)
        if (this.lastStablePitch === 0) {
            this.lastStablePitch = medianPitch;
            this.currentNote = this.hzToMidi(medianPitch);
            return medianPitch;
        }

        const newMidi = 12 * Math.log2(medianPitch / 440) + 69;
        const currentMidi = 12 * Math.log2(this.lastStablePitch / 440) + 69;

        const distance = Math.abs(newMidi - currentMidi);

        // Use profile-specific hysteresis
        if (distance > (this.profile.hysteresisCents / 100)) {
            // 4. Note Stability Timer (Atonal Gate using Stability Gate)
            if (Math.abs(12 * Math.log2(medianPitch / this.pendingPitch)) < 0.1) {
                this.stableFrameCount++;
            } else {
                this.stableFrameCount = 1;
                this.pendingPitch = medianPitch;
            }

            if (this.stableFrameCount >= this.profile.stabilityThreshold) {
                this.lastStablePitch = medianPitch;
                this.currentNote = Math.round(newMidi);
                this.stableFrameCount = 0;
            }
        } else {
            this.stableFrameCount = 0;
        }

        return this.lastStablePitch;
    }

    private hzToMidi(hz: number): number {
        return 12 * Math.log2(hz / 440) + 69;
    }

    getLastStablePitch(): number {
        return this.lastStablePitch;
    }

    getCurrentNote(): number {
        return this.currentNote;
    }

    reset(): void {
        this.pitchHistoryCount = 0;
        this.pitchHistoryPtr = 0;
        this.lastStablePitch = 0;
        this.currentNote = -1;
        this.stableFrameCount = 0;
        this.lastRms = 0;
        this.holdTimeMs = 0;
    }

    static interpolatePitch(bins: number[], peakIndex: number, frequencies: number[]): number {
        const start = Math.max(0, peakIndex - 4);
        const end = Math.min(bins.length - 1, peakIndex + 4);

        let numerator = 0;
        let denominator = 0;

        for (let i = start; i <= end; i++) {
            const weight = bins[i];
            numerator += weight * frequencies[i];
            denominator += weight;
        }

        return denominator === 0 ? 0 : numerator / denominator;
    }
}

