/**
 * Phase 5: Director Engine – practice item and FSRS types.
 */

/** Unique id for a practice item (song+key, lick, or exercise). */
export type ItemId = string;

/** Format: song:${title}:${key} | lick:${id} | exercise:${slug} */
export function formatSongItemId(title: string, key: string): ItemId {
  return `song:${title}:${key}`;
}

export function formatLickItemId(id: string): ItemId {
  return `lick:${id}`;
}

export function formatExerciseItemId(slug: string): ItemId {
  return `exercise:${slug}`;
}

export function parseItemId(itemId: ItemId): { type: 'song' | 'lick' | 'exercise'; title?: string; key?: string; id?: string; slug?: string } {
  if (itemId.startsWith('song:')) {
    const rest = itemId.slice(5);
    const lastColon = rest.lastIndexOf(':');
    const title = lastColon >= 0 ? rest.slice(0, lastColon) : rest;
    const key = lastColon >= 0 ? rest.slice(lastColon + 1) : 'C';
    return { type: 'song', title, key };
  }
  if (itemId.startsWith('lick:')) return { type: 'lick', id: itemId.slice(5) };
  if (itemId.startsWith('exercise:')) return { type: 'exercise', slug: itemId.slice(9) };
  return { type: 'song', title: itemId, key: 'C' };
}

/** Persisted FSRS state for one item (Card-compatible, serializable). */
export interface FSRSStateSnapshot {
  due: number; // ms
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number; // State enum
  last_review?: number | null; // ms
}

/** Director decision: what to practice next and how. */
export interface DirectorDecision {
  nextItemId: ItemId;
  suggestedBpm?: number;
  instrumentId?: DirectorInstrumentId;
}

/** Instrument id for context injection (timbre variation). */
export type DirectorInstrumentId = 'piano' | 'cello' | 'synth';
