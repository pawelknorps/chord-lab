import { describe, it, expect, beforeEach } from 'vitest';
import { DrumEngine } from './DrumEngine';

describe('DrumEngine', () => {
    let engine: DrumEngine;

    beforeEach(() => {
        engine = new DrumEngine();
    });

    it('should always include hi-hat anchor on 2 and 4', () => {
        const hits = engine.generateBar(0.5);
        const hats = hits.filter(h => h.instrument === 'HatPedal');
        expect(hats.some(h => h.time === '0:1:0')).toBe(true);
        expect(hats.some(h => h.time === '0:3:0')).toBe(true);
    });

    it('should scale density with input on average', () => {
        let quietTotal = 0;
        let busyTotal = 0;
        const iterations = 20;

        for (let i = 0; i < iterations; i++) {
            quietTotal += engine.generateBar(0.1).length;
            busyTotal += engine.generateBar(0.9).length;
        }

        // Busy hits should have more hits on average
        expect(busyTotal / iterations).toBeGreaterThan(quietTotal / iterations);
    });

    it('should simplify when piano is very busy (Collaborative Listening)', () => {
        let normalTotal = 0;
        let listenerTotal = 0;

        for (let i = 0; i < 50; i++) {
            normalTotal += engine.generateBar(0.5, 0.5).length;
            listenerTotal += engine.generateBar(0.5, 0.9).length;
        }

        // Drummer should play less on average when piano is over 0.8 density
        expect(listenerTotal).toBeLessThan(normalTotal);
    });

    it('should provide tempo-scaled micro-timing offsets', () => {
        const bpm = 120;
        const rideOffset = engine.getMicroTiming(bpm, 'Ride');
        const snareOffset = engine.getMicroTiming(bpm, 'Snare');

        // Ride should push (negative)
        expect(rideOffset).toBeLessThan(0);
        // Snare should drag (positive)
        expect(snareOffset).toBeGreaterThan(0);
    });

    it('should scale micro-timing with BPM (shorter offsets at higher BPM)', () => {
        const ride60 = engine.getMicroTiming(60, 'Ride');
        const ride240 = engine.getMicroTiming(240, 'Ride');
        // At 60 BPM, beat = 1s; -3.5% ≈ -35ms. At 240 BPM, beat = 0.25s; -3.5% ≈ -8.75ms.
        expect(Math.abs(ride60)).toBeGreaterThan(Math.abs(ride240));
    });
});
