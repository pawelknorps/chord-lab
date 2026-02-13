import { describe, it, expect } from 'vitest';
import { CrepeStabilizer } from './CrepeStabilizer';

describe('CrepeStabilizer', () => {
    it('should hold last stable pitch on low confidence', () => {
        const stabilizer = new CrepeStabilizer({
            minConfidence: 0.8,
            stabilityThreshold: 1
        });

        // Initial good frame
        expect(stabilizer.process(440, 0.9)).toBe(440);

        // Low confidence frame should return 440
        expect(stabilizer.process(880, 0.5)).toBe(440);
    });

    it('should use median to reject outliers', () => {
        const stabilizer = new CrepeStabilizer({
            windowSize: 5,
            minConfidence: 0,
            stabilityThreshold: 1
        });

        stabilizer.process(100, 1);
        stabilizer.process(100, 1);
        stabilizer.process(100, 1);

        // Outlier (octave jump)
        stabilizer.process(200, 1);

        // Median of [100, 100, 100, 200] is still 100
        expect(stabilizer.process(100, 1)).toBe(100);
    });

    it('should only update when crossing hysteresis threshold', () => {
        const stabilizer = new CrepeStabilizer({
            profileId: 'trumpet',
            minConfidence: 0
        });

        // Seed initial pitch (fill history with 440)
        for (let i = 0; i < 10; i++) stabilizer.process(440, 1);
        expect(stabilizer.getLastStablePitch()).toBe(440);

        // Small change (10 cents)
        const smallChange = 440 * Math.pow(2, 10 / 1200);
        for (let i = 0; i < 10; i++) stabilizer.process(smallChange, 1);
        expect(stabilizer.getLastStablePitch()).toBe(440);

        // Large change (40 cents) — trumpet profile hysteresis is 35 cents, so this crosses
        const largeChange = 440 * Math.pow(2, 40 / 1200);

        for (let i = 0; i < 15; i++) {
            stabilizer.process(largeChange, 1);
        }

        expect(stabilizer.getLastStablePitch()).toBeCloseTo(largeChange, 1);
    });

    it('light mode: confidence gate only, no median/hysteresis', () => {
        const stabilizer = new CrepeStabilizer({ minConfidence: 0.9, mode: 'light' });

        expect(stabilizer.process(440, 0.95)).toBe(440);
        expect(stabilizer.process(880, 0.5)).toBe(440);
        expect(stabilizer.process(880, 0.95)).toBe(880);
    });

    it('holds last pitch on RMS rise when confidence dips (onset hold)', () => {
        const stabilizer = new CrepeStabilizer({
            minConfidence: 0.8,
            stabilityThreshold: 1,
        });
        expect(stabilizer.process(440, 0.9)).toBe(440);
        expect(stabilizer.process(440, 0.5)).toBe(440);
    });

    it('general profile uses stabilityThreshold 5 after enough median frames', () => {
        const stabilizer = new CrepeStabilizer({
            profileId: 'general',
            minConfidence: 0,
            windowSize: 7,
        });
        const newPitch = 440 * Math.pow(2, 60 / 1200);
        for (let i = 0; i < 10; i++) stabilizer.process(440, 1);
        expect(stabilizer.getLastStablePitch()).toBe(440);
        for (let i = 0; i < 10; i++) stabilizer.process(newPitch, 1);
        expect(stabilizer.getLastStablePitch()).toBeCloseTo(newPitch, 0);
    });

    it('light mode updates immediately when confidence returns', () => {
        const stabilizer = new CrepeStabilizer({
            minConfidence: 0.8,
            stabilityThreshold: 1,
            mode: 'light',
        });
        stabilizer.process(440, 0.9);
        expect(stabilizer.getLastStablePitch()).toBe(440);
        stabilizer.process(500, 0.5);
        stabilizer.process(500, 0.5);
        expect(stabilizer.getLastStablePitch()).toBe(440);
        stabilizer.process(500, 0.9);
        expect(stabilizer.getLastStablePitch()).toBe(500);
    });
});
