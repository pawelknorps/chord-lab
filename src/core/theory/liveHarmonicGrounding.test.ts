/**
 * Phase 21 Wave 5: Live Harmonic Grounding — getLiveOverrides, Conflict Resolver, Pedal Detection.
 */
import { describe, it, expect } from 'vitest';
import {
  getLiveOverrides,
  PitchBufferEntry,
  MIN_SAMPLES,
  PEDAL_BASS_HZ,
} from './liveHarmonicGrounding';

/** Frequency for a given pitch class (C4 = 60, so PC 0 at 261.63 Hz approx). */
function pcToFreq(pc: number, octave: number = 4): number {
  const midi = (octave + 1) * 12 + pc;
  return 440 * 2 ** ((midi - 69) / 12);
}

describe('liveHarmonicGrounding', () => {
  describe('getLiveOverrides', () => {
    it('returns empty when buffer too small', () => {
      const buffer: PitchBufferEntry[] = [
        { frequency: 262 },
        { frequency: 262 },
      ];
      expect(getLiveOverrides('C7', buffer)).toEqual({});
    });

    it('returns empty when chartChord empty', () => {
      const buffer: PitchBufferEntry[] = Array.from({ length: MIN_SAMPLES }, () => ({ frequency: 262 }));
      expect(getLiveOverrides('', buffer)).toEqual({});
    });
  });

  describe('Conflict Resolver (REQ-HAT-12)', () => {
    it('suggests subV7 when buffer has tritone sub tones over C7', () => {
      // C7 = C E G Bb (PC 0, 4, 7, 10). Tritone sub Gb7 = Gb Bb Db E (PC 6, 10, 1, 4).
      // Fill buffer mostly with Gb7 tones: 6, 10, 1, 4 (F#/Gb, Bb, Db, E).
      const gb7Freqs = [
        pcToFreq(6),
        pcToFreq(10),
        pcToFreq(1),
        pcToFreq(4),
        pcToFreq(6),
        pcToFreq(10),
        pcToFreq(1),
        pcToFreq(6),
        pcToFreq(10),
        pcToFreq(4),
      ];
      const buffer: PitchBufferEntry[] = gb7Freqs.map((f) => ({ frequency: f }));
      const result = getLiveOverrides('C7', buffer);
      expect(result.romanNumeral).toBe('subV7');
    });

    it('does not suggest subV7 when buffer has chart chord tones', () => {
      // C7 tones: 0, 4, 7, 10
      const c7Freqs = [pcToFreq(0), pcToFreq(4), pcToFreq(7), pcToFreq(10)];
      const buffer: PitchBufferEntry[] = Array.from(
        { length: MIN_SAMPLES },
        (_, i) => ({ frequency: c7Freqs[i % 4] })
      );
      const result = getLiveOverrides('C7', buffer);
      expect(result.romanNumeral).toBeUndefined();
    });
  });

  describe('Pedal Point Detection (REQ-HAT-13)', () => {
    it('returns pedal when bass range has one dominant pitch class', () => {
      const gFreq = 98; // G2
      const buffer: PitchBufferEntry[] = Array.from({ length: MIN_SAMPLES + 4 }, () => ({
        frequency: gFreq,
      }));
      const result = getLiveOverrides('Fmaj7', buffer);
      expect(result.pedal).toBeDefined();
      expect(result.pedal).toMatch(/G/);
    });

    it('does not return pedal when frequencies above bass range', () => {
      const buffer: PitchBufferEntry[] = Array.from({ length: MIN_SAMPLES }, () => ({
        frequency: 440,
      }));
      const result = getLiveOverrides('C7', buffer);
      expect(result.pedal).toBeUndefined();
    });
  });
});
