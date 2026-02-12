import { useCallback, useEffect, useRef, useState } from 'react';
import * as Note from '@tonaljs/note';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { frequencyToNote } from '../../../core/audio/frequencyToNote';
import { GuideToneCalculator } from '../../../core/theory/GuideToneCalculator';

const PROGRESSION = ['Dm7', 'G7', 'Cmaj7'];
const POLL_INTERVAL_MS = 60;
const MIN_CLARITY = 0.7;

function getAllowedPitchClasses(chordSymbol: string): Set<string> {
  const gt = GuideToneCalculator.calculate(chordSymbol);
  if (!gt) return new Set();
  const thirdPc = Note.pitchClass(gt.third);
  const seventhPc = Note.pitchClass(gt.seventh);
  return new Set([thirdPc, seventhPc]);
}

export function useVoiceLeadingMaze() {
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const allowedSet = getAllowedPitchClasses(PROGRESSION[currentChordIndex]);
  const lastPitchClassRef = useRef<string | null>(null);

  const checkNote = useCallback(
    (pitchClass: string): boolean => {
      const allowed = getAllowedPitchClasses(PROGRESSION[currentChordIndex]);
      if (allowed.has(pitchClass)) {
        setIsMuted(false);
        setCurrentChordIndex(i => (i < PROGRESSION.length - 1 ? i + 1 : i));
        return true;
      }
      setIsMuted(true);
      return false;
    },
    [currentChordIndex]
  );

  useEffect(() => {
    const id = setInterval(() => {
      const pitch = useITMPitchStore.getState().getLatestPitch();
      if (!pitch || pitch.clarity < MIN_CLARITY || pitch.frequency <= 0) return;
      const info = frequencyToNote(pitch.frequency);
      if (!info) return;
      if (lastPitchClassRef.current === info.pitchClass) return;
      lastPitchClassRef.current = info.pitchClass;
      checkNote(info.pitchClass);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [checkNote]);

  const reset = useCallback(() => {
    setCurrentChordIndex(0);
    setIsMuted(false);
    lastPitchClassRef.current = null;
  }, []);

  const currentChord = PROGRESSION[currentChordIndex];
  const hints = GuideToneCalculator.calculate(currentChord);

  return {
    progression: PROGRESSION,
    currentChordIndex,
    currentChord,
    isMuted,
    allowedSet,
    hints,
    checkNote,
    reset,
  };
}
