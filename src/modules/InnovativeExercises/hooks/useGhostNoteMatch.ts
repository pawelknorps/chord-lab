import { useCallback, useEffect, useRef, useState } from 'react';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { frequencyToNote } from '../../../core/audio/frequencyToNote';
import * as Note from '@tonaljs/note';
import type { GhostNoteLick } from '../types';
import { getGhostTargetMidi } from '../data/ghostNoteLicks';
import { triggerAttackRelease, isAudioReady, initAudio } from '../../../core/audio/globalAudio';

const CENTS_MATCH_THRESHOLD = 10;
const POLL_INTERVAL_MS = 50;
const MIN_CLARITY = 0.7;

export type GhostNoteMatchStatus = 'idle' | 'playing' | 'ghost_listening' | 'matched' | 'done';

export function useGhostNoteMatch(lick: GhostNoteLick) {
  const [status, setStatus] = useState<GhostNoteMatchStatus>('idle');
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const targetMidi = getGhostTargetMidi(lick);
  const targetPitchClass = targetMidi != null ? Note.pitchClass(Note.fromMidi(targetMidi)) : undefined;

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const playReplacement = useCallback(() => {
    if (targetMidi == null || !isAudioReady()) return;
    triggerAttackRelease(targetMidi, 0.25, undefined, 0.6);
  }, [targetMidi]);

  const checkMatch = useCallback(() => {
    if (status !== 'ghost_listening' || targetPitchClass == null) return;
    const pitch = useITMPitchStore.getState().getLatestPitch();
    if (!pitch || pitch.clarity < MIN_CLARITY || pitch.frequency <= 0) return;
    const info = frequencyToNote(pitch.frequency);
    if (!info) return;
    if (info.pitchClass !== targetPitchClass) return;
    if (!info.isPerfectIntonation && Math.abs(info.centsDeviation) > CENTS_MATCH_THRESHOLD) return;
    setStatus('matched');
    playReplacement();
  }, [status, targetPitchClass, playReplacement]);

  useEffect(() => {
    if (status !== 'ghost_listening') return;
    const id = setInterval(checkMatch, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [status, checkMatch]);

  const startLick = useCallback(async () => {
    clearTimeouts();
    if (!isAudioReady()) await initAudio();
    setStatus('playing');

    for (let i = 0; i < lick.events.length; i++) {
      const ev = lick.events[i];
      const delayMs = ev.timeOffset * 1000;
      const t = setTimeout(() => {
        if (ev.isGhost) {
          setStatus('ghost_listening');
          // Ghost window: listen for ~duration of one 8th; then auto-advance to done if no match
          const ghostDurationMs = (typeof ev.duration === 'number' ? ev.duration : 0.25) * 1000;
          setTimeout(() => {
            setStatus(s => (s === 'ghost_listening' ? 'done' : s));
          }, ghostDurationMs);
        } else if (ev.midi != null) {
          if (isAudioReady()) triggerAttackRelease(ev.midi, 0.25, undefined, 0.5);
        }
      }, delayMs);
      timeoutsRef.current.push(t);
    }

    const totalDurationMs = lick.events.reduce((acc, e) => {
      const dur = typeof e.duration === 'number' ? e.duration : 0.25;
      return Math.max(acc, (e.timeOffset + dur) * 1000);
    }, 0);
    const endT = setTimeout(() => {
      setStatus(s => (s === 'playing' || s === 'ghost_listening' ? 'done' : s));
    }, totalDurationMs + 500);
    timeoutsRef.current.push(endT);
  }, [lick, clearTimeouts]);

  const reset = useCallback(() => {
    clearTimeouts();
    setStatus('idle');
  }, [clearTimeouts]);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  return {
    status,
    startLick,
    reset,
    targetNoteName: targetMidi != null ? Note.fromMidi(targetMidi) : undefined,
    matched: status === 'matched',
  };
}
