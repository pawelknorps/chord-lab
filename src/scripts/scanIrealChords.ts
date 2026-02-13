/**
 * Scan all jazz standards for chord symbols and report those that ChordDna
 * does not recognise (iReal Pro symbols we may be missing).
 *
 * Run: pnpm test:run src/scripts/scanIrealChords.test.ts
 * Or:  node --experimental-strip-types node_modules/tsx/dist/cli.mjs scripts/scan-ireal-chords.ts (if using tsx)
 */

import { getChordDna } from '../core/theory/ChordDna';

export interface JazzSection {
  Label?: string;
  Repeats?: number;
  MainSegment: { Chords: string };
  Endings?: { Chords: string }[];
}

export interface JazzStandard {
  Title: string;
  Sections: JazzSection[];
}

/**
 * From a single chord cell (e.g. "Ab7#9(Ab0),(A0),(Bb0),(B0)"), extract every
 * symbol to test: the base (parens stripped) and each alternate in parens.
 */
export function extractChordTokens(cell: string): string[] {
  const tokens: string[] = [];
  const trimmed = cell.trim();
  if (!trimmed) return tokens;

  const base = trimmed
    .replace(/\([^)]*\)/g, '')
    .replace(/,+/g, ',')
    .replace(/^,|,$/g, '')
    .trim();
  if (base) tokens.push(base);

  const alternates = trimmed.match(/\([^)]+\)/g) ?? [];
  for (const alt of alternates) {
    const inner = alt.slice(1, -1).trim();
    if (inner) tokens.push(inner);
  }

  return tokens;
}

/**
 * Collect all unique chord symbols from a standards array (Chords strings
 * split by | and , then expanded for alternates).
 */
export function getAllUniqueSymbols(standards: JazzStandard[]): Set<string> {
  const unique = new Set<string>();

  for (const standard of standards) {
    for (const section of standard.Sections ?? []) {
      const segments: { Chords: string }[] = [section.MainSegment];
      if (section.Endings) segments.push(...section.Endings);

      for (const seg of segments) {
        const chordsStr = seg.Chords ?? '';
        const measures = chordsStr.split('|');
        for (const ms of measures) {
          const cells = ms.split(',').map((c) => c.trim()).filter(Boolean);
          for (const cell of cells) {
            for (const token of extractChordTokens(cell)) {
              if (token) unique.add(token);
            }
          }
        }
      }
    }
  }

  return unique;
}

/**
 * For each symbol, call getChordDna. Unrecognised = null or empty intervals.
 */
export function getUnrecognisedSymbols(symbols: Iterable<string>): string[] {
  const unrecognised: string[] = [];
  for (const symbol of symbols) {
    const dna = getChordDna(symbol);
    if (dna == null || !dna.intervals?.length) {
      unrecognised.push(symbol);
    }
  }
  return unrecognised.sort();
}

/**
 * Full scan: from standards data, return { total, unrecognised, list }.
 */
export function scanStandardsForUnrecognisedChords(standards: JazzStandard[]): {
  total: number;
  unrecognised: string[];
} {
  const unique = getAllUniqueSymbols(standards);
  const unrecognised = getUnrecognisedSymbols(unique);
  return { total: unique.size, unrecognised };
}
