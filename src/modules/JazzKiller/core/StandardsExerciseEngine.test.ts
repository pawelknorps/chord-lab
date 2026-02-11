import { describe, it, expect } from 'vitest';
import { getTargetSet, scoreNote } from './StandardsExerciseEngine';

describe('StandardsExerciseEngine', () => {
  describe('getTargetSet', () => {
    it('scale: Dm7 returns Dorian scale pitch classes', () => {
      const result = getTargetSet('Dm7', 'scale');
      expect(result).not.toBeNull();
      expect(result!.label).toMatch(/D.*dorian/i);
      expect(result!.pitchClasses).toContain(2); // D
      expect(result!.pitchClasses).toContain(4); // E
      expect(result!.pitchClasses).toContain(5); // F
      expect(result!.pitchClasses.length).toBeGreaterThanOrEqual(7);
    });

    it('guideTones: Dm7 returns 3rd (F) and 7th (C)', () => {
      const result = getTargetSet('Dm7', 'guideTones');
      expect(result).not.toBeNull();
      expect(result!.label).toMatch(/3rd.*7th/i);
      // F = 5, C = 0 (pitch classes)
      expect(result!.pitchClasses).toContain(5);
      expect(result!.pitchClasses).toContain(0);
      expect(result!.pitchClasses.length).toBe(2);
    });

    it('arpeggio: Dm7 returns chord tones', () => {
      const result = getTargetSet('Dm7', 'arpeggio');
      expect(result).not.toBeNull();
      expect(result!.pitchClasses).toContain(2); // D
      expect(result!.pitchClasses).toContain(5); // F
      expect(result!.pitchClasses).toContain(9); // A
      expect(result!.pitchClasses).toContain(0); // C (b7)
      expect(result!.pitchClasses.length).toBe(4);
    });

    it('returns null for empty chord', () => {
      expect(getTargetSet('', 'scale')).toBeNull();
      expect(getTargetSet('', 'guideTones')).toBeNull();
      expect(getTargetSet('', 'arpeggio')).toBeNull();
    });
  });

  describe('scoreNote', () => {
    it('student note in target set → hit', () => {
      const target = getTargetSet('Dm7', 'arpeggio');
      expect(target).not.toBeNull();
      // D4 = 62, pitch class 2
      const result = scoreNote(62, target!);
      expect(result.hit).toBe(true);
    });

    it('student note not in target set → miss', () => {
      const target = getTargetSet('Dm7', 'arpeggio');
      expect(target).not.toBeNull();
      // E4 = 64, pitch class 4 (not in Dm7 chord: D F A C)
      const result = scoreNote(64, target!);
      expect(result.hit).toBe(false);
    });

    it('null target → miss', () => {
      const result = scoreNote(60, null);
      expect(result.hit).toBe(false);
    });

    it('same pitch class in different octave counts as hit', () => {
      const target = getTargetSet('Dm7', 'scale');
      expect(target).not.toBeNull();
      const resultLow = scoreNote(26, target!); // D2
      const resultHigh = scoreNote(74, target!); // D5
      expect(resultLow.hit).toBe(true);
      expect(resultHigh.hit).toBe(true);
    });
  });
});
