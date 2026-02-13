/**
 * Phase 17 Wave 2: Swing Pocket analysis.
 * Given BPM, recording start time, and onset timestamps (performance.now()),
 * computes swing ratio and average grid offset (push/lay back) in ms.
 */

import type { SwingPocketResult } from '../types';

const MIN_ONSETS_PER_BEAT = 2;
const DEBOUNCE_MS = 80;

/**
 * Assign onset timestamps to beats and 8th positions.
 * startTime = performance.now() when "beat 0" (first downbeat) was.
 * Returns list of { beatIndex, eighth (0 or 1), time }.
 */
function assignOnsetsToGrid(
  startTime: number,
  bpm: number,
  onsets: number[]
): { beatIndex: number; eighth: number; time: number }[] {
  const beatMs = 60000 / bpm;
  const sorted = [...onsets].sort((a, b) => a - b);
  const out: { beatIndex: number; eighth: number; time: number }[] = [];

  for (const t of sorted) {
    const elapsed = t - startTime;
    if (elapsed < 0) continue;
    const beatIndex = Math.floor(elapsed / beatMs);
    const posInBeat = (elapsed % beatMs) / beatMs;
    const eighth = posInBeat < 0.5 ? 0 : 1;
    out.push({ beatIndex, eighth, time: t });
  }
  return out;
}

/**
 * Deduplicate onsets that are very close (same "hit").
 */
function dedupeOnsets(onsets: number[], minDeltaMs: number = DEBOUNCE_MS): number[] {
  if (onsets.length <= 1) return onsets;
  const sorted = [...onsets].sort((a, b) => a - b);
  const out: number[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - out[out.length - 1] >= minDeltaMs) out.push(sorted[i]);
  }
  return out;
}

/**
 * Compute swing ratio and average offset from onset timestamps.
 * startTime = performance.now() at first downbeat; onsets = performance.now() for each hit.
 */
export function computeSwingPocket(
  bpm: number,
  startTime: number,
  onsets: number[]
): SwingPocketResult {
  const beatMs = 60000 / bpm;
  const deduped = dedupeOnsets(onsets);
  const assigned = assignOnsetsToGrid(startTime, bpm, deduped);

  // Group by beat: beatIndex -> list of { eighth, time }
  const byBeat = new Map<number, { eighth: number; time: number }[]>();
  for (const { beatIndex, eighth, time } of assigned) {
    if (!byBeat.has(beatIndex)) byBeat.set(beatIndex, []);
    byBeat.get(beatIndex)!.push({ eighth, time });
  }

  const ratios: number[] = [];
  const offsets: number[] = [];

  for (const [beatIndex, hits] of byBeat) {
    const sorted = hits.sort((a, b) => a.time - b.time);
    if (sorted.length < MIN_ONSETS_PER_BEAT) continue;

    // Assume first two hits in the beat are 8th 1 and 8th 2 (allow small tolerance)
    const t1 = sorted[0].time;
    const t2 = sorted[1].time;
    const beatStart = startTime + beatIndex * beatMs;
    const beatEnd = beatStart + beatMs;
    const firstDuration = t2 - t1;
    const secondDuration = beatEnd - t2;
    if (secondDuration > 1) {
      const ratio = firstDuration / secondDuration;
      ratios.push(ratio);
    }
    // Offset: grid for first 8th = beatStart, for second = beatStart + halfBeat
    const halfBeat = beatMs / 2;
    for (let i = 0; i < sorted.length; i++) {
      const grid = beatStart + (sorted[i].eighth === 0 ? 0 : halfBeat);
      offsets.push(sorted[i].time - grid);
    }
  }

  const avgRatio = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 2;
  const avgOffsetMs = offsets.length > 0 ? offsets.reduce((a, b) => a + b, 0) / offsets.length : 0;

  return {
    ratio: Math.round(avgRatio * 100) / 100,
    offsetMs: Math.round(avgOffsetMs * 100) / 100,
    beatCount: byBeat.size,
  };
}
