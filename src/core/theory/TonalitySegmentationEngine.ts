/**
 * Tonality Segmentation Engine (Phase 21)
 *
 * Finds key center segments for a chord sequence via DP/Viterbi:
 * J = Σ Fit(Chord_i, Key_k) + Σ Transition(Key_i, Key_{i+1})
 *
 * REQ-HAT-01: Key center representation (24 keys, slot model).
 * REQ-HAT-02: Fit cost (chord–key).
 * REQ-HAT-03: Transition cost (key–key).
 */

import * as Note from '@tonaljs/note';
import * as Chord from '@tonaljs/chord';
import * as Key from '@tonaljs/key';
import { getChordDna } from './ChordDna';

// —— REQ-HAT-01: Key center set (12 major + 12 minor) ——
const MAJOR_TONICS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
export const KEY_CENTERS: string[] = [
  ...MAJOR_TONICS,
  ...MAJOR_TONICS.map((t) => t + 'm'),
];

export interface ChordSlot {
  barIndex: number;
  chordSymbol: string;
}

export interface KeySegment {
  startBar: number;
  endBar: number;
  key: string;
}

/** Tunable weights for Fit cost (lower = better fit). */
export const FIT_WEIGHTS = {
  diatonic: 0,
  secondaryOrBorrowed: 2,
  chromatic: 5,
} as const;

/** Tunable base penalty per circle-of-fifths step. */
export const TRANSITION_BASE_PENALTY = 1;

/** Bonus (negative penalty) for relative major/minor. */
export const RELATIVE_BONUS = -0.5;

/**
 * Pitch class (0–11) for a note name.
 */
function noteToPc(noteName: string): number {
  const chroma = Note.chroma(noteName);
  return chroma >= 0 ? chroma : 0;
}

/**
 * Scale pitch classes for a key center ("C" = C major, "Cm" = C natural minor).
 */
function keyScalePcs(key: string): number[] {
  const isMinor = key.endsWith('m');
  const tonic = isMinor ? key.slice(0, -1) : key;
  const scaleNotes = isMinor
    ? Key.minorKey(tonic).natural.scale
    : Key.majorKey(tonic).scale;
  if (Array.isArray(scaleNotes)) {
    return scaleNotes.map((n) => noteToPc(n));
  }
  const intervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
  const rootPc = noteToPc(tonic);
  return intervals.map((i) => (rootPc + i) % 12);
}

/**
 * REQ-HAT-02: Fit(Chord_i, Key_k) — cost of assigning chord to key.
 * Diatonic = low, secondary/borrowed = medium, chromatic = high.
 */
export function getFitCost(
  chordSymbol: string,
  key: string,
  weights: { diatonic: number; secondaryOrBorrowed: number; chromatic: number } = FIT_WEIGHTS
): number {
  const dna = getChordDna(chordSymbol);
  const chord = Chord.get(chordSymbol);
  const rootName = chord.tonic || dna?.root;
  if (!rootName) return weights.chromatic;

  const rootPc = noteToPc(rootName);
  const scalePcs = keyScalePcs(key);

  if (scalePcs.includes(rootPc)) {
    // Diatonic: chord root is in key scale
    const degreeIndex = scalePcs.indexOf(rootPc);
    const isDom7 =
      (dna?.extension.hasSeventh && dna?.core.third === 'major' && dna?.core.fifth === 'perfect') ||
      chord.type === '7' ||
      chord.aliases?.includes('7');
    // V in major or III in minor = dominant; treat as diatonic when in key
    if (isDom7 && (degreeIndex === 4 || (key.endsWith('m') && degreeIndex === 2)))
      return weights.diatonic;
    return weights.diatonic;
  }

  // Secondary dominant / borrowed: common in jazz (e.g. V/ii, bVII)
  const fifthsFromC = (pc: number) => (pc * 7) % 12; // C=0, G=1, D=2, ...
  const dist = Math.min(
    Math.abs(fifthsFromC(rootPc) - fifthsFromC(scalePcs[0])),
    12 - Math.abs(fifthsFromC(rootPc) - fifthsFromC(scalePcs[0]))
  );
  if (dist <= 2) return weights.secondaryOrBorrowed;

  return weights.chromatic;
}

/**
 * Circle-of-fifths index: C=0, G=1, D=2, A=3, E=4, B=5, F#/Gb=6, Db=7, Ab=8, Eb=9, Bb=10, F=11.
 */
function keyToFifthsIndex(key: string): number {
  const tonic = key.endsWith('m') ? key.slice(0, -1) : key;
  const map: Record<string, number> = {
    C: 0, 'C#': 7, Db: 7, D: 2, Eb: 9, E: 4, F: 11, 'F#': 6, Gb: 6, G: 1, Ab: 8, A: 3, Bb: 10, B: 5, Cb: 5,
  };
  return map[tonic] ?? 0;
}

/**
 * REQ-HAT-03: Transition(Key_i, Key_{i+1}) — penalty for modulating.
 * Circle-of-fifths distance; relative major/minor = low penalty.
 */
