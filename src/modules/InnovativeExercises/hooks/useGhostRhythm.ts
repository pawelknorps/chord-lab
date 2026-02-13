import { useCallback, useEffect, useRef, useState } from 'react';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { useITMPitchStore } from '../../ITM/state/useITMPitchStore';
import { frequencyToNote } from '../../../core/audio/frequencyToNote';
import { GHOST_RHYTHM_GRID_BEATS } from '../types';

/** 4/4 grid (no backing): BPM used only for 3-over-4 grid timing. */
const BPM = 120;
const BEAT_MS = 60000 / BPM;
const TOLERANCE_MS = 80;
const PITCH_STABILITY_CENTS = 5;
const TARGET_NOTE = 'G'; // pitch class
const DEBOUNCE_MS = 100;
const RECORD_BARS = 4;

export function useGhostRhythm() {
  const { stream } = useMicrophone();
  const { onset } = useHighPerformancePitch(stream ?? null, 'general');
  const getLatestPitch = useITMPitchStore(s => s.getLatestPitch);

  const [isRecording, setIsRecording] = useState(false);
  const [barStartTime, setBarStartTime] = useState<number | null>(null);
  const [onsets, setOnsets] = useState<{ time: number; frequency: number }[]>([]);
  const [rhythmScore, setRhythmScore] = useState<number | null>(null);
  const [pitchStable, setPitchStable] = useState<boolean | null>(null);
  const [win, setWin] = useState(false);

  const lastOnsetRef = useRef(0);
  const barStartTimeRef = useRef<number | null>(null);
  const onsetsRef = useRef<{ time: number; frequency: number }[]>([]);
  onsetsRef.current = onsets;
  barStartTimeRef.current = barStartTime;

  // On attack (onset from worklet), record time + current frequency
  useEffect(() => {
    if (!isRecording || onset <= 0) return;
    const now = performance.now();
    if (now - lastOnsetRef.current < DEBOUNCE_MS) return;
    lastOnsetRef.current = now;
    const pitch = getLatestPitch();
    const freq = pitch?.frequency ?? 0;
    if (freq <= 0) return;
    setOnsets(prev => [...prev, { time: now, frequency: freq }]);
  }, [onset, isRecording, getLatestPitch]);

  // Auto-stop after N bars (4/4 grid, no backing)
  useEffect(() => {
    if (!isRecording || barStartTime === null) return;
    const durationMs = RECORD_BARS * 4 * BEAT_MS;
    const t = setTimeout(() => stopRecording(), durationMs);
    return () => clearTimeout(t);
  }, [isRecording, barStartTime]);

  const startRecording = useCallback(() => {
    setOnsets([]);
    setRhythmScore(null);
    setPitchStable(null);
    setWin(false);
    setBarStartTime(performance.now());
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    const start = barStartTimeRef.current ?? performance.now();
    const currentOnsets = onsetsRef.current;

    if (currentOnsets.length === 0) {
      setRhythmScore(0);
      setPitchStable(false);
      setWin(false);
      return;
    }

    // 4/4 grid: 3-over-4 positions (beat 0, 4/3, 8/3 per bar), from audio-theory types
    const gridTimes: number[] = [];
    for (let bar = 0; bar < RECORD_BARS; bar++) {
      for (const beat of GHOST_RHYTHM_GRID_BEATS) {
        gridTimes.push(start + (bar * 4 + beat) * BEAT_MS);
      }
    }

    let hits = 0;
    for (const gt of gridTimes) {
      const hasHit = currentOnsets.some(o => Math.abs(o.time - gt) <= TOLERANCE_MS);
      if (hasHit) hits++;
    }
    const rhythmScoreVal = gridTimes.length > 0 ? hits / gridTimes.length : 0;
    setRhythmScore(rhythmScoreVal);

    // Pitch: all notes within 5¢ of G (audio-theory frequencyToNote)
    const pitchOk = currentOnsets.every(o => {
      const info = frequencyToNote(o.frequency);
      if (!info) return false;
      const isG = info.pitchClass === TARGET_NOTE;
      const within5 = Math.abs(info.centsDeviation) <= PITCH_STABILITY_CENTS;
      return isG && within5;
    });
    setPitchStable(pitchOk);

    setWin(rhythmScoreVal >= 0.8 && pitchOk);
  }, []);

  const reset = useCallback(() => {
    setOnsets([]);
    setBarStartTime(null);
    setRhythmScore(null);
    setPitchStable(null);
    setWin(false);
  }, []);

  return {
    isRecording,
    onsets,
    rhythmScore,
    pitchStable,
    win,
    startRecording,
    stopRecording,
    reset,
  };
}
