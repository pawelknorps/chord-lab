import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

    it('returns sab and view with 4 Float32 slots (frequency, confidence, rms, onset) when SAB is available', () => {
      if (typeof SharedArrayBuffer === 'undefined') return;
      const { sab, view } = createPitchMemory();
      expect(sab).toBeDefined();
      expect(sab.byteLength).toBe(4 * Float32Array.BYTES_PER_ELEMENT);
      expect(view).toBeInstanceOf(Float32Array);
      expect(view.length).toBe(4);
      expect(view[0]).toBe(0);
      expect(view[1]).toBe(0);
      expect(view[2]).toBe(0);
      expect(view[3]).toBe(0);
    });
  });
});