export function getTransitionCost(
  keyFrom: string,
  keyTo: string,
  basePenalty: number = TRANSITION_BASE_PENALTY,
  relativeBonus: number = RELATIVE_BONUS
): number {
  if (keyFrom === keyTo) return 0;

  const fromF = keyToFifthsIndex(keyFrom);
  const toF = keyToFifthsIndex(keyTo);
  let steps = Math.abs(fromF - toF);
  if (steps > 6) steps = 12 - steps;

  let cost = steps * basePenalty;

  // Relative major/minor: same key signature (e.g. C and Am)
  const tonicFrom = keyFrom.endsWith('m') ? keyFrom.slice(0, -1) : keyFrom;
  const tonicTo = keyTo.endsWith('m') ? keyTo.slice(0, -1) : keyTo;
  const fromMinor = keyFrom.endsWith('m');
  const toMinor = keyTo.endsWith('m');
  if (tonicFrom !== tonicTo && fromMinor !== toMinor) {
    const relTonic = fromMinor
      ? Key.minorKey(tonicFrom).relativeMajor
      : Key.majorKey(tonicFrom).minorRelative;
    if (relTonic === tonicTo) cost += relativeBonus;
  }

  return cost;
}

export interface TonalitySegmentationEngineOptions {
  fitWeights?: { diatonic: number; secondaryOrBorrowed: number; chromatic: number };
  transitionBasePenalty?: number;
  relativeBonus?: number;
}

/**
 * REQ-HAT-04, REQ-HAT-05: Viterbi segmentation and getSegments() (Wave 2).
 */
export class TonalitySegmentationEngine {
  private slots: ChordSlot[] = [];
  private options: Required<TonalitySegmentationEngineOptions>;
  private keyPath: string[] = [];
  private segments: KeySegment[] = [];

  constructor(options: TonalitySegmentationEngineOptions = {}) {
    this.options = {
      fitWeights: options.fitWeights ?? { ...FIT_WEIGHTS },
      transitionBasePenalty: options.transitionBasePenalty ?? TRANSITION_BASE_PENALTY,
      relativeBonus: options.relativeBonus ?? RELATIVE_BONUS,
    };
  }

  /**
   * Set chord sequence (one slot per bar or per chord).
   */
  setSlots(slots: ChordSlot[]): void {
    this.slots = slots;
  }

  /**
   * Run Viterbi to find optimal key path; merge into segments.
   */
  segment(): void {
    const N = this.slots.length;
    const K = KEY_CENTERS.length;
    if (N === 0) {
      this.keyPath = [];
      this.segments = [];
      return;
    }

    const { fitWeights, transitionBasePenalty, relativeBonus } = this.options;
    const cost = new Float64Array(N * K);
    const back = new Int32Array(N * K);

    for (let k = 0; k < K; k++) {
      cost[0 * K + k] = getFitCost(this.slots[0].chordSymbol, KEY_CENTERS[k], fitWeights);
      back[0 * K + k] = -1;
    }

    for (let i = 1; i < N; i++) {
      for (let k = 0; k < K; k++) {
        const fitCost = getFitCost(this.slots[i].chordSymbol, KEY_CENTERS[k], fitWeights);
        let best = Infinity;
        let bestPrev = 0;
        for (let j = 0; j < K; j++) {
          const prevCost = cost[(i - 1) * K + j];
          const transCost = getTransitionCost(
            KEY_CENTERS[j],
            KEY_CENTERS[k],
            transitionBasePenalty,
            relativeBonus
          );
          const total = prevCost + transCost + fitCost;
          if (total < best) {
            best = total;
            bestPrev = j;
          }
        }
        cost[i * K + k] = best;
        back[i * K + k] = bestPrev;
      }
    }

    let bestLast = 0;
    let bestLastCost = Infinity;
    for (let k = 0; k < K; k++) {
      if (cost[(N - 1) * K + k] < bestLastCost) {
        bestLastCost = cost[(N - 1) * K + k];
        bestLast = k;
      }
    }

    const path: string[] = [];
    let idx = bestLast;
    for (let i = N - 1; i >= 0; i--) {
      path[i] = KEY_CENTERS[idx];
      idx = back[i * K + idx];
      if (idx < 0) break;
    }
    this.keyPath = path;

    // Merge consecutive same-key into segments (by bar)
    const segs: KeySegment[] = [];
    let startBar = this.slots[0].barIndex;
    let currentKey = path[0];
    for (let i = 1; i < N; i++) {
      if (path[i] !== currentKey) {
        segs.push({
          startBar,
          endBar: this.slots[i - 1].barIndex,
          key: currentKey,
        });
        startBar = this.slots[i].barIndex;
        currentKey = path[i];
      }
    }
    segs.push({
      startBar,
      endBar: this.slots[N - 1].barIndex,
      key: currentKey,
    });
    this.segments = segs;
  }

  getKeyPath(): string[] {
    return [...this.keyPath];
  }

  getSegments(): KeySegment[] {
    return [...this.segments];
  }
}
