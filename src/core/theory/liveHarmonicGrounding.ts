/**
 * Phase 21 Wave 5: Live Harmonic Grounding
 *
 * REQ-HAT-12: Conflict Resolver (chart vs. performance → subV7).
 * REQ-HAT-13: Pedal Point Detection (sustained low pitch).
 * REQ-HAT-14: getLiveOverrides(chartChord, pitchBuffer) API.
 */

import * as Note from '@tonaljs/note';
import { getChordDna, getChordToneLabelMap } from './ChordDna';

/** Single sample from SwiftF0 or pitch pipeline (frequency in Hz; optional timestamp). */
export interface PitchBufferEntry {
  frequency: number;
  timestamp?: number;
}

/** Overrides or annotations for the current segment (no full re-segmentation). */
export interface LiveOverrides {
  romanNumeral?: string;
  pedal?: string;
  /** Chord tone/extension of the latest mic pitch (e.g. "R", "M3", "b7", "9", "#11"). Only set when showLiveChordTone is on. */
  chordTone?: string;
}

/** Default bass cutoff (Hz): pitches below are considered "bass" for pedal detection. */
export const PEDAL_BASS_HZ = 250;

/** Min samples in buffer to consider conflict or pedal. */
export const MIN_SAMPLES = 8;

/** Min fraction of samples that must match tritone sub PCs to suggest subV7 (e.g. 0.35). */
export const TRITONE_SUB_RATIO = 0.35;

/** Min fraction of bass samples on one PC to report pedal (e.g. 0.4). */
export const PEDAL_DOMINANCE = 0.4;

/**
 * Pitch class (0–11) from frequency.
 */
function frequencyToPitchClass(frequency: number): number {
  if (frequency <= 0) return -1;
  const midi = Note.midi(Note.fromFreq(frequency));
  if (midi == null || Number.isNaN(midi)) return -1;
  return midi % 12;
}

/**
 * REQ-HAT-12: Conflict Resolver.
 * If chart says dominant (e.g. C7) but pitch buffer shows student consistently playing
 * tritone sub chord tones (F#/Gb, Bb, C for Gb7), return romanNumeral: "subV7".
 */
function resolveConflict(chartChord: string, pitchClasses: number[]): string | undefined {
  const dna = getChordDna(chartChord);
  if (!dna) return undefined;
  const { extension, core } = dna;
  const isDom7 =
    extension.hasSeventh &&
    core.third === 'major' &&
    core.fifth === 'perfect' &&
    !dna.intervalNames.includes('7M');
  if (!isDom7) return undefined;

  const rootPc = Note.chroma(dna.root) ?? 0;
  const chartRoot = rootPc;
  const chartThird = (chartRoot + 4) % 12;
  const chartSeventh = (chartRoot + 10) % 12;
  const chartPcs = new Set([chartRoot, chartThird, (chartRoot + 7) % 12, chartSeventh]);

  const subRoot = (chartRoot + 6) % 12;
  const subPcs = new Set([
    subRoot,
    (subRoot + 4) % 12,
    (subRoot + 7) % 12,
    (subRoot + 10) % 12,
  ]);

  let chartCount = 0;
  let subCount = 0;
  for (const pc of pitchClasses) {
    if (pc < 0) continue;
    if (chartPcs.has(pc)) chartCount++;
    if (subPcs.has(pc)) subCount++;
  }
  const total = pitchClasses.filter((p) => p >= 0).length;
  if (total < MIN_SAMPLES) return undefined;
  if (subCount / total >= TRITONE_SUB_RATIO && subCount >= chartCount) return 'subV7';
  return undefined;
}

/**
 * REQ-HAT-13: Pedal Point Detection.
 * If buffer has sustained low pitch (bass range), return pedal note name (e.g. "G").
 */
function detectPedal(entries: PitchBufferEntry[]): string | undefined {
  const bass = entries.filter((e) => e.frequency > 0 && e.frequency < PEDAL_BASS_HZ);
  if (bass.length < MIN_SAMPLES) return undefined;

  const pcs: number[] = bass.map((e) => frequencyToPitchClass(e.frequency)).filter((p) => p >= 0);
  if (pcs.length < MIN_SAMPLES) return undefined;

  const counts: Record<number, number> = {};
  for (const pc of pcs) {
    counts[pc] = (counts[pc] ?? 0) + 1;
  }
  let maxPc = 0;
  let maxCount = 0;
  for (const [pcStr, c] of Object.entries(counts)) {
    const pc = Number(pcStr);
    if (c > maxCount) {
      maxCount = c;
      maxPc = pc;
    }
  }
  if (maxCount / pcs.length < PEDAL_DOMINANCE) return undefined;

  const noteName = Note.pitchClass(Note.fromMidi(60 + maxPc));
  return noteName || undefined;
}

/**
 * Tritone sub chord symbol from chart dominant (e.g. C7 → Gb7).
 */
function getTritoneSubChordSymbol(chartChord: string): string {
  const dna = getChordDna(chartChord);
  if (!dna) return chartChord;
  const rootPc = Note.chroma(dna.root) ?? 0;
  const subPc = (rootPc + 6) % 12;
  const subRootName = Note.pitchClass(Note.fromMidi(60 + subPc)) ?? 'C';
  const match = chartChord.trim().match(/^([A-Ga-g][b#]?)(.*)$/);
  const rest = match ? match[2] ?? '' : chartChord.slice(1);
  return subRootName + rest;
}

/**
 * Classify a single pitch as a chord tone/extension of the given chord.
 * Returns label from ChordDna (e.g. "R", "M3", "5", "b7", "9", "#11") or undefined if not in chord.
 */
export function classifyChordTone(chordSymbol: string, frequency: number): string | undefined {
  if (!chordSymbol || frequency <= 0) return undefined;
  const map = getChordToneLabelMap(chordSymbol);
  const dna = getChordDna(chordSymbol);
  if (!map || !dna) return undefined;
  const rootPc = Note.chroma(dna.root) ?? 0;
  const notePc = frequencyToPitchClass(frequency);
  if (notePc < 0) return undefined;
  const interval = (notePc - rootPc + 12) % 12;
  return map[interval];
}

/**
 * REQ-HAT-14: Live Grounding API.
 * Consumes chart chord at time t and pitch buffer (SwiftF0 stream); returns overrides
 * for the current segment. Lightweight; no full re-segmentation.
 */
export function getLiveOverrides(
  chartChord: string,
  pitchBuffer: PitchBufferEntry[]
): LiveOverrides {
  const result: LiveOverrides = {};

  if (!chartChord || !pitchBuffer || pitchBuffer.length < MIN_SAMPLES) return result;

  const pitchClasses = pitchBuffer
    .map((e) => frequencyToPitchClass(e.frequency))
    .filter((p) => p >= 0);

  const subV7 = resolveConflict(chartChord, pitchClasses);
  if (subV7) result.romanNumeral = subV7;

  const pedal = detectPedal(pitchBuffer);
  if (pedal) result.pedal = pedal;

  const effectiveChord =
    result.romanNumeral === 'subV7' ? getTritoneSubChordSymbol(chartChord) : chartChord;
  const lastEntry = pitchBuffer[pitchBuffer.length - 1];
  if (lastEntry?.frequency) {
    const label = classifyChordTone(effectiveChord, lastEntry.frequency);
    if (label) result.chordTone = label;
  }

  return result;
}
