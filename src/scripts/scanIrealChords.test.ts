/**
 * Scan every standard for chord labels and report those ChordDna doesn't recognise.
 * Run: pnpm test:run src/scripts/scanIrealChords.test.ts
 */
import standardsData from '../modules/JazzKiller/utils/standards.json';
import type { JazzStandard } from './scanIrealChords';
import {
  scanStandardsForUnrecognisedChords,
  extractChordTokens,
  getAllUniqueSymbols,
  getUnrecognisedSymbols,
} from './scanIrealChords';

const standards = standardsData as JazzStandard[];

describe('scanIrealChords', () => {
  it('extracts base and alternates from a cell', () => {
    const tokens = extractChordTokens('Ab7#9(Ab0),(A0),(Bb0),(B0)');
    expect(tokens).toContain('Ab7#9');
    expect(tokens).toContain('Ab0');
    expect(tokens).toContain('A0');
    expect(tokens).toContain('Bb0');
    expect(tokens).toContain('B0');
  });

  it('scans all standards and reports unrecognised chord symbols', () => {
    const { total, unrecognised } = scanStandardsForUnrecognisedChords(standards);

    // Always log summary so "npm run scan:chords" shows what ChordDna misses
    console.log('\n--- iReal chord scan ---');
    console.log(`Total unique symbols: ${total}`);
    console.log(`Unrecognised: ${unrecognised.length}`);
    if (unrecognised.length > 0) {
      console.log('Unrecognised symbols:');
      console.log(unrecognised.join('\n'));
    }
    console.log('---\n');

    expect(total).toBeGreaterThan(0);
  });
});

describe('getAllUniqueSymbols', () => {
  it('collects unique symbols from standards', () => {
    const unique = getAllUniqueSymbols(standards);
    expect(unique.size).toBeGreaterThan(100);
    expect(unique.has('C7')).toBe(true);
    expect(unique.has('Fmaj7')).toBe(true);
  });
});
