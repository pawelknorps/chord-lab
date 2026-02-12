import { useCallback, useEffect, useRef, useState } from 'react';
import * as Scale from 'tonal-scale';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { frequencyToNote } from '../../../core/audio/frequencyToNote';
import type { ScaleDegreeResult, IntonationClassification } from '../types';

const CENTS_ET_MAX = 10;
const CENTS_OUT_MIN = 25;
const POLL_INTERVAL_MS = 80;
const MIN_CLARITY = 0.7;

function classifyCents(cents: number): IntonationClassification {
  if (Math.abs(cents) <= CENTS_ET_MAX) return 'et';
  if (Math.abs(cents) > CENTS_OUT_MIN) return 'out';
  return 'just';
}

export function useIntonationHeatmap(root: string = 'C', scaleName: string = 'major') {
  const scaleNotes = Scale.notes(root, scaleName);
  const [results, setResults] = useState<Map<number, ScaleDegreeResult>>(new Map());
  const [droneActive, setDroneActive] = useState(false);
  const lastDegreeRef = useRef<number | null>(null);

  const getDegreeFromPitchClass = useCallback(
    (pitchClass: string): number | null => {
      const idx = scaleNotes.indexOf(pitchClass);
      if (idx === -1) return null;
      return idx + 1;
    },
    [scaleNotes]
  );

  const recordNote = useCallback(
    (degree: number, cents: number) => {
      setResults(prev => {
        const next = new Map(prev);
        next.set(degree, { degree, cents, classification: classifyCents(cents) });
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (!droneActive) return;
    const id = setInterval(() => {
      const pitch = useITMPitchStore.getState().getLatestPitch();
      if (!pitch || pitch.clarity < MIN_CLARITY || pitch.frequency <= 0) return;
      const info = frequencyToNote(pitch.frequency);
      if (!info) return;
      const degree = getDegreeFromPitchClass(info.pitchClass);
      if (degree == null) return;
      if (lastDegreeRef.current === degree) return;
      lastDegreeRef.current = degree;
      recordNote(degree, info.centsDeviation);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [droneActive, getDegreeFromPitchClass, recordNote]);

  const startDrone = useCallback(() => setDroneActive(true), []);
  const stopDrone = useCallback(() => {
    setDroneActive(false);
    lastDegreeRef.current = null;
  }, []);
  const reset = useCallback(() => {
    setResults(new Map());
    lastDegreeRef.current = null;
  }, []);

  return {
    scaleNotes,
    root,
    scaleName,
    results,
    droneActive,
    startDrone,
    stopDrone,
    reset,
  };
}
