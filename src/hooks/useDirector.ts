/**
 * Phase 5: Director Engine – hook for Director-driven next item and instrument.
 */
import { useState, useCallback } from 'react';
import { getNextDecision } from '../core/director/DirectorService';
import { setDirectorInstrument } from '../core/audio/directorInstrumentSignal';
import type { ItemId } from '../core/director/directorTypes';
import type { DirectorDecision } from '../core/director/directorTypes';
import type { DirectorSessionContext } from '../core/director/DirectorService';

export interface UseDirectorResult {
  /** Current next item decision (null if no candidates or none due/new). */
  nextItem: DirectorDecision | null;
  /** Load the next decision and apply instrument. Returns the new decision (if any). */
  advance: () => DirectorDecision | null;
  /** Set the guide instrument directly (piano | cello | synth). */
  setInstrument: (id: 'piano' | 'cello' | 'synth') => void;
}

/**
 * Provides Director-driven next practice item and instrument.
 * Pass candidateItemIds (e.g. song:title:key for all standards × keys); advance() picks next and rotates timbre.
 */
export function useDirector(
  candidateItemIds: ItemId[],
  context: DirectorSessionContext = {}
): UseDirectorResult {
  const [lastInstrumentIndex, setLastInstrumentIndex] = useState(-1);
  const [nextItem, setNextItem] = useState<DirectorDecision | null>(() =>
    getNextDecision(candidateItemIds, context, -1)
  );

  const advance = useCallback((): DirectorDecision | null => {
    const next = getNextDecision(candidateItemIds, context, lastInstrumentIndex);
    setNextItem(next);
    if (next?.instrumentId) {
      setDirectorInstrument(next.instrumentId);
      setLastInstrumentIndex(
        ['piano', 'cello', 'synth'].indexOf(next.instrumentId)
      );
    }
    return next ?? null;
  }, [candidateItemIds, context, lastInstrumentIndex]);

  const setInstrument = useCallback((id: 'piano' | 'cello' | 'synth') => {
    setDirectorInstrument(id);
  }, []);

  return { nextItem, advance, setInstrument };
}
