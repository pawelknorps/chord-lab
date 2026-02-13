/**
 * LatencyEngine: Temporal alignment for the "Time-Travel Problem" (Phase 14.4).
 * Combines output, input, and inference latency so we can "look back" in pitch
 * history to see what the student was playing at the exact moment the beat occurred.
 */

/** Single entry in a pitch history buffer (timestamp in seconds, e.g. Tone.now()). */
export interface PitchHistoryEntry {
  timestamp: number;
  midi: number;
}

/**
 * Total system lag (seconds): output + input + inference.
 * 2026 standard: use ctx.outputLatency when available; add fixed input and inference estimates.
 */
export function getSystemLatency(ctx: AudioContext): number {
  const outputLag = typeof (ctx as unknown as { outputLatency?: number }).outputLatency === 'number'
    ? (ctx as unknown as { outputLatency: number }).outputLatency
    : 0;
  const inputLag = 0.02;   // avg mic buffer lag (~10–20 ms)
  const inferenceLag = 0.016; // SwiftF0 hop-size
  return outputLag + inputLag + inferenceLag;
}

/**
 * When checking a beat at targetTime (e.g. Tone.now()), we look for the note
 * that was detected (targetTime - lag) seconds ago.
 * Returns the history entry whose timestamp is within tolerance of adjustedTime.
 */
export function getAdjustedNote(
  history: PitchHistoryEntry[],
  targetTime: number,
  lag: number,
  toleranceSeconds: number = 0.01
): PitchHistoryEntry | undefined {
  const adjustedTime = targetTime - lag;
  return history.find(
    (entry) => Math.abs(entry.timestamp - adjustedTime) < toleranceSeconds
  );
}

/**
 * Find the closest history entry to (targetTime - lag) when exact match may not exist.
 * Useful for sparse or low-rate history buffers.
 */
export function getAdjustedNoteClosest(
  history: PitchHistoryEntry[],
  targetTime: number,
  lag: number,
  maxDeltaSeconds: number = 0.05
): PitchHistoryEntry | undefined {
  if (history.length === 0) return undefined;
  const adjustedTime = targetTime - lag;
  let best: PitchHistoryEntry | undefined;
  let bestDelta = maxDeltaSeconds;
  for (const entry of history) {
    const delta = Math.abs(entry.timestamp - adjustedTime);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = entry;
    }
  }
  return best;
}
