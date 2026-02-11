import { describe, it, expect } from 'vitest';
import { CrepeStabilizer } from './CrepeStabilizer';

describe('CrepeStabilizer', () => {
    it('should hold last stable pitch on low confidence', () => {
        const stabilizer = new CrepeStabilizer({ minConfidence: 0.8 });

        // Initial good frame
        expect(stabilizer.process(440, 0.9)).toBe(440);

        // Low confidence frame should return 440
        expect(stabilizer.process(880, 0.5)).toBe(440);
    });

    it('should use median to reject outliers', () => {
        const stabilizer = new CrepeStabilizer({ windowSize: 5, minConfidence: 0 });

        stabilizer.process(100, 1);
        stabilizer.process(100, 1);
        stabilizer.process(100, 1);

        // Outlier (octave jump)
        stabilizer.process(200, 1);

        // Median of [100, 100, 100, 200] is still 100
        expect(stabilizer.process(100, 1)).toBe(100);
    });

    it('should only update when crossing hysteresis threshold', () => {
        const stabilizer = new CrepeStabilizer({ hysteresisCents: 20, minConfidence: 0 });

        stabilizer.process(440, 1);
        stabilizer.process(440, 1);
        stabilizer.process(440, 1);

        // Small change (10 cents)
        const smallChange = 440 * Math.pow(2, 10 / 1200);
        expect(stabilizer.process(smallChange, 1)).toBe(440);

        // Large change (30 cents) - call enough times to shift the median
        const largeChange = 440 * Math.pow(2, 30 / 1200);
        stabilizer.process(largeChange, 1);
        stabilizer.process(largeChange, 1);
        expect(stabilizer.process(largeChange, 1)).toBeCloseTo(largeChange, 1);
    });
});
