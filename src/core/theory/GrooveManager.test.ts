import { describe, it, expect } from 'vitest';
import { GrooveManager } from './GrooveManager';

describe('GrooveManager', () => {
    const groove = new GrooveManager();

    it('Ride pushes (negative offset)', () => {
        const offset = groove.getMicroTiming(120, 'Ride');
        expect(offset).toBeLessThan(0);
    });

    it('Snare drags (positive offset)', () => {
        const offset = groove.getMicroTiming(120, 'Snare');
        expect(offset).toBeGreaterThan(0);
    });

    it('Bass is slight push (negative, anchor)', () => {
        const offset = groove.getMicroTiming(120, 'Bass');
        expect(offset).toBeLessThan(0);
        expect(offset).toBeGreaterThan(-0.02);
    });

    it('Kick is on the grid (near zero)', () => {
        const offset = groove.getMicroTiming(120, 'Kick');
        expect(Math.abs(offset)).toBeLessThan(0.01);
    });

    it('offsets scale with BPM (120 BPM: ride push)', () => {
        const rideOffset = groove.getMicroTiming(120, 'Ride');
        expect(rideOffset).toBeLessThan(0);
        expect(Math.abs(rideOffset)).toBeLessThan(0.03);
    });

    it('getSwingRatio is JJazzLab-aligned: 120 BPM → 2/3 (JJ-03)', () => {
        expect(groove.getSwingRatio(120)).toBeGreaterThanOrEqual(0.66);
        expect(groove.getSwingRatio(120)).toBeLessThanOrEqual(0.67);
    });

    it('getSwingRatio is tempo-dependent (slower = more swing, higher fraction)', () => {
        const r50 = groove.getSwingRatio(50);
        const r120 = groove.getSwingRatio(120);
        const r190 = groove.getSwingRatio(190);
        const r240 = groove.getSwingRatio(240);
        expect(r50).toBeGreaterThan(r120);
        expect(r120).toBeGreaterThan(r190);
        expect(r190).toBeGreaterThan(r240);
        expect(groove.getSwingRatio(20)).toBeLessThanOrEqual(0.75);
        expect(groove.getSwingRatio(400)).toBeGreaterThanOrEqual(0.5);
    });

    it('getHumanizationJitter returns small Gaussian offset in seconds', () => {
        const j = groove.getHumanizationJitter(3);
        expect(typeof j).toBe('number');
        expect(Math.abs(j)).toBeLessThan(0.02); // 3σ ≈ 9ms, so sample usually < 20ms
    });

    it('getOffBeatOffsetInBeat places "and" by swing ratio', () => {
        const bpm = 120;
        const beatDuration = 60 / bpm;
        const off = groove.getOffBeatOffsetInBeat(bpm);
        const ratio = groove.getSwingRatio(bpm);
        expect(off).toBeCloseTo(beatDuration * ratio, 5);
    });
});
