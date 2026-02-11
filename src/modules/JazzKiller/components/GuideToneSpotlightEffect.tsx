import { useEffect, useRef } from 'react';
import * as Note from '@tonaljs/note';
import { useSignals } from '@preact/signals-react/runtime';
import { currentMeasureIndexSignal } from '../state/jazzSignals';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { useAuralMirror } from '../../../hooks/useAuralMirror';

/**
 * When Guide Tone Spotlight is on and mic is active, compares live note to the 3rd
 * of the current chord for the current measure; marks bar as hit when they match (REQ-MIC-12).
 */
export function GuideToneSpotlightEffect(): null {
  useSignals();
  const { guideToneSpotlightMode, guideTones, currentSong, addGuideToneBarHit } = usePracticeStore();
  const { isActive, liveNote } = useAuralMirror();
  const lastHitMeasureRef = useRef<number | null>(null);

  useEffect(() => {
    if (!guideToneSpotlightMode || !isActive || !liveNote || !currentSong) return;

    const measureIndex = currentMeasureIndexSignal.value;
    if (measureIndex < 0) return;

    const gts = guideTones.get(measureIndex);
    const targetThird = gts?.[0]?.third; // 3rd of first chord in measure
    if (!targetThird) return;

    // Compare pitch class (ignore octave)
    const livePc = Note.chroma(liveNote);
    const targetPc = Note.chroma(targetThird.length === 1 ? targetThird + '4' : targetThird);
    if (livePc === undefined || targetPc === undefined) return;
    if (livePc !== targetPc) return;

    // Avoid re-firing for same measure within a short window
    if (lastHitMeasureRef.current === measureIndex) return;
    lastHitMeasureRef.current = measureIndex;
    addGuideToneBarHit(measureIndex);
  }, [guideToneSpotlightMode, isActive, liveNote, guideTones, currentSong, addGuideToneBarHit]);

  return null;
}
