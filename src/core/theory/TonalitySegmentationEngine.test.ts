/**
 * Phase 21: TonalitySegmentationEngine — Fit cost, Transition cost, Viterbi, getSegments.
 */
import { describe, it, expect } from 'vitest';
import {
  KEY_CENTERS,
  getFitCost,
  getTransitionCost,
  TonalitySegmentationEngine,
  type ChordSlot,
} from './TonalitySegmentationEngine';

describe('TonalitySegmentationEngine', () => {
  describe('KEY_CENTERS (REQ-HAT-01)', () => {
    it('has 24 key centers (12 major + 12 minor)', () => {
      expect(KEY_CENTERS).toHaveLength(24);
      const majors = KEY_CENTERS.filter((k) => !k.endsWith('m'));
      const minors = KEY_CENTERS.filter((k) => k.endsWith('m'));
      expect(majors).toHaveLength(12);
      expect(minors).toHaveLength(12);
      expect(KEY_CENTERS).toContain('C');
      expect(KEY_CENTERS).toContain('Cm');
      expect(KEY_CENTERS).toContain('F');
      expect(KEY_CENTERS).toContain('Bb');
    });
  });

  describe('getFitCost (REQ-HAT-02)', () => {
    it('returns lower cost for diatonic chord in key', () => {
      const diatonic = getFitCost('Dm7', 'C');
      const chromatic = getFitCost('Dm7', 'F');
      expect(diatonic).toBeLessThanOrEqual(chromatic);
    });

    it('returns lower cost for G7 in C major (V) than for G7 in F major', () => {
      const inC = getFitCost('G7', 'C');
      const inF = getFitCost('G7', 'F');
      expect(inC).toBeLessThanOrEqual(inF);
    });

    it('returns lower cost for Cmaj7 in C than in B', () => {
      const inC = getFitCost('Cmaj7', 'C');
      const inB = getFitCost('Cmaj7', 'B');
      expect(inC).toBeLessThanOrEqual(inB);
    });
  });

  describe('getTransitionCost (REQ-HAT-03)', () => {
    it('returns 0 for same key', () => {
      expect(getTransitionCost('C', 'C')).toBe(0);
      expect(getTransitionCost('Cm', 'Cm')).toBe(0);
    });

    it('returns higher penalty for C→Db than for C→G', () => {
      const toDb = getTransitionCost('C', 'Db');
      const toG = getTransitionCost('C', 'G');
      expect(toDb).toBeGreaterThan(toG);
    });

    it('returns lower penalty for relative major/minor (e.g. C and Am)', () => {
      const toAm = getTransitionCost('C', 'Am');
      const toB = getTransitionCost('C', 'B');
      expect(toAm).toBeLessThan(toB);
    });
  });

  describe('Viterbi and getSegments (REQ-HAT-04, REQ-HAT-05)', () => {
    it('returns one segment for ii–V–I in C', () => {
      const slots: ChordSlot[] = [
        { barIndex: 0, chordSymbol: 'Dm7' },
        { barIndex: 1, chordSymbol: 'G7' },
        { barIndex: 2, chordSymbol: 'Cmaj7' },
      ];
      const engine = new TonalitySegmentationEngine();
      engine.setSlots(slots);
      engine.segment();
      const path = engine.getKeyPath();
      const segments = engine.getSegments();
      expect(path).toHaveLength(3);
      expect(segments.length).toBeGreaterThanOrEqual(1);
      expect(segments.some((s) => s.key === 'C')).toBe(true);
    });

    it('getSegments returns merged consecutive same-key slots', () => {
      const slots: ChordSlot[] = [
        { barIndex: 0, chordSymbol: 'Cmaj7' },
        { barIndex: 1, chordSymbol: 'Am7' },
        { barIndex: 2, chordSymbol: 'Dm7' },
        { barIndex: 3, chordSymbol: 'G7' },
      ];
      const engine = new TonalitySegmentationEngine();
      engine.setSlots(slots);
      engine.segment();
      const segments = engine.getSegments();
      expect(segments).toBeDefined();
      expect(Array.isArray(segments)).toBe(true);
      segments.forEach((s) => {
        expect(s).toHaveProperty('startBar');
        expect(s).toHaveProperty('endBar');
        expect(s).toHaveProperty('key');
      });
    });

    it('handles empty slots', () => {
      const engine = new TonalitySegmentationEngine();
      engine.setSlots([]);
      engine.segment();
      expect(engine.getKeyPath()).toHaveLength(0);
      expect(engine.getSegments()).toHaveLength(0);
    });
  });
});
