/**
 * Latency-aware drill hook (Phase 14.4).
 * When checking a beat, we look back in pitch history by L_total so we judge
 * the note that was actually playing at the moment of the beat, not the delayed reading.
 */

import { useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { getPitchAudioContext } from '../../../core/audio/sharedAudioContext';
import { getSystemLatency, getAdjustedNote, getAdjustedNoteClosest } from '../../../core/audio/LatencyEngine';
import {
  initPitchHistory,
  startPitchHistory,
  stopPitchHistory,
  getPitchHistory,
} from '../../../core/audio/pitchHistory';
import { useITMPitchStore } from '../state/useITMPitchStore';

export interface UseDrillWithLatencyOptions {
  /** Called when the student played the correct note at the beat (latency-adjusted). */
  onSuccess?: () => void;
  /** Called when the note was wrong or not found in the look-back window. */
  onFailure?: () => void;
  /** Whether the drill is active (start/stop pitch history). */
  active?: boolean;
  /** Use closest match in history within maxDelta instead of exact window. Default true for robustness. */
  useClosest?: boolean;
  /** Max time delta (seconds) when useClosest is true. Default 0.05. */
  maxDeltaSeconds?: number;
}

/**
 * Hook that provides latency-aware beat checking.
 * Start pitch history when active; registerPass(targetMidi) checks the note at (now - L_total).
 */
export function useDrillWithLatency(options: UseDrillWithLatencyOptions = {}) {
  const {
    onSuccess,
    onFailure,
    active = true,
    useClosest = true,
    maxDeltaSeconds = 0.05,
  } = options;

  const getLatestPitch = useITMPitchStore((s) => s.getLatestPitch);
  const isReady = useITMPitchStore((s) => s.isReady);

  useEffect(() => {
    initPitchHistory({
      getNowSeconds: () => (typeof Tone?.now === 'function' ? Tone.now() : performance.now() / 1000),
    });
  }, []);

  useEffect(() => {
    if (active && isReady) {
      startPitchHistory(
        () => {
          const r = getLatestPitch();
          if (!r) return null;
          return { frequency: r.frequency, clarity: r.clarity };
        },
        16
      );
    } else {
      stopPitchHistory();
    }
    return () => {
      stopPitchHistory();
    };
  }, [active, isReady, getLatestPitch]);

  const registerPass = useCallback(
    (targetMidi: number) => {
      const ctx = getPitchAudioContext().context;
      const lag = getSystemLatency(ctx);
      const history = getPitchHistory();
      const targetTime = typeof Tone?.now === 'function' ? Tone.now() : performance.now() / 1000;

      const entry = useClosest
        ? getAdjustedNoteClosest(history, targetTime, lag, maxDeltaSeconds)
        : getAdjustedNote(history, targetTime, lag);

      if (entry != null && Math.round(entry.midi) === Math.round(targetMidi)) {
        onSuccess?.();
      } else {
        onFailure?.();
      }
    },
    [onSuccess, onFailure, useClosest, maxDeltaSeconds]
  );

  return {
    registerPass,
    getPitchHistory,
    getSystemLatency: () => getSystemLatency(getPitchAudioContext().context),
  };
}
