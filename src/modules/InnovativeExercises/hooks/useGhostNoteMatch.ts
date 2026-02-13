import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { frequencyToNote } from '../../../core/audio/frequencyToNote';
import * as Note from '@tonaljs/note';
import type { GhostNoteLick } from '../types';
import { getGhostTargetMidi } from '../data/ghostNoteLicks';
import { triggerAttackRelease, isAudioReady, initAudio } from '../../../core/audio/globalAudio';
import { useExerciseInputAdapter, type ExerciseInputSource } from '../../JazzKiller/core/ExerciseInputAdapter';

const CENTS_MATCH_THRESHOLD = 15;
const POLL_INTERVAL_MS = 50;
const MIN_CLARITY = 0.55;
const GHOST_LISTEN_MS = 2000;

/** Play replacement note: prefer globalAudio piano; fallback to Tone.Synth so feedback always plays (piano buffers load async). */
function playReplacementNote(targetMidi: number) {
  const noteName = Note.fromMidi(targetMidi);
  if (!noteName) return;
  if (isAudioReady()) {
    try {
      triggerAttackRelease(targetMidi, 0.25, undefined, 0.6);
      return;
    } catch {
      // Piano buffer not loaded yet; use synth fallback
    }
  }
  const syn = new Tone.Synth({ oscillator: { type: 'sine' }, volume: -6 }).toDestination();
  syn.triggerAttackRelease(noteName, 0.25, Tone.now(), 0.6);
  setTimeout(() => syn.dispose(), 400);
}

export type GhostNoteMatchStatus = 'idle' | 'playing' | 'ghost_listening' | 'matched' | 'done';

export function useGhostNoteMatch(lick: GhostNoteLick, inputSource: ExerciseInputSource = 'mic') {
  const [status, setStatus] = useState<GhostNoteMatchStatus>('idle');
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isListeningRef = useRef(false);
  const targetMidi = getGhostTargetMidi(lick);
  const targetPitchClass = targetMidi != null ? Note.pitchClass(Note.fromMidi(targetMidi)) : undefined;

  // Mic: keep adapter active when Mic selected so mic is warm before "Play Lick". MIDI: only when listening.
  const adapterActive = inputSource === 'mic' ? true : status === 'ghost_listening';
  const { getCurrentNote, isReady } = useExerciseInputAdapter(inputSource, adapterActive);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
  }, []);

  const playReplacement = useCallback(() => {
    if (targetMidi == null) return;
    playReplacementNote(targetMidi);
  }, [targetMidi]);

  const checkMatch = useCallback(() => {
    if (!isListeningRef.current || targetPitchClass == null) return;
    if (inputSource === 'midi') {
      const midi = getCurrentNote();
      if (midi == null) return;
      const pc = Note.pitchClass(Note.fromMidi(midi));
      if (pc !== targetPitchClass) return;
      isListeningRef.current = false;
      setStatus('matched');
      playReplacement();
      return;
    }
    const pitch = useITMPitchStore.getState().getLatestPitch();
    if (!pitch || pitch.clarity < MIN_CLARITY || pitch.frequency <= 0) return;
    const info = frequencyToNote(pitch.frequency);
    if (!info) return;
    if (info.pitchClass !== targetPitchClass) return;
    if (!info.isPerfectIntonation && Math.abs(info.centsDeviation) > CENTS_MATCH_THRESHOLD) return;
    isListeningRef.current = false;
    setStatus('matched');
    playReplacement();
  }, [targetPitchClass, playReplacement, inputSource, getCurrentNote]);

  useEffect(() => {
    if (status !== 'ghost_listening') return;
    isListeningRef.current = true;
    const id = setInterval(checkMatch, POLL_INTERVAL_MS);
    return () => {
      isListeningRef.current = false;
      clearInterval(id);
    };
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
          const doneT = setTimeout(() => {
            setStatus(s => (s === 'ghost_listening' ? 'done' : s));
            isListeningRef.current = false;
          }, GHOST_LISTEN_MS);
          timeoutsRef.current.push(doneT);
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
    isReady,
  };
}
