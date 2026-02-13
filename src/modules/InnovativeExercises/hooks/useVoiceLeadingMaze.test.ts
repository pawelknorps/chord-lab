import { describe, it, expect } from 'vitest';
import { getAllowedPitchClasses } from './useVoiceLeadingMaze';

describe('useVoiceLeadingMaze / getAllowedPitchClasses', () => {
  it('Dm7 allows F (3rd) and C (7th)', () => {
    const set = getAllowedPitchClasses('Dm7');
    expect(set.has('F')).toBe(true);
    expect(set.has('C')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('G7 allows B (3rd) and F (7th)', () => {
    const set = getAllowedPitchClasses('G7');
    expect(set.has('B')).toBe(true);
    expect(set.has('F')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('Cmaj7 allows E (3rd) and B (7th)', () => {
    const set = getAllowedPitchClasses('Cmaj7');
    expect(set.has('E')).toBe(true);
    expect(set.has('B')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('returns empty set for invalid chord', () => {
    const set = getAllowedPitchClasses('');
    expect(set.size).toBe(0);
  });
});
