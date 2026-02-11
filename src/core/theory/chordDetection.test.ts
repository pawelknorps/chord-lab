import { describe, it, expect } from 'vitest';
import {
  analyzeChordFromNotes,
  detectJazzChordByProfile,
  pcsToBitmask,
  noteNameToMidi,
  getChordNotes,
  CHORD_INTERVALS,
} from './index';

/** MIDI for note name at octave 4 (e.g. E4, G#4). */
function midi(root: string, semitonesFromRoot: number): number {
  const base = noteNameToMidi(root + '4');
  return base + semitonesFromRoot;
}

describe('pcsToBitmask', () => {
  it('builds 12-bit mask from pitch classes', () => {
    // bits 0,4,7 = 1 + 16 + 128 = 145 (major triad)
    expect(pcsToBitmask([0, 4, 7])).toBe((1 << 0) | (1 << 4) | (1 << 7));
    // bits 0,4,8,11 = Emaj7#5
    expect(pcsToBitmask([0, 4, 8, 11])).toBe((1 << 0) | (1 << 4) | (1 << 8) | (1 << 11));
  });
});

describe('detectJazzChordByProfile', () => {
  it('returns maj7#5 for major triad + aug5 + maj7 (no "custom")', () => {
    const profile = [0, 4, 8, 11]; // E G# B# D#
    expect(detectJazzChordByProfile(profile)).toBe('maj7#5');
  });

  it('returns maj7 for major triad + maj7', () => {
    expect(detectJazzChordByProfile([0, 4, 7, 11])).toBe('maj7');
  });

  it('returns min7 for minor triad + dom7', () => {
    expect(detectJazzChordByProfile([0, 3, 7, 10])).toBe('min7');
  });

  it('returns aug for major triad + aug5 only', () => {
    expect(detectJazzChordByProfile([0, 4, 8])).toBe('aug');
  });

  it('returns dom7 for major triad + b7', () => {
    expect(detectJazzChordByProfile([0, 4, 7, 10])).toBe('dom7');
  });

  it('returns 7#5 for aug triad + b7', () => {
    expect(detectJazzChordByProfile([0, 4, 8, 10])).toBe('7#5');
  });

  it('returns dim7 for dim triad + dim7', () => {
    expect(detectJazzChordByProfile([0, 3, 6, 9])).toBe('dim7');
  });

  it('returns m7b5 for dim triad + b7', () => {
    expect(detectJazzChordByProfile([0, 3, 6, 10])).toBe('m7b5');
  });

  it('returns null for fewer than 3 pitch classes', () => {
    expect(detectJazzChordByProfile([0, 4])).toBe(null);
    expect(detectJazzChordByProfile([0])).toBe(null);
  });

  it('returns null when root (0) is missing', () => {
    expect(detectJazzChordByProfile([3, 7, 10])).toBe(null);
  });
});

describe('analyzeChordFromNotes', () => {
  it('detects Emaj7#5 via template (exact match)', () => {
    const notes = [midi('E', 0), midi('E', 4), midi('E', 8), midi('E', 11)];
    const r = analyzeChordFromNotes(notes);
    expect(r).not.toBeNull();
    expect(r!.root).toBe('E');
    expect(r!.quality).toBe('maj7#5');
  });

  it('detects Emaj7#5 via fallback when template missing (functional decomposition)', () => {
    const notes = [64, 68, 72, 75]; // E4, G#4, B#4, D#5
    const r = analyzeChordFromNotes(notes);
    expect(r).not.toBeNull();
    expect(r!.root).toBe('E');
    expect(r!.quality).toBe('maj7#5');
  });

  it('never returns quality "custom" for known chord types', () => {
    const chords: [string, number[]][] = [
      ['Emaj7#5', [0, 4, 8, 11]],
      ['Cmaj7', [0, 4, 7, 11]],
      ['Am7', [0, 3, 7, 10]],
      ['G7', [0, 4, 7, 10]],
      ['Bdim7', [0, 3, 6, 9]],
    ];
    for (const [label, pcs] of chords) {
      const rootMidi = 60; // C4
      const notes = pcs.map((i) => rootMidi + i);
      const r = analyzeChordFromNotes(notes);
      expect(r, label).not.toBeNull();
      expect(r!.quality, label).not.toBe('custom');
    }
  });

  it('prefers root position when multiple roots fit', () => {
    const notes = [60, 64, 67, 70]; // C E G Bb = C7
    const r = analyzeChordFromNotes(notes);
    expect(r).not.toBeNull();
    expect(r!.root).toBe('C');
    expect(r!.quality).toBe('dom7');
  });

  it('returns null for fewer than 3 notes', () => {
    expect(analyzeChordFromNotes([60, 64])).toBeNull();
    expect(analyzeChordFromNotes([])).toBeNull();
  });

  it('handles key context for enharmonic spelling', () => {
    const notes = [61, 65, 68, 72]; // C# F G# C = C#m7
    const r = analyzeChordFromNotes(notes, 'E');
    expect(r).not.toBeNull();
    expect(r!.root).toMatch(/^[A-G][#b]?$/);
  });
});

describe('round-trip: getChordNotes then analyzeChordFromNotes', () => {
  const qualities = ['maj', 'min', 'maj7', 'min7', 'dom7', 'maj7#5', 'dim7', 'm7b5', 'add9', 'maj9', '9'];
  for (const quality of qualities) {
    if (!CHORD_INTERVALS[quality]) continue;
    it(`round-trips ${quality} in C`, () => {
      const notes = getChordNotes('C', quality, 4, 'Root Position');
      const analyzed = analyzeChordFromNotes(notes);
      expect(analyzed, quality).not.toBeNull();
      expect(analyzed!.root).toBe('C');
      expect(analyzed!.quality).toBe(quality);
    });
  }
  it('round-trips 7#5 in C (detected as 7#5 or aug7)', () => {
    const notes = getChordNotes('C', '7#5', 4, 'Root Position');
    const analyzed = analyzeChordFromNotes(notes);
    expect(analyzed).not.toBeNull();
    expect(analyzed!.root).toBe('C');
    expect(['7#5', 'aug7']).toContain(analyzed!.quality);
  });
});
