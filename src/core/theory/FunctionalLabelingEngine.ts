/**
 * Functional Labeling Engine (Phase 21)
 *
 * Maps Chord DNA + key segment + context → Roman numeral and optional ConceptType.
 * REQ-HAT-06, REQ-HAT-07, REQ-HAT-08: Jazz cliché dictionary, constant-structure handling.
 */

import * as Note from '@tonaljs/note';
import * as Chord from '@tonaljs/chord';
import * as Key from '@tonaljs/key';
import { getChordDna, type ChordDnaResult } from './ChordDna';
import type { ConceptType } from './AnalysisTypes';
import type { ChordSlot } from './TonalitySegmentationEngine';
import type { KeySegment } from './TonalitySegmentationEngine';

export interface LabelResult {
  chordIndex: number;
  barIndex: number;
  chordSymbol: string;
  romanNumeral: string;
  conceptType?: ConceptType;
  key: string;
  segmentLabel?: string;
}

const CHROMATIC_KEY = 'chromatic';
const CONSTANT_STRUCTURE_KEY = 'constant';

/** Classify Chord DNA into simple type for cliché lookup. */
function chordDnaPattern(dna: ChordDnaResult | null): string {
  if (!dna) return 'unknown';
  const { core, extension, intervalNames } = dna;
  if (core.fifth === 'diminished' && extension.hasSeventh) return 'm7b5';
  if (extension.hasSeventh) {
    if (core.third === 'minor' && core.fifth === 'perfect') return 'm7';
    if (core.third === 'major' && core.fifth === 'perfect') {
      return intervalNames.includes('7M') ? 'maj7' : 'dom7';
    }
  }
  if (core.third === 'minor' && core.fifth === 'perfect') return 'm7';
  if (core.third === 'major' && core.fifth === 'perfect') return 'dom7';
  return 'unknown';
}

function isDom7(dna: ChordDnaResult | null): boolean {
  if (!dna) return false;
  return (
    dna.extension.hasSeventh &&
    dna.core.third === 'major' &&
    dna.core.fifth === 'perfect' &&
    !dna.intervalNames.includes('7M')
  );
}

function isMaj7(dna: ChordDnaResult | null): boolean {
  if (!dna) return false;
  return (
    dna.extension.hasSeventh &&
    dna.core.third === 'major' &&
    dna.core.fifth === 'perfect' &&
    dna.intervalNames.includes('7M')
  );
}

function isMin7(dna: ChordDnaResult | null): boolean {
  if (!dna) return false;
  return dna.core.third === 'minor' && dna.core.fifth === 'perfect' && dna.extension.hasSeventh;
}

function isHalfDim(dna: ChordDnaResult | null): boolean {
  if (!dna) return false;
  return dna.core.fifth === 'diminished' && dna.extension.hasSeventh;
}

/** Semitones from root A to root B (0–11). */
function semitonesUp(fromRoot: string, toRoot: string): number {
  const fromPc = Note.chroma(fromRoot) ?? 0;
  const toPc = Note.chroma(toRoot) ?? 0;
  return (toPc - fromPc + 12) % 12;
}

/** Key tonic (no "m" suffix). */
function keyTonic(key: string): string {
  return key.endsWith('m') ? key.slice(0, -1) : key;
}

/** Scale degree 1–7 of root in key (1-based), or 0 if not in key. */
function scaleDegreeSync(rootName: string, key: string): number {
  const tonic = keyTonic(key);
  const isMinor = key.endsWith('m');
  const scaleNotes = isMinor
    ? Key.minorKey(tonic).natural.scale
    : Key.majorKey(tonic).scale;
  const rootChroma = Note.chroma(rootName) ?? -1;
  for (let i = 0; i < scaleNotes.length; i++) {
    if ((Note.chroma(scaleNotes[i]) ?? -1) === rootChroma) return i + 1;
  }
  return 0;
}

const ROMAN_LOWER = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
const ROMAN_UPPER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function degreeToRoman(degree: number, key: string): string {
  if (degree < 1 || degree > 7) return '';
  const isMinor = key.endsWith('m');
  const roman = isMinor ? ROMAN_LOWER : ROMAN_UPPER;
  return roman[degree - 1] ?? '';
}

/**
 * Find key segment that contains barIndex.
 */
function segmentForKey(barIndex: number, segments: KeySegment[]): KeySegment | undefined {
  return segments.find((s) => barIndex >= s.startBar && barIndex <= s.endBar);
}

/**
 * REQ-HAT-08: Chromatic or constant-structure segment → "Key shift" or chord root only.
 */
function isChromaticOrConstantStructure(key: string): boolean {
  return key === CHROMATIC_KEY || key === CONSTANT_STRUCTURE_KEY;
}

