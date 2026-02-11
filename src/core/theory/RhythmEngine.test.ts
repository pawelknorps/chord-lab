import { describe, it, expect, beforeEach } from 'vitest';
import { RhythmEngine } from './RhythmEngine';

describe('RhythmEngine', () => {
    let engine: RhythmEngine;

    beforeEach(() => {
        engine = new RhythmEngine();
    });

    it('should select templates based on BPM', () => {
        const patternSlow = engine.getRhythmPattern(60);
        // At 60 bpm, Sustain is heavily weighted but others are possible.
        expect(['Sustain', 'Standard', 'Driving']).toContain(patternSlow.name);

        const patternFast = engine.getRhythmPattern(200);
        expect(['Standard', 'Driving']).toContain(patternFast.name);
    });

    it('should respect lastTemplate repetition penalty', () => {
        // Run many times at medium BPM (120)
        // Standard, Driving, Sustain should all be available
        const counts: Record<string, number> = { Standard: 0, Sustain: 0, Driving: 0 };

        let lastOneValue = '';
        let repetitionCount = 0;

        for (let i = 0; i < 100; i++) {
            const pattern = engine.getRhythmPattern(120);
            counts[pattern.name]++;

            if (pattern.name === lastOneValue) {
                repetitionCount++;
            }
            lastOneValue = pattern.name;
        }

        // With REPETITION_PENALTY = 0.1, repetition should be very rare
        // (even if random, 1/3 * 0.1 probability)
        expect(repetitionCount).toBeLessThan(25); // Pure random would be ~33
        expect(counts.Standard).toBeGreaterThan(0);
        expect(counts.Sustain).toBeGreaterThan(0);
        expect(counts.Driving).toBeGreaterThan(0);
    });

    it('should favor Driving at high energy', () => {
        let drivingCount = 0;
        for (let i = 0; i < 100; i++) {
            const pattern = engine.getRhythmPattern(120, 0.9); // High energy
            if (pattern.name === 'Driving') drivingCount++;
        }

        let lowEnergyDrivingCount = 0;
        const lowEngine = new RhythmEngine();
        for (let i = 0; i < 100; i++) {
            const pattern = lowEngine.getRhythmPattern(120, 0.1); // Low energy
            if (pattern.name === 'Driving') lowEnergyDrivingCount++;
        }

        expect(drivingCount).toBeGreaterThan(lowEnergyDrivingCount);
    });

    it('should favor Sustain at low energy and slow BPM', () => {
        let sustainCount = 0;
        for (let i = 0; i < 100; i++) {
            const pattern = engine.getRhythmPattern(80, 0.1); // Slow + Low Energy
            if (pattern.name === 'Sustain') sustainCount++;
        }
        expect(sustainCount).toBeGreaterThan(50);
    });
});
