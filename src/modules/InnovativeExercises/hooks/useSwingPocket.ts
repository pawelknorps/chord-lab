import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { useMidi } from '../../../context/MidiContext';
import { computeSwingPocket } from '../core/SwingAnalysis';
import type { SwingPocketResult } from '../types';
import type { ExerciseInputSource } from '../../JazzKiller/core/ExerciseInputAdapter';

const DEBOUNCE_MS = 80;
const DEFAULT_BPM = 120;
const RECORD_BARS = 4;

export function useSwingPocket(inputSource: ExerciseInputSource = 'mic') {
  const { stream } = useMicrophone();
  const { onset } = useHighPerformancePitch(stream ?? null, 'general');
  const { lastNote } = useMidi();

  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [swingRatio, setSwingRatio] = useState(0.66);
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [onsets, setOnsets] = useState<number[]>([]);
  const [result, setResult] = useState<SwingPocketResult | null>(null);
  const [challengeMode, setChallengeMode] = useState<'push' | 'layback' | null>(null);

  const lastOnsetRef = useRef(0);
  const lastMidiTimestampRef = useRef(0);
  const onsetsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const metronomeLoopRef = useRef<Tone.Loop | null>(null);
  const clickRef = useRef<Tone.Synth | null>(null);

  onsetsRef.current = onsets;
  startTimeRef.current = startTime;

  // Mic: record onset timestamps when worklet onset fires
  useEffect(() => {
    if (inputSource !== 'mic' || !isRecording || onset <= 0) return;
    const now = performance.now();
    if (now - lastOnsetRef.current < DEBOUNCE_MS) return;
    lastOnsetRef.current = now;
    setOnsets(prev => [...prev, now]);
  }, [onset, isRecording, inputSource]);

  // MIDI: record note-on timestamps when recording
  useEffect(() => {
    if (inputSource !== 'midi' || !isRecording || lastNote?.type !== 'noteon') return;
    const ts = lastNote.timestamp;
    if (ts - lastMidiTimestampRef.current < DEBOUNCE_MS) return;
    lastMidiTimestampRef.current = ts;
    setOnsets(prev => [...prev, ts]);
  }, [inputSource, isRecording, lastNote]);

  // Auto-stop recording after N bars
  useEffect(() => {
    if (!isRecording || startTime === null) return;
    const beatMs = 60000 / bpm;
    const durationMs = RECORD_BARS * 4 * beatMs;
    const t = setTimeout(() => {
      stopRecording();
    }, durationMs);
    return () => clearTimeout(t);
  }, [isRecording, startTime, bpm]);

  const startMetronome = useCallback(async () => {
    await Tone.start();
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.swing = swingRatio;
    Tone.Transport.timeSignature = [4, 4];
    if (!clickRef.current) {
      clickRef.current = new Tone.Synth({ oscillator: { type: 'sine' }, volume: -6 }).toDestination();
    }
    // Clicks on beats 2 and 4 (indices 1 and 3 in 0-based); loop runs every quarter
    metronomeLoopRef.current = new Tone.Loop((time) => {
      const beatIndex = (time * bpm) / 60;
      const beatInBar = Math.floor(beatIndex % 4);
      if (beatInBar === 1 || beatInBar === 3) {
        clickRef.current?.triggerAttackRelease('C6', '32n', time);
      }
    }, '4n').start(0);
    Tone.Transport.start();
    setIsMetronomeRunning(true);
  }, [bpm, swingRatio]);

  const stopMetronome = useCallback(() => {
    metronomeLoopRef.current?.dispose();
    metronomeLoopRef.current = null;
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setIsMetronomeRunning(false);
  }, []);

  const startRecording = useCallback(() => {
    setOnsets([]);
    setResult(null);
    setStartTime(performance.now());
    setIsRecording(true);
    if (!isMetronomeRunning) startMetronome();
  }, [isMetronomeRunning, startMetronome]);

  const stopRecording = useCallback(() => {
    const start = startTimeRef.current ?? performance.now();
    const currentOnsets = onsetsRef.current;
    setIsRecording(false);
    if (currentOnsets.length >= 4) {
      const r = computeSwingPocket(bpm, start, currentOnsets);
      setResult(r);
    } else {
      setResult(null);
    }
    setStartTime(null);
  }, [bpm]);

  const reset = useCallback(() => {
    setOnsets([]);
    setResult(null);
    setStartTime(null);
    setChallengeMode(null);
  }, []);

  useEffect(() => {
    return () => {
      stopMetronome();
      clickRef.current?.dispose();
      clickRef.current = null;
    };
  }, [stopMetronome]);

  const feedbackText = result
    ? result.offsetMs > 20
      ? `You're ${Math.round(result.offsetMs)} ms behind—lay back for a relaxed feel.`
      : result.offsetMs < -20
        ? `You're ${Math.round(-result.offsetMs)} ms ahead—cool it for a Count Basie feel.`
        : 'Right in the pocket!'
    : null;

  return {
    bpm,
    setBpm,
    swingRatio,
    setSwingRatio,
    isMetronomeRunning,
    isRecording,
    onsets,
    result,
    challengeMode,
    setChallengeMode,
    startMetronome,
    stopMetronome,
    startRecording,
    stopRecording,
    reset,
    feedbackText,
  };
}
