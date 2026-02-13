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

/** 'full' = median + hysteresis + stability timer; 'light' = confidence gate only (no median/hysteresis). */
export type CrepeStabilizerMode = 'full' | 'light';

export class CrepeStabilizer {
    private lastStablePitch: number = 0;
    private currentNote: number = -1; // MIDI Note
    private holdTimeMs: number = 0;

    private windowSize: number = 7;
    private minConfidence: number = 0.92;
    private profile: InstrumentProfile = INSTRUMENT_PROFILES.general;
    private mode: CrepeStabilizerMode = 'full';

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
        /** 'light' = confidence gate only (no median/hysteresis); lower CPU. */
        mode?: CrepeStabilizerMode;
    }) {
        if (options?.windowSize !== undefined) this.windowSize = options.windowSize;
        if (options?.minConfidence !== undefined) this.minConfidence = options.minConfidence;
        if (options?.profileId) {
            this.profile = INSTRUMENT_PROFILES[options.profileId] || INSTRUMENT_PROFILES.general;
            if (this.profile.windowSize) this.windowSize = this.profile.windowSize;
            if (this.profile.confidenceThreshold !== undefined) {
                this.minConfidence = this.profile.confidenceThreshold;
            }
        }
        if (options?.mode) this.mode = options.mode;

        // REQ-SF0-P02: Align buffer size with effective window size
        this.pitchHistory = new Array(this.windowSize);
        this.sortedCopy = new Array(this.windowSize);
    }

    setProfile(profileId: string): void {
        const newProfile = INSTRUMENT_PROFILES[profileId] || INSTRUMENT_PROFILES.general;
        if (newProfile.id === this.profile.id) return;

        this.profile = newProfile;
        if (this.profile.confidenceThreshold !== undefined) {
            this.minConfidence = this.profile.confidenceThreshold;
        }

        // REQ-SF0-P02: If window size changed, reset buffers
        const newWindow = this.profile.windowSize ?? 7;
        if (newWindow !== this.windowSize) {
            this.windowSize = newWindow;
            this.pitchHistoryCount = 0;
            this.pitchHistoryPtr = 0;
            this.pitchHistory = new Array(this.windowSize);
            this.sortedCopy = new Array(this.windowSize);
        }
    }

    /**
     * Process a raw pitch frame.
     * @param rawPitch Frequency in Hz
     * @param confidence Model confidence (0-1)
     * @param rms Current frame loudness
     * @returns The stabilized frequency in Hz.
     */
    process(rawPitch: number, confidence: number, _rms: number = 0): number {
        if (confidence < this.minConfidence) {
            // Hold last confirmed pitch for a short window when confidence dips (e.g. onset/breath)
            const holdWindowMs = 72;
            if (this.lastStablePitch > 0 && this.holdTimeMs < holdWindowMs) {
                this.holdTimeMs += 16;
                return this.lastStablePitch;
            }
            this.stableFrameCount = 0;
            this.holdTimeMs = 0;
            return this.lastStablePitch;
        }

        this.holdTimeMs = 0;

        if (this.mode === 'light') {
            this.lastStablePitch = rawPitch;
            return rawPitch;
        }

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

        const effectiveWindow = this.profile.windowSize ?? this.windowSize;
        const n = Math.min(count, effectiveWindow);
        if (n < 2) {
            this.lastStablePitch = rawPitch;
            return rawPitch;
        }

        const sorted = this.sortedCopy;
        if (count === cap) {
            for (let i = 0; i < n; i++) sorted[i] = hist[(ptr + cap - n + i) % cap];
        } else {
            for (let i = 0; i < n; i++) sorted[i] = hist[count - n + i];
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

