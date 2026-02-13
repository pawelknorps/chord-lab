import { describe, it, expect } from 'vitest';
import {
    classificationToPitch,
    computeRMS,
    preprocessPcm,
    BIN_BASE,
    BIN_MAX,
    MODEL_INPUT_SIZE,
} from './swiftF0Inference';
import { INSTRUMENT_PROFILES } from './instrumentProfiles';

describe('SwiftF0Worker contract', () => {
    it('uses MODEL_INPUT_SIZE 1024 for preprocessing', () => {
        expect(MODEL_INPUT_SIZE).toBe(1024);
    });

    it('classificationToPitch expects classification length >= 135 (bins 3-134)', () => {
        const short = new Float32Array(50);
        short[10] = 0.9;
        const r = classificationToPitch(short, INSTRUMENT_PROFILES.general);
        expect(r.pitch).toBe(0);
        const long = new Float32Array(200);
        long[67] = 0.9;
        const r2 = classificationToPitch(long, INSTRUMENT_PROFILES.general);
        expect(r2.pitch).toBeGreaterThan(0);
    });

    it('worker preprocessing produces finite values for silent and loud input', () => {
        const silent = new Float32Array(MODEL_INPUT_SIZE);
        const out = new Float32Array(MODEL_INPUT_SIZE);
        preprocessPcm(silent, out);
        expect(computeRMS(out)).toBeGreaterThanOrEqual(0);
        for (let i = 0; i < 10; i++) {
            expect(Number.isFinite(out[i])).toBe(true);
        }
        const loud = new Float32Array(MODEL_INPUT_SIZE);
        loud.fill(0.5);
        preprocessPcm(loud, out);
        expect(Number.isFinite(out[0])).toBe(true);
    });

    it('bin range 3-134 covers A4 (440 Hz) and typical instrument range', () => {
        const general = INSTRUMENT_PROFILES.general;
        const c = new Float32Array(200);
        c[BIN_BASE] = 0.01;
        c[BIN_MAX] = 0.01;
        c[67] = 0.95;
        const r = classificationToPitch(c, general);
        expect(r.pitch).toBeGreaterThan(400);
        expect(r.pitch).toBeLessThan(500);
        expect(r.peakBin).toBe(67);
    });

    it('all instrument profiles have valid minHz, maxHz, confidenceThreshold', () => {
        for (const [id, profile] of Object.entries(INSTRUMENT_PROFILES)) {
            expect(profile.minHz).toBeGreaterThan(0);
            expect(profile.maxHz).toBeGreaterThan(profile.minHz);
            expect(profile.confidenceThreshold).toBeGreaterThanOrEqual(0);
            expect(profile.confidenceThreshold).toBeLessThanOrEqual(1);
            expect(profile.stabilityThreshold).toBeGreaterThanOrEqual(1);
            expect(profile.hysteresisCents).toBeGreaterThan(0);
        }
    });
});
