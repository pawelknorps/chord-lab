import { describe, it, expect } from 'vitest';
import { ReactiveCompingEngine } from './ReactiveCompingEngine';

describe('ReactiveCompingEngine', () => {
  const engine = new ReactiveCompingEngine();

  describe('getTargetDensity', () => {
    it('returns sparse (0.3) when bass is Walking', () => {
      expect(engine.getTargetDensity(0.5, 'Walking')).toBe(0.3);
    });

    it('returns denser (0.7) when bass is TwoFeel', () => {
      expect(engine.getTargetDensity(0.5, 'TwoFeel')).toBe(0.7);
    });

    it('returns very sparse (0.1) when drums intensity > 0.8', () => {
      expect(engine.getTargetDensity(0.9, 'Walking')).toBe(0.1);
      expect(engine.getTargetDensity(0.85, 'TwoFeel')).toBe(0.1);
    });
  });

  describe('selectTemplate', () => {
    it('returns Red Garland (sparse) for density < 0.4', () => {
      const hits = engine.selectTemplate(0.3);
      expect(hits.length).toBe(2);
      expect(hits[0].time).toBe('0:1:2');
      expect(hits[1].isAnticipation).toBe(true);
    });

    it('returns Bill Evans (sustain) for 0.4 <= density < 0.7', () => {
      const hits = engine.selectTemplate(0.5);
      expect(hits.length).toBe(2);
      expect(hits[0].type).toBe('Pad');
      expect(hits[0].isStab).toBe(false);
    });

    it('returns Herbie (dense) for density >= 0.7', () => {
      const hits = engine.selectTemplate(0.8);
      expect(hits.length).toBe(3);
      expect(hits.some((h) => h.type === 'Push')).toBe(true);
    });
  });

  describe('getMicroTiming', () => {
    it('returns Push (negative) for anticipations', () => {
      const hit = { time: '0:3:2', duration: '8n', velocity: 0.9, type: 'Push' as const, isStab: true, isAnticipation: true };
      expect(engine.getMicroTiming(hit)).toBeLessThan(0);
    });

    it('returns Tight (small positive) for stabs', () => {
      const hit = { time: '0:1:2', duration: '16n', velocity: 0.7, type: 'Comp' as const, isStab: true };
      expect(engine.getMicroTiming(hit)).toBeGreaterThan(0);
      expect(engine.getMicroTiming(hit)).toBeLessThanOrEqual(0.01);
    });

    it('returns LayBack (larger positive) for pads', () => {
      const hit = { time: '0:0:0', duration: '2n', velocity: 0.5, type: 'Pad' as const, isStab: false };
      expect(engine.getMicroTiming(hit)).toBeGreaterThan(0);
    });
  });
});
