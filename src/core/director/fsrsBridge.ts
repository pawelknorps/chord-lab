/**
 * Phase 5: Director Engine – bridge to ts-fsrs for per-item scheduling.
 */
import { fsrs, createEmptyCard, Rating, type Card, type Grade } from 'ts-fsrs';
import { useDirectorStore } from './useDirectorStore';
import type { ItemId } from './directorTypes';

const f = fsrs();

/** Rating for a review (Again=1, Hard=2, Good=3, Easy=4). */
export type FSRSRating = Grade;

/** Get current FSRS card state for an item, or null if never reviewed. */
export function getState(itemId: ItemId): Card | null {
  return useDirectorStore.getState().getCard(itemId);
}

/** Record a review and persist updated card. Returns the new card. */
export function recordReview(itemId: ItemId, rating: FSRSRating): Card {
  const store = useDirectorStore.getState();
  let card = store.getCard(itemId);
  if (!card) {
    card = createEmptyCard(new Date());
    store.setCard(itemId, card);
  }
  const now = new Date();
  const result = f.next(card, now, rating);
  store.setCard(itemId, result.card);
  return result.card;
}

const R_THRESHOLD = 0.85; // consider due if retrievability below this

/** Due items: nextReview <= now or R below threshold. Sorted by due date (soonest first). */
export function getDueItems(itemIds: ItemId[], now: Date = new Date()): ItemId[] {
  const store = useDirectorStore.getState();
  const withDue: { itemId: ItemId; due: number; r: number }[] = [];
  for (const itemId of itemIds) {
    const card = store.getCard(itemId);
    if (!card) continue;
    const due = card.due.getTime();
    if (due <= now.getTime()) {
      withDue.push({ itemId, due, r: 0 });
      continue;
    }
    try {
      const r = f.get_retrievability(card, now, false);
      if (typeof r === 'number' && r < R_THRESHOLD) {
        withDue.push({ itemId, due, r });
      }
    } catch {
      // ignore
    }
  }
  return withDue.sort((a, b) => a.due - b.due).map((x) => x.itemId);
}

/** New items: not yet in FSRS store. From candidate list. */
export function getNextNewItems(
  candidateItemIds: ItemId[],
  limit: number = 10
): ItemId[] {
  const store = useDirectorStore.getState();
  const out: ItemId[] = [];
  for (const itemId of candidateItemIds) {
    if (out.length >= limit) break;
    if (!store.hasItem(itemId)) out.push(itemId);
  }
  return out;
}

/**
 * Map session outcome to FSRS rating. Call when a run completes (e.g. JazzKiller session).
 * - Easy: mastered or very high BPM/accuracy
 * - Good: solid run
 * - Hard: struggled
 * - Again: poor / need to repeat
 */
export function recordReviewFromOutcome(
  itemId: ItemId,
  opts: { accuracy?: number; bpm?: number; mastered?: boolean }
): Card {
  const { accuracy = 0.5, bpm = 0, mastered = false } = opts;
  let rating: FSRSRating = Rating.Good;
  if (mastered || (accuracy >= 0.9 && bpm >= 120)) rating = Rating.Easy;
  else if (accuracy >= 0.7 && bpm >= 80) rating = Rating.Good;
  else if (accuracy >= 0.5 || bpm >= 60) rating = Rating.Hard;
  else rating = Rating.Again;
  return recordReview(itemId, rating);
}

export { Rating };
