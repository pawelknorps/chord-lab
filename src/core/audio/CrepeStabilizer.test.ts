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
            hysteresisCents: 20,
            minConfidence: 0,
            stabilityThreshold: 3
        });

        // Seed initial pitch (fill history with 440)
        for (let i = 0; i < 10; i++) stabilizer.process(440, 1);
        expect(stabilizer.getLastStablePitch()).toBe(440);

        // Small change (10 cents)
        const smallChange = 440 * Math.pow(2, 10 / 1200);
        for (let i = 0; i < 10; i++) stabilizer.process(smallChange, 1);
        expect(stabilizer.getLastStablePitch()).toBe(440);

        // Large change (30 cents)
        const largeChange = 440 * Math.pow(2, 30 / 1200);

        // Process enough frames to shift the median (4 frames) 
        // and satisfy stability threshold (3 frames)
        for (let i = 0; i < 15; i++) {
            stabilizer.process(largeChange, 1);
        }

        expect(stabilizer.getLastStablePitch()).toBeCloseTo(largeChange, 1);
    });
});
