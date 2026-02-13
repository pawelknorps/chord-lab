import { describe, it, expect } from 'vitest';
import { computeSwingPocket } from './SwingAnalysis';

describe('SwingAnalysis', () => {
  describe('computeSwingPocket', () => {
    it('returns default ratio 2 and offset 0 when too few onsets', () => {
      const start = 1000;
      const onsets: number[] = [];
      const r = computeSwingPocket(120, start, onsets);
      expect(r.ratio).toBe(2);
      expect(r.offsetMs).toBe(0);
      expect(r.beatCount).toBe(0);
    });

    it('computes ratio and offset from mock onsets (2:1 triplet feel)', () => {
      const bpm = 120;
      const beatMs = 60000 / bpm; // 500 ms per beat
      const start = 0;
      // Beat 0: first 8th at 0, second 8th at 333 ms (2:1 swing)
      // So first duration 333, second duration 167 → ratio 333/167 ≈ 2
      const onsets = [
        start + 0,
        start + 333,
        start + beatMs + 0,
        start + beatMs + 333,
        start + 2 * beatMs + 0,
        start + 2 * beatMs + 333,
      ];
      const r = computeSwingPocket(bpm, start, onsets);
      expect(r.beatCount).toBeGreaterThanOrEqual(1);
      expect(r.ratio).toBeGreaterThan(1.5);
      expect(r.ratio).toBeLessThan(3);
    });

    it('positive offset when onsets are late', () => {
      const bpm = 120;
      const beatMs = 60000 / bpm;
      const start = 0;
      const lateMs = 30;
      const onsets = [
        start + lateMs,
        start + beatMs / 2 + lateMs,
        start + beatMs + lateMs,
        start + beatMs + beatMs / 2 + lateMs,
      ];
      const r = computeSwingPocket(bpm, start, onsets);
      expect(r.offsetMs).toBeGreaterThan(0);
    });

    it('dedupes very close onsets', () => {
      const start = 0;
      const bpm = 120;
      const beatMs = 60000 / bpm;
      const onsets = [
        start,
        start + 10,
        start + 20,
        start + beatMs,
        start + beatMs + 10,
      ];
      const r = computeSwingPocket(bpm, start, onsets);
      expect(r.beatCount).toBeGreaterThanOrEqual(1);
    });
  });
});
