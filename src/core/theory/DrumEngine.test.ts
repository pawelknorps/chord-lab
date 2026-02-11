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

    it('should scale density with input', () => {
        const quietHits = engine.generateBar(0.1);
        const busyHits = engine.generateBar(0.9);

        // Ride skips and Snare/Kick chatter should be more frequent in busy hits
        expect(busyHits.length).toBeGreaterThan(quietHits.length);
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

    it('should provide micro-timing offsets', () => {
        const rideOffset = engine.getMicroTiming('Ride');
        const snareOffset = engine.getMicroTiming('Snare');

        // Ride should push (negative)
        expect(rideOffset).toBeLessThan(0);
        // Snare should drag (positive)
        expect(snareOffset).toBeGreaterThan(0);
    });
});
