import { useCallback, useEffect, useRef, useState } from 'react';
import * as Note from '@tonaljs/note';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { frequencyToNote } from '../../../core/audio/frequencyToNote';
import { GuideToneCalculator } from '../../../core/theory/GuideToneCalculator';
import { useExerciseInputAdapter, type ExerciseInputSource } from '../../JazzKiller/core/ExerciseInputAdapter';

const DEFAULT_PROGRESSION = ['Dm7', 'G7', 'Cmaj7'];
const POLL_INTERVAL_MS = 60;
const MIN_CLARITY = 0.7;

export function getAllowedPitchClasses(chordSymbol: string): Set<string> {
  const gt = GuideToneCalculator.calculate(chordSymbol);
  if (!gt) return new Set();
  const thirdPc = Note.pitchClass(gt.third);
  const seventhPc = Note.pitchClass(gt.seventh);
  return new Set([thirdPc, seventhPc]);
}

export type UseVoiceLeadingMazeOptions = {
  /** When set, current chord follows playback time (from transport). Omit when backing is not running. */
  playbackChordIndex?: number | null;
  /** Chord progression to use (infinite loop). If empty or omitted, uses default ii–V–I. */
  progression?: string[];
  /** When set (e.g. from jazz band currentChordSymbolSignal), guide-tone check uses this chord instead of progression[index]. */
  currentChordSymbol?: string | null;
};

export function useVoiceLeadingMaze(
  inputSource: ExerciseInputSource = 'mic',
  options: UseVoiceLeadingMazeOptions = {}
) {
  const { playbackChordIndex: playbackChordIndexProp = null, progression: progressionProp, currentChordSymbol: currentChordSymbolProp = null } = options;
  const progression = (progressionProp?.length ? progressionProp : DEFAULT_PROGRESSION) as string[];
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  /** Start muted so playback only happens when user plays a correct guide tone, not on silence. */
  const [isMuted, setIsMuted] = useState(true);
  const lastPitchClassRef = useRef<string | null>(null);

  const { getCurrentNote } = useExerciseInputAdapter(inputSource, true);

  const effectiveChordIndex =
    playbackChordIndexProp !== undefined && playbackChordIndexProp !== null
      ? Math.max(0, Math.min(playbackChordIndexProp, progression.length - 1))
      : currentChordIndex;
  const chordForGuideTones = (currentChordSymbolProp?.trim() && getAllowedPitchClasses(currentChordSymbolProp).size > 0)
    ? currentChordSymbolProp.trim()
    : progression[effectiveChordIndex];
  const allowedSet = getAllowedPitchClasses(chordForGuideTones);

  const checkNote = useCallback(
    (pitchClass: string): boolean => {
      const chordSymbol =
        (currentChordSymbolProp?.trim() && getAllowedPitchClasses(currentChordSymbolProp.trim()).size > 0)
          ? currentChordSymbolProp.trim()
          : progression[
              playbackChordIndexProp !== undefined && playbackChordIndexProp !== null
                ? Math.max(0, Math.min(playbackChordIndexProp, progression.length - 1))
                : currentChordIndex
            ];
      const allowed = getAllowedPitchClasses(chordSymbol);
      if (allowed.has(pitchClass)) {
        setIsMuted(false);
        setCurrentChordIndex(i => (i + 1) % progression.length);
        return true;
      }
      setIsMuted(true);
      return false;
    },
    [currentChordIndex, playbackChordIndexProp, progression, currentChordSymbolProp]
  );

  useEffect(() => {
    const id = setInterval(() => {
      if (inputSource === 'midi') {
        const midi = getCurrentNote();
        if (midi == null) return;
        const pc = Note.pitchClass(Note.fromMidi(midi));
        if (lastPitchClassRef.current === pc) return;
        lastPitchClassRef.current = pc;
        checkNote(pc);
        return;
      }
      const pitch = useITMPitchStore.getState().getLatestPitch();
      if (!pitch || pitch.clarity < MIN_CLARITY || pitch.frequency <= 0) return;
      const info = frequencyToNote(pitch.frequency);
      if (!info) return;
      if (lastPitchClassRef.current === info.pitchClass) return;
      lastPitchClassRef.current = info.pitchClass;
      checkNote(info.pitchClass);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkNote, inputSource, getCurrentNote]);

  const reset = useCallback(() => {
    setCurrentChordIndex(0);
    setIsMuted(true);
    lastPitchClassRef.current = null;
  }, []);

  const currentChord = chordForGuideTones ?? progression[effectiveChordIndex];
  const hints = GuideToneCalculator.calculate(currentChord);

  return {
    progression,
    currentChordIndex: effectiveChordIndex,
    currentChord,
    isMuted,
    allowedSet,
    hints,
    checkNote,
    reset,
  };
}
