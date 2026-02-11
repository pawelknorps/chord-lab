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

    it('returns sab and view with 2 Float32 slots when SAB is available', () => {
      if (typeof SharedArrayBuffer === 'undefined') return;
      const { sab, view } = createPitchMemory();
      expect(sab).toBeDefined();
      expect(sab.byteLength).toBe(2 * Float32Array.BYTES_PER_ELEMENT);
      expect(view).toBeInstanceOf(Float32Array);
      expect(view.length).toBe(2);
      expect(view[0]).toBe(0);
      expect(view[1]).toBe(0);
    });
  });
});
