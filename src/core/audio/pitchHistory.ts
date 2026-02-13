/**
 * Pitch history ring buffer for latency-aware beat checking (Phase 14.4).
 * Maintains a short window of (timestamp, midi) so we can look back by L_total
 * when evaluating what note was playing at the moment of a beat.
 */

import type { PitchHistoryEntry } from './LatencyEngine';

const DEFAULT_CAPACITY = 256;
const DEFAULT_POLL_MS = 16; // ~60 Hz

/** Convert frequency (Hz) to integer MIDI (A4 = 69). */
function frequencyToMidi(frequency: number): number | null {
  if (frequency <= 0) return null;
  const n = 12 * Math.log2(frequency / 440);
  return Math.round(n) + 69;
}

export type PitchHistoryReader = () => { frequency: number; clarity: number } | null;

let ring: PitchHistoryEntry[] = [];
let ptr = 0;
let size = 0;
let capacity = DEFAULT_CAPACITY;
let intervalId: ReturnType<typeof setInterval> | null = null;
let reader: PitchHistoryReader | null = null;
let getNow: () => number = () => performance.now() / 1000;

/**
 * Initialize the ring buffer and optional time provider.
 * getNow() should return current time in seconds (e.g. Tone.now() when Tone is loaded).
 */
export function initPitchHistory(
  opts: {
    capacity?: number;
    getNowSeconds?: () => number;
  } = {}
): void {
  capacity = opts.capacity ?? DEFAULT_CAPACITY;
  ring = new Array(capacity);
  ptr = 0;
  size = 0;
  if (typeof opts.getNowSeconds === 'function') {
    getNow = opts.getNowSeconds;
  }
}

/**
 * Start collecting pitch history by polling the given reader at pollMs interval.
 * Call stopPitchHistory() when drill ends or component unmounts.
 */
export function startPitchHistory(
  readPitch: PitchHistoryReader,
  pollMs: number = DEFAULT_POLL_MS
): void {
  stopPitchHistory();
  reader = readPitch;
  intervalId = setInterval(() => {
    const pitch = reader?.();
    if (!pitch || pitch.frequency <= 0) return;
    const midi = frequencyToMidi(pitch.frequency);
    if (midi == null) return;
    const timestamp = getNow();
    if (size < capacity) {
      ring[size] = { timestamp, midi };
      size++;
    } else {
      ring[ptr] = { timestamp, midi };
      ptr = (ptr + 1) % capacity;
    }
  }, pollMs);
}

/**
 * Stop collecting; clears the interval. History buffer is left as-is until next start.
 */
export function stopPitchHistory(): void {
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  reader = null;
}

/**
 * Return a copy of the current history in chronological order (oldest first).
 * Used by getAdjustedNote(history, targetTime, lag).
 */
export function getPitchHistory(): PitchHistoryEntry[] {
  if (size === 0) return [];
  const out: PitchHistoryEntry[] = [];
  if (size < capacity) {
    for (let i = 0; i < size; i++) out.push(ring[i]);
  } else {
    for (let i = 0; i < capacity; i++) {
      out.push(ring[(ptr + i) % capacity]);
    }
  }
  return out;
}

/**
 * Alias for getPitchHistory() for API consistency with plan (getSwiftF0History).
 */
export function getSwiftF0History(): PitchHistoryEntry[] {
  return getPitchHistory();
}
