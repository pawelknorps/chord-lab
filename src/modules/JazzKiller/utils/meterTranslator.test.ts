import { describe, it, expect } from 'vitest';
import { getMeterAtBar, getParsedMeterAtBar, type MeterChange } from './meterTranslator';

describe('meterTranslator', () => {
  describe('getMeterAtBar', () => {
    it('returns defaultMeter when meterChanges is undefined', () => {
      expect(getMeterAtBar(0, undefined, '4/4')).toBe('4/4');
      expect(getMeterAtBar(16, undefined, '3/4')).toBe('3/4');
    });

    it('returns defaultMeter when meterChanges is empty', () => {
      expect(getMeterAtBar(0, [], '4/4')).toBe('4/4');
    });

    it('returns first change for bar 0 when first change is bar 1', () => {
      const changes: MeterChange[] = [{ bar: 1, top: 4, bottom: 4 }];
      expect(getMeterAtBar(0, changes, '3/4')).toBe('4/4');
    });

    it('returns correct meter at change boundary (1-based bar 17 = 3/4)', () => {
      const changes: MeterChange[] = [
        { bar: 1, top: 4, bottom: 4 },
        { bar: 17, top: 3, bottom: 4 },
      ];
      expect(getMeterAtBar(0, changes, '4/4')).toBe('4/4');
      expect(getMeterAtBar(15, changes, '4/4')).toBe('4/4');
      expect(getMeterAtBar(16, changes, '4/4')).toBe('3/4');
      expect(getMeterAtBar(20, changes, '4/4')).toBe('3/4');
    });

    it('handles unsorted meterChanges', () => {
      const changes: MeterChange[] = [
        { bar: 17, top: 3, bottom: 4 },
        { bar: 1, top: 4, bottom: 4 },
      ];
      expect(getMeterAtBar(16, changes, '4/4')).toBe('3/4');
    });
  });

  describe('getParsedMeterAtBar', () => {
    it('returns ParsedMeter with correct divisionsPerBar for 3/4', () => {
      const changes: MeterChange[] = [{ bar: 1, top: 3, bottom: 4 }];
      const parsed = getParsedMeterAtBar(0, changes, '4/4');
      expect(parsed.meter).toBe('3/4');
      expect(parsed.divisionsPerBar).toBe(3);
    });
  });
});
