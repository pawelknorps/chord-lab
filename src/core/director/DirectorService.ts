/**
 * Phase 5: Director Engine – central service that picks next item and optional instrument.
 */
import { getDueItems, getNextNewItems } from './fsrsBridge';
import type { ItemId } from './directorTypes';
import type { DirectorDecision, DirectorInstrumentId } from './directorTypes';

const INSTRUMENT_ROTATION: DirectorInstrumentId[] = ['piano', 'cello', 'synth'];

export interface DirectorSessionContext {
  /** Max number of new items to suggest in one session. */
  maxNewPerSession?: number;
  /** Time limit in minutes (optional; for future use). */
  timeLimitMinutes?: number;
  /** Keys to use for song items (default C, F, Bb, Eb). */
  keys?: string[];
}

/**
 * Get the next item to practice and optional BPM/instrument.
 * Prefers due items (low R first), then new items; rotates instrument per decision.
 * Caller should set director instrument from returned instrumentId (e.g. in useDirector).
 */
export function getNextDecision(
  candidateItemIds: ItemId[],
  context: DirectorSessionContext = {},
  lastInstrumentIndex: number = -1
): DirectorDecision | null {
  const now = new Date();
  const due = getDueItems(candidateItemIds, now);
  const maxNew = context.maxNewPerSession ?? 5;
  const newItems = getNextNewItems(
    candidateItemIds.filter((id) => !due.includes(id)),
    maxNew
  );

  const nextItemId: ItemId | null = due[0] ?? newItems[0] ?? null;
  if (!nextItemId) return null;

  const nextInstrumentIndex = (lastInstrumentIndex + 1) % INSTRUMENT_ROTATION.length;
  const instrumentId = INSTRUMENT_ROTATION[nextInstrumentIndex];

  return {
    nextItemId,
    suggestedBpm: undefined,
    instrumentId,
  };
}
