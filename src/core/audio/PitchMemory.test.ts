import { describe, it, expect, vi, afterEach } from 'vitest';
import { createPitchMemory, isPitchMemorySupported } from './PitchMemory';

describe('PitchMemory', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isPitchMemorySupported', () => {
    it('returns false when SharedArrayBuffer is undefined', () => {
      vi.stubGlobal('SharedArrayBuffer', undefined);
      expect(isPitchMemorySupported()).toBe(false);
    });

    it('returns true when SharedArrayBuffer is present', () => {
      vi.stubGlobal('SharedArrayBuffer', class SharedArrayBuffer { constructor() {} });
      expect(isPitchMemorySupported()).toBe(true);
    });
  });

  describe('createPitchMemory', () => {
    it('throws when SharedArrayBuffer is undefined', () => {
      vi.stubGlobal('SharedArrayBuffer', undefined);
      expect(() => createPitchMemory()).toThrow(/SharedArrayBuffer is not available/);
    });

    it('returns sab and view with 6 Float32 slots when SAB is available', () => {
      if (typeof SharedArrayBuffer === 'undefined') return;
      const { sab, view } = createPitchMemory();
      expect(sab).toBeDefined();
      expect(sab.byteLength).toBe(6 * Float32Array.BYTES_PER_ELEMENT);
      expect(view).toBeInstanceOf(Float32Array);
      expect(view.length).toBe(6);
      expect(view[0]).toBe(0); // frequency
      expect(view[1]).toBe(0); // confidence
      expect(view[2]).toBe(0); // rms
      expect(view[3]).toBe(0); // onset
      expect(view[4]).toBe(0); // lastUpdated
      expect(view[5]).toBe(0); // latencyScore
    });
  });
});
