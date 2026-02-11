/**
 * Adaptive curriculum: repeat on struggle, harder when ready.
 * Phase 9 Steps 35-36; REQ-ADAPT-01, REQ-ADAPT-02.
 */

import { useEarPerformanceStore } from '../state/useEarPerformanceStore';

export const STRUGGLE_THRESHOLD = 3;
export const READY_STREAK = 3;
export const READY_SUCCESS_RATE = 0.7;
export const RECENT_ATTEMPTS_FOR_RATE = 10;

export function shouldRepeatSimilar(): boolean {
  const state = useEarPerformanceStore.getState();
  return state.consecutiveMistakes >= STRUGGLE_THRESHOLD;
}

export function shouldIncreaseDifficulty(): boolean {
  const state = useEarPerformanceStore.getState();
  if (state.consecutiveCorrect < READY_STREAK) return false;

  let recentSuccess = 0;
  let recentTotal = 0;
  for (const level of Object.keys(state.byLevel)) {
    for (const itemKey of Object.keys(state.byLevel[level])) {
      const item = state.byLevel[level][itemKey];
      const total = item.success + item.fail;
      recentSuccess += item.success;
      recentTotal += total;
    }
  }
  if (recentTotal < 3) return false;
  return recentSuccess / recentTotal >= READY_SUCCESS_RATE;
}

/** Similar intervals: same or ±1 semitone. */
const SEMITONE_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const INTERVAL_BY_SEMITONES: Record<number, string> = {
  1: 'm2', 2: 'M2', 3: 'm3', 4: 'M3', 5: 'P4', 6: '#4/b5', 7: 'P5',
  8: 'm6', 9: 'M6', 10: 'm7', 11: 'M7', 12: 'P8',
};

function getSimilarIntervals(itemKey: string): string[] {
  const s = Object.entries(INTERVAL_BY_SEMITONES).find(([, n]) => n === itemKey)?.[0];
  if (s == null) return [itemKey];
  const idx = SEMITONE_ORDER.indexOf(Number(s));
  const similar: string[] = [itemKey];
  if (idx > 0) similar.push(INTERVAL_BY_SEMITONES[SEMITONE_ORDER[idx - 1]]);
  if (idx < SEMITONE_ORDER.length - 1) similar.push(INTERVAL_BY_SEMITONES[SEMITONE_ORDER[idx + 1]]);
  return similar;
}

/** Chord quality categories for similarity. */
const TRIAD_QUALITIES = ['Major', 'Minor', 'Diminished', 'Augmented'];
const SEVENTH_QUALITIES = ['Maj7', 'min7', 'Dom7', 'm7b5', 'Dim7'];

function getSimilarQualities(itemKey: string): string[] {
  if (TRIAD_QUALITIES.includes(itemKey)) return TRIAD_QUALITIES;
  if (SEVENTH_QUALITIES.includes(itemKey)) return SEVENTH_QUALITIES;
  return [itemKey];
}

/** Harder intervals: m2, M7 (outer edges). */
const BASE_INTERVALS = ['M2', 'm3', 'M3', 'P4', '#4/b5', 'P5', 'm6', 'M6', 'm7'];
const EXTENDED_INTERVALS = ['m2', 'M2', 'm3', 'M3', 'P4', '#4/b5', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];

export interface PoolItem {
  name: string;
  semitones?: number;
  intervals?: number[];
  label?: string;
  flavor?: string;
}

/**
 * Returns the next challenge item. When struggling, picks from similar items.
 * When ready, picks from extended (harder) pool if available.
 */
export function getNextChallenge<T extends PoolItem>(
  level: 'Intervals' | 'ChordQualities',
  basePool: T[],
  extendedPool: T[] | null,
  lastItemKey: string | null
): T {
  const state = useEarPerformanceStore.getState();
  const doRepeat = shouldRepeatSimilar();
  const doHarder = extendedPool && extendedPool.length > 0 && shouldIncreaseDifficulty();

  const pool = doHarder ? extendedPool : basePool;

  if (doRepeat && lastItemKey) {
    const similar =
      level === 'Intervals'
        ? getSimilarIntervals(lastItemKey)
        : getSimilarQualities(lastItemKey);
    const candidates = pool.filter((item) => similar.includes(item.name));
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
