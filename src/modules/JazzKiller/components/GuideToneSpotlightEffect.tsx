import { useEffect, useRef } from 'react';
import * as Note from '@tonaljs/note';
import { useSignals } from '@preact/signals-react/runtime';
import { currentMeasureIndexSignal } from '../state/jazzSignals';
import { usePracticeStore } from '../../../core/store/usePracticeStore';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { useMicrophone } from '../../../hooks/useMicrophone';

/**
 * When Guide Tone Spotlight is on and mic is active, compares live note to the 3rd
 * of the current chord for the current measure; marks bar as hit when they match (REQ-MIC-12).
 * Uses high-performance SwiftF0 pitch detection (2026).
 */
export function GuideToneSpotlightEffect(): null {
  useSignals();
  const { guideToneSpotlightMode, guideTones, currentSong, addGuideToneBarHit } = usePracticeStore();
  const { stream, isActive: micActive } = useMicrophone();
  const { isReady, getLatestPitch } = useHighPerformancePitch(stream);
  const lastHitMeasureRef = useRef<number | null>(null);

  useEffect(() => {
    if (!guideToneSpotlightMode || !isReady || !micActive || !currentSong) return;

    let rafId: number;

    const loop = () => {
      const result = getLatestPitch();

      if (result && result.clarity > 0.9) {
        const liveNote = Note.fromFreq(result.frequency);
        const measureIndex = currentMeasureIndexSignal.value;

        if (measureIndex >= 0) {
          const gts = guideTones.get(measureIndex);
          const targetThird = gts?.[0]?.third;

          if (targetThird) {
            const livePc = Note.chroma(liveNote);
            const targetPc = Note.chroma(targetThird.length === 1 ? targetThird + '4' : targetThird);

            if (livePc !== undefined && targetPc !== undefined && livePc === targetPc) {
              if (lastHitMeasureRef.current !== measureIndex) {
                addGuideToneBarHit(measureIndex);
                lastHitMeasureRef.current = measureIndex;
              }
            }
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [guideToneSpotlightMode, isReady, micActive, guideTones, currentSong, addGuideToneBarHit, getLatestPitch]);

  return null;
}
