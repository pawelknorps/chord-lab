/**
 * SwiftF0 inference helpers: classification/regression → pitch (Hz).
 * Extracted for unit testing and used by SwiftF0Worker.
 */

import type { InstrumentProfile } from './instrumentProfiles';

/** SwiftF0 classifier bins 3–134; bin i ≈ 46.8 * 2^((i-3)/20) Hz. */
export const BIN_BASE = 3;
export const BIN_MAX = 134;
export const BASE_FREQ_HZ = 46.8;
/** Model input length (samples at 16 kHz). Must match ONNX model and worklet downsampling. */
export const MODEL_INPUT_SIZE = 1024;

/**
 * Compute RMS of PCM (float32, -1..1).
 */
export function computeRMS(pcm: Float32Array): number {
    let sum = 0;
    const len = pcm.length;
    for (let i = 0; i < len; i++) {
        const v = pcm[i];
        sum += v * v;
    }
    return len > 0 ? Math.sqrt(sum / len) : 0;
}

/**
 * Apply same preprocessing as worker: gain then log(1 + 10|x|).
 * Writes into out (length >= pcm.length); returns applied gain.
 */
export function preprocessPcm(
    pcm: Float32Array,
    out: Float32Array,
    targetRms: number = 0.08,
    minRmsForGain: number = 0.003,
    maxGain: number = 6
): number {
    const rms = computeRMS(pcm);
    const gain =
        rms > 0 && rms < targetRms && rms > minRmsForGain
            ? Math.min(maxGain, targetRms / rms)
            : 1;
    const len = Math.min(pcm.length, out.length);
    for (let i = 0; i < len; i++) {
        const v = gain * pcm[i];
        out[i] = Math.log(1 + 10 * (v < 0 ? -v : v));
    }
    return gain;
}

/**
 * Convert SwiftF0 classification + optional regression to frequency (Hz).
 * Uses bins BIN_BASE..BIN_MAX; peak below profile.confidenceThreshold returns pitch 0.
 */
export function classificationToPitch(
    classification: Float32Array,
    profile: InstrumentProfile,
    regression?: Float32Array
): { pitch: number; confidence: number; peakBin: number } {
    if (classification.length < 135) {
        return { pitch: 0, confidence: 0, peakBin: -1 };
    }

    let maxVal = -1;
    let peakBin = -1;
    for (let i = BIN_BASE; i <= BIN_MAX; i++) {
        if (classification[i] > maxVal) {
            maxVal = classification[i];
            peakBin = i;
        }
    }

    if (peakBin === -1 || maxVal < profile.confidenceThreshold) {
        return { pitch: 0, confidence: maxVal, peakBin: peakBin >= 0 ? peakBin : -1 };
    }

    const start = Math.max(BIN_BASE, peakBin - 4);
    const end = Math.min(BIN_MAX, peakBin + 4);
    let sumLogFreq = 0;
    let totalWeight = 0;
    for (let i = start; i <= end; i++) {
        const p = classification[i];
        if (p <= 0) continue;
        const baseFreqI = BASE_FREQ_HZ * Math.pow(2, (i - BIN_BASE) / 20);
        const offsetI = regression && i < regression.length ? regression[i] : 0;
        const fI = baseFreqI * Math.pow(2, offsetI / 1200);
        sumLogFreq += p * Math.log2(fI);
        totalWeight += p;
    }
    const preciseFreq = totalWeight > 0 ? Math.pow(2, sumLogFreq / totalWeight) : 0;
    const clamped = Math.max(profile.minHz, Math.min(profile.maxHz, preciseFreq));
    return { pitch: clamped, confidence: maxVal, peakBin };
}

/** Base frequency for bin i (no regression). */
export function binToBaseFreq(bin: number): number {
    return BASE_FREQ_HZ * Math.pow(2, (bin - BIN_BASE) / 20);
}