/**
 * FunctionalLabelingEngine: chord sequence + segments → per-chord Roman numerals and concept types.
 */
export class FunctionalLabelingEngine {
  label(slots: ChordSlot[], segments: KeySegment[]): LabelResult[] {
    const results: LabelResult[] = [];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const seg = segmentForKey(slot.barIndex, segments);
      const key = seg?.key ?? 'C';
      const dna = getChordDna(slot.chordSymbol);
      const root = dna?.root ?? Chord.get(slot.chordSymbol).tonic ?? '';

      if (isChromaticOrConstantStructure(key)) {
        results.push({
          chordIndex: i,
          barIndex: slot.barIndex,
          chordSymbol: slot.chordSymbol,
          romanNumeral: root || slot.chordSymbol.slice(0, 2),
          key,
          segmentLabel: 'Key shift',
        });
        continue;
      }

      const prev = i > 0 ? getChordDna(slots[i - 1].chordSymbol) : null;
      const next = i < slots.length - 1 ? getChordDna(slots[i + 1].chordSymbol) : null;
      const nextRoot = i < slots.length - 1 ? (next?.root ?? '') : '';
      const prevRoot = i > 0 ? (prev?.root ?? '') : '';

      let romanNumeral = '';
      let conceptType: ConceptType | undefined;

      // Tritone sub: dom7 resolving down half-step (e.g. Db7 → Cmaj7; next root 11 semitones “up” = half-step down)
      if (isDom7(dna) && nextRoot) {
        const semis = semitonesUp(root, nextRoot);
        if (semis === 11) {
          romanNumeral = 'subV7';
          conceptType = 'TritoneSubstitution';
          results.push({
            chordIndex: i,
            barIndex: slot.barIndex,
            chordSymbol: slot.chordSymbol,
            romanNumeral,
            conceptType,
            key,
          });
          continue;
        }
      }

      // ii–V–I: m7 → dom7 (4th up) → maj7
      const nextIsDom7 = i < slots.length - 1 && isDom7(next);
      const nextIsMaj7 = i < slots.length - 1 && isMaj7(getChordDna(slots[i + 1].chordSymbol));
      const intervalToNext = nextRoot ? semitonesUp(root, nextRoot) : -1;

      if (isMin7(dna) && nextIsDom7 && intervalToNext === 5) {
        const deg = scaleDegreeSync(root, key);
        romanNumeral = deg >= 1 && deg <= 7 ? (ROMAN_LOWER[deg - 1] ?? '') + '7' : 'ii7';
        if (i + 2 < slots.length && isMaj7(getChordDna(slots[i + 2].chordSymbol)))
          conceptType = 'MajorII-V-I';
      } else if (isDom7(dna) && nextIsMaj7 && intervalToNext === 5) {
        const deg = scaleDegreeSync(root, key);
        romanNumeral = deg >= 1 && deg <= 7 ? (ROMAN_UPPER[deg - 1] ?? '') + '7' : 'V7';
        if (i >= 2 && isMin7(getChordDna(slots[i - 1].chordSymbol))) conceptType = 'MajorII-V-I';
      } else if (isMaj7(dna) && i >= 2 && isDom7(getChordDna(slots[i - 1].chordSymbol)) && isMin7(getChordDna(slots[i - 2].chordSymbol))) {
        const deg = scaleDegreeSync(root, key);
        romanNumeral = deg >= 1 && deg <= 7 ? (ROMAN_UPPER[deg - 1] ?? '') + 'maj7' : 'Imaj7';
        conceptType = 'MajorII-V-I';
      } else if (isHalfDim(dna) && key.endsWith('m')) {
        romanNumeral = 'iiø7';
        if (i + 2 < slots.length) conceptType = 'MinorII-V-i';
      } else {
        const deg = scaleDegreeSync(root, key);
        if (deg >= 1 && deg <= 7) {
          const q = chordDnaPattern(dna);
          if (q === 'm7') romanNumeral = (ROMAN_LOWER[deg - 1] ?? '') + '7';
          else if (q === 'dom7') romanNumeral = (ROMAN_UPPER[deg - 1] ?? '') + '7';
          else if (q === 'maj7') romanNumeral = (ROMAN_UPPER[deg - 1] ?? '') + 'maj7';
          else romanNumeral = degreeToRoman(deg, key);
        } else {
          romanNumeral = root || slot.chordSymbol.slice(0, 2);
        }
      }

      results.push({
        chordIndex: i,
        barIndex: slot.barIndex,
        chordSymbol: slot.chordSymbol,
        romanNumeral: romanNumeral || root || slot.chordSymbol.slice(0, 2),
        conceptType,
        key,
      });
    }
    return results;
  }
}
