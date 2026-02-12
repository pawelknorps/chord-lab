/**
 * Phase 21: FunctionalLabelingEngine — Roman numerals and concept types from Chord DNA + context.
 */
import { describe, it, expect } from 'vitest';
import { FunctionalLabelingEngine } from './FunctionalLabelingEngine';
import type { ChordSlot } from './TonalitySegmentationEngine';
import type { KeySegment } from './TonalitySegmentationEngine';

describe('FunctionalLabelingEngine', () => {
  const engine = new FunctionalLabelingEngine();

  it('labels ii–V–I in C (Dm7, G7, Cmaj7)', () => {
    const slots: ChordSlot[] = [
      { barIndex: 0, chordSymbol: 'Dm7' },
      { barIndex: 1, chordSymbol: 'G7' },
      { barIndex: 2, chordSymbol: 'Cmaj7' },
    ];
    const segments: KeySegment[] = [{ startBar: 0, endBar: 2, key: 'C' }];
    const results = engine.label(slots, segments);
    expect(results).toHaveLength(3);
    expect(results[0].romanNumeral).toMatch(/ii7?/i);
    expect(results[1].romanNumeral).toMatch(/V7?/i);
    expect(results[2].romanNumeral).toMatch(/Imaj7?/i);
    expect(results.some((r) => r.conceptType === 'MajorII-V-I')).toBe(true);
  });

  it('labels tritone sub (Db7 → Cmaj7) as subV7', () => {
    const slots: ChordSlot[] = [
      { barIndex: 0, chordSymbol: 'Db7' },
      { barIndex: 1, chordSymbol: 'Cmaj7' },
    ];
    const segments: KeySegment[] = [{ startBar: 0, endBar: 1, key: 'C' }];
    const results = engine.label(slots, segments);
    expect(results).toHaveLength(2);
    expect(results[0].romanNumeral).toBe('subV7');
    expect(results[0].conceptType).toBe('TritoneSubstitution');
  });

  it('labels chromatic segment as Key shift', () => {
    const slots: ChordSlot[] = [
      { barIndex: 0, chordSymbol: 'Cm7' },
      { barIndex: 1, chordSymbol: 'Fm7' },
    ];
    const segments: KeySegment[] = [{ startBar: 0, endBar: 1, key: 'chromatic' }];
    const results = engine.label(slots, segments);
    expect(results).toHaveLength(2);
    expect(results[0].segmentLabel).toBe('Key shift');
  });
});
