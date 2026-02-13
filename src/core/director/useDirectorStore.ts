/**
 * Phase 5: Director Engine – persisted FSRS state per practice item.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Card } from 'ts-fsrs';
import type { ItemId } from './directorTypes';
import type { FSRSStateSnapshot } from './directorTypes';

const SERIALIZE = 'pawelsonik-director-fsrs';

function cardToSnapshot(card: Card): FSRSStateSnapshot {
  return {
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.getTime() : null,
  };
}

function snapshotToCard(sn: FSRSStateSnapshot): Card {
  return {
    due: new Date(sn.due),
    stability: sn.stability,
    difficulty: sn.difficulty,
    scheduled_days: sn.scheduled_days,
    learning_steps: sn.learning_steps,
    reps: sn.reps,
    lapses: sn.lapses,
    state: sn.state,
    last_review: sn.last_review != null ? new Date(sn.last_review) : undefined,
  };
}

interface DirectorStore {
  /** FSRS card state per item id (serializable). */
  cards: Record<ItemId, FSRSStateSnapshot>;

  setCard: (itemId: ItemId, card: Card) => void;
  getCard: (itemId: ItemId) => Card | null;
  getSnapshot: (itemId: ItemId) => FSRSStateSnapshot | null;
  hasItem: (itemId: ItemId) => boolean;
  allItemIds: () => ItemId[];
}

export const useDirectorStore = create<DirectorStore>()(
  persist(
    (set, get) => ({
      cards: {},

      setCard(itemId, card) {
        set((state) => ({
          cards: { ...state.cards, [itemId]: cardToSnapshot(card) },
        }));
      },

      getCard(itemId) {
        const sn = get().cards[itemId];
        return sn != null ? snapshotToCard(sn) : null;
      },

      getSnapshot(itemId) {
        return get().cards[itemId] ?? null;
      },

      hasItem(itemId) {
        return itemId in get().cards;
      },

      allItemIds() {
        return Object.keys(get().cards);
      },
    }),
    { name: SERIALIZE }
  )
);
