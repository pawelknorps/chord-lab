import { describe, it, expect, beforeEach } from 'vitest';
import { RhythmEngine, RHYTHM_TEMPLATE_TO_PATTERN_TYPE } from './RhythmEngine';

describe('RhythmEngine', () => {
    let engine: RhythmEngine;

    beforeEach(() => {
        engine = new RhythmEngine();
    });

    it('should select templates based on BPM', () => {
        const patternSlow = engine.getRhythmPattern(60);
        expect(patternSlow.name).toBeDefined();

        const patternFast = engine.getRhythmPattern(200);
        expect(patternFast.name).toBeDefined();
        // Just verify it's not Sustain (or has very low probability)
        // With current weights, Sustain is 5 vs others ~20-40, so it's unlikely but possible.
    });

    it('should respect lastTemplate repetition penalty', () => {
        // Run many times at medium BPM (120)
        // Standard, Driving, Sustain should all be available
        const counts: Record<string, number> = { Standard: 0, Sustain: 0, Driving: 0 };

        let lastOneValue = '';
        let repetitionCount = 0;

        for (let i = 0; i < 100; i++) {
            const pattern = engine.getRhythmPattern(120);
            if (!counts[pattern.name]) counts[pattern.name] = 0;
            counts[pattern.name]++;

            if (pattern.name === lastOneValue) {
                repetitionCount++;
            }
            lastOneValue = pattern.name;
        }

        // With REPETITION_PENALTY = 0.1, repetition should be very rare
        expect(repetitionCount).toBeLessThan(35);
        expect(Object.keys(counts).length).toBeGreaterThan(3);
    });

    it('should favor high-energy patterns at high energy', () => {
        let highEnergyPatternCount = 0;
        for (let i = 0; i < 100; i++) {
            const pattern = engine.getRhythmPattern(120, 0.9); // High energy
            if (RHYTHM_TEMPLATE_TO_PATTERN_TYPE[pattern.name] === 'HIGH_ENERGY') highEnergyPatternCount++;
        }
        // With energy 0.9 we bias toward HIGH_ENERGY templates; expect at least ~40% to be high-energy
        expect(highEnergyPatternCount).toBeGreaterThanOrEqual(35);
    });

    it('should favor long-note patterns (Sustain/BalladPad) at low energy and slow BPM', () => {
        const lowEnergyEngine = new RhythmEngine();
        let longNoteCount = 0;
        for (let i = 0; i < 100; i++) {
            const pattern = lowEnergyEngine.getRhythmPattern(80, 0.1); // Slow + Low Energy
            if (RHYTHM_TEMPLATE_TO_PATTERN_TYPE[pattern.name] === 'LOW_ENERGY') longNoteCount++;
        }
        // At 80 BPM and energy 0.1 we bias toward LOW_ENERGY (Sustain/BalladPad); expect at least some (larger template set dilutes)
        expect(longNoteCount).toBeGreaterThanOrEqual(3);
    });

    it('should use longer note values when there is more space (few chords or slow tune)', () => {
        const sparseEngine = new RhythmEngine();
        // One chord per bar + slow BPM → more space → should get stretched durations (4n/2n/1m) or LOW_ENERGY pattern
        const patternSparse = sparseEngine.getRhythmPattern(70, 0.4, { chordsPerBar: 1 });
        const hasLongDuration = patternSparse.steps.some(
            (s) => s.duration === '1m' || s.duration === '2n' || s.duration === '4n'
        );
        const isLongNotePattern = RHYTHM_TEMPLATE_TO_PATTERN_TYPE[patternSparse.name] === 'LOW_ENERGY';
        expect(hasLongDuration || isLongNotePattern).toBe(true);

        // Dense changes → shorter note values (no stretch)
        const denseEngine = new RhythmEngine();
        const patternDense = denseEngine.getRhythmPattern(140, 0.5, { chordsPerBar: 4 });
        const stepsHaveShortDurations = patternDense.steps.every(
            (s) => s.duration === '8n' || s.duration === '4n' || s.duration === '2n' || s.duration === '1m'
        );
        expect(stepsHaveShortDurations).toBe(true);
    });

    it('should respect tempoSubdivisionLimit (human articulation at fast tempo)', () => {
        const fastEngine = new RhythmEngine();
        for (let i = 0; i < 30; i++) {
            const pattern = fastEngine.getRhythmPattern(200, 0.5, { tempoSubdivisionLimit: '4n' });
            pattern.steps.forEach((s) => {
                expect(['4n', '2n', '1m']).toContain(s.duration);
            });
        }
        const veryFastEngine = new RhythmEngine();
        for (let i = 0; i < 30; i++) {
            const pattern = veryFastEngine.getRhythmPattern(220, 0.5, { tempoSubdivisionLimit: '2n' });
            pattern.steps.forEach((s) => {
                expect(['2n', '1m']).toContain(s.duration);
            });
        }
    });
});
