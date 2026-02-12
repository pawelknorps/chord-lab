/**
 * Phase 17: Innovative Interactive Exercises – shared types.
 */

/** Single event in a jazz lick (note or ghost slot). */
export interface LickEvent {
  /** Note name (e.g. "C4") or empty for ghost. */
  pitch: string;
  /** Duration in seconds or Tone.js notation (e.g. "8n"). */
  duration: number | string;
  /** Start time offset from lick start (seconds). */
  timeOffset: number;
  /** If true, this slot is the "ghost" the student must fill. */
  isGhost: boolean;
  /** MIDI number for non-ghost notes; for ghost, target MIDI the student should play. */
  midi?: number;
}

/** A short jazz lick with exactly one ghost note. */
export interface GhostNoteLick {
  id: string;
  name: string;
  /** BPM for timing (optional). */
  bpm?: number;
  events: LickEvent[];
  /** Index in events of the ghost slot. */
  ghostIndex: number;
}

/** Scale degree intonation result for heatmap. */
export type IntonationClassification = 'et' | 'just' | 'out';

export interface ScaleDegreeResult {
  degree: number;
  cents: number;
  classification: IntonationClassification;
}
