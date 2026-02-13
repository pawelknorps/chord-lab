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

/** Wave 2: Swing Pocket – result of analyzing onset timestamps vs grid. */
export interface SwingPocketResult {
  /** Swing ratio (first 8th / second 8th); e.g. 2 = 2:1 triplet feel. */
  ratio: number;
  /** Average offset in ms: positive = late (lay back), negative = early (push). */
  offsetMs: number;
  /** Number of beats used in the computation. */
  beatCount: number;
}

/** Wave 2: Call and Response – one aligned pair (reference vs student onset). */
export interface CallResponsePair {
  refTime: number;
  studentTime: number;
  /** ms: positive = student late, negative = student early. */
  deltaMs: number;
  /** Human-readable position e.g. "Bar 1 Beat 2 &" for overlay display. */
  refBeatLabel?: string;
}

/** Wave 2: Ghost Rhythm – 3-over-4 grid positions in beat units (0, 4/3, 8/3). */
export const GHOST_RHYTHM_GRID_BEATS = [0, 4 / 3, 8 / 3] as const;

/** Phase 30: Optional initial params for parameterized launch (AI recommendation or level). */
export interface InnovativeExerciseInitialParams {
  key?: string;
  root?: string;
  scale?: string;
  progressionId?: string;
  chords?: string[];
  lickId?: string;
  tempo?: number;
  level?: number;
  referenceBreakId?: string;
}
