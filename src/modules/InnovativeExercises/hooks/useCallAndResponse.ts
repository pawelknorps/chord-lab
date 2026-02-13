import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { useMicrophone } from '../../../hooks/useMicrophone';
import { useHighPerformancePitch } from '../../ITM/hooks/useHighPerformancePitch';
import { initAudio, drums } from '../../../core/audio/globalAudio';
import { DrumEngine, type DrumHit } from '../../../core/theory/DrumEngine';
import { GrooveManager } from '../../../core/theory/GrooveManager';
import { generateTwoBarBreak, CALL_RESPONSE_BPM } from '../data/callAndResponseBreak';
import type { CallResponsePair } from '../types';

const DEBOUNCE_MS = 80;

/** Format offset from start (ms) as "Bar N Beat M" or "Bar N Beat M &" for display. */
function formatBeatLabel(offsetMs: number, bpm: number): string {
  const beatDurationMs = (60 * 1000) / bpm;
  const barDurationMs = 4 * beatDurationMs;
  const bar = Math.floor(offsetMs / barDurationMs) + 1;
  const beatInBar = (offsetMs % barDurationMs) / beatDurationMs;
  const beatNum = Math.floor(beatInBar) + 1;
  const sub = beatInBar % 1;
  const isAnd = sub >= 0.35 && sub <= 0.65;
  return isAnd ? `Bar ${bar} Beat ${beatNum} &` : `Bar ${bar} Beat ${beatNum}`;
}

export function useCallAndResponse() {
  const { stream } = useMicrophone();
  const { onset } = useHighPerformancePitch(stream ?? null, 'general');

  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [studentOnsets, setStudentOnsets] = useState<number[]>([]);
  const [pairs, setPairs] = useState<CallResponsePair[]>([]);

  const lastOnsetRef = useRef(0);
  const studentOnsetsRef = useRef<number[]>([]);
  studentOnsetsRef.current = studentOnsets;

  /** Current 2-bar break (generated on first Play reference, cleared on Reset). */
  const refBreakRef = useRef<{
    hits: DrumHit[];
    onsetTimesSec: number[];
    bpm: number;
    totalSec: number;
  } | null>(null);

  /** Fallback click when global drums not ready. */
  const clickRef = useRef<Tone.Synth | null>(null);
  const grooveRef = useRef(new GrooveManager());
  const drumEngineRef = useRef(new DrumEngine());

  useEffect(() => {
    if (!isRecording || onset <= 0) return;
    const now = performance.now();
    if (now - lastOnsetRef.current < DEBOUNCE_MS) return;
    lastOnsetRef.current = now;
    setStudentOnsets((prev) => [...prev, now]);
  }, [onset, isRecording]);

  const playReference = useCallback(async () => {
    await Tone.start();
    await initAudio();

    if (!refBreakRef.current) {
      refBreakRef.current = generateTwoBarBreak(CALL_RESPONSE_BPM);
    }
    const breakData = refBreakRef.current;
    if (!breakData) return;
    const { hits, bpm, totalSec } = breakData;
    const groove = grooveRef.current;
    const drumEngine = drumEngineRef.current;

    Tone.Transport.bpm.value = bpm;
    Tone.Transport.cancel();
    setIsPlayingRef(true);

    const offBeatOffsetSec = groove.getOffBeatOffsetInBeat(bpm);
    const useDrums = drums && drums.kick && drums.snare && drums.hihat && drums.ride;

    if (!useDrums && !clickRef.current) {
      clickRef.current = new Tone.Synth({
        oscillator: { type: 'sine' },
        volume: -6,
      }).toDestination();
    }

    hits.forEach((hit: DrumHit) => {
      const [bar, beat, sixteenth] = hit.time.split(':');
      const beatStartSec = Tone.Time(`${bar}:${beat}:0`).toSeconds();
      const isOffBeat = sixteenth === '2';
      const offsetSec = isOffBeat ? offBeatOffsetSec : 0;
      const microSec = drumEngine.getMicroTiming(bpm, hit.instrument);
      const scheduleTime = beatStartSec + offsetSec + microSec;

      Tone.Transport.schedule((time) => {
        if (useDrums) {
          if (hit.instrument === 'Ride') {
            drums!.ride.triggerAttack('C1', time, hit.velocity);
          } else if (hit.instrument === 'Snare') {
            drums!.snare.triggerAttack('C1', time, hit.velocity);
          } else if (hit.instrument === 'Kick') {
            drums!.kick.triggerAttack('C1', time, hit.velocity);
          } else if (hit.instrument === 'HatPedal') {
            drums!.hihat.triggerAttack('C1', time, hit.velocity);
          } else if (hit.instrument === 'HatOpen') {
            drums!.hihat.triggerAttack('F1', time, hit.velocity);
          }
        } else {
          clickRef.current?.triggerAttackRelease('C5', '16n', time);
        }
      }, scheduleTime);
    });

    Tone.Transport.schedule(() => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      setIsPlayingRef(false);
    }, totalSec + 0.05);

    Tone.Transport.start(0);
  }, []);

  const startRecording = useCallback(() => {
    setStudentOnsets([]);
    setPairs([]);
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    const student = [...studentOnsetsRef.current].sort((a, b) => a - b);
    const refBreak = refBreakRef.current;
    if (student.length === 0 || !refBreak) {
      setPairs([]);
      return;
    }
    const { onsetTimesSec, bpm } = refBreak;
    const refStart = student[0] - onsetTimesSec[0] * 1000;
    const refTimes = onsetTimesSec.map((s) => refStart + s * 1000);
    const aligned: CallResponsePair[] = [];
    const n = Math.min(refTimes.length, student.length);
    for (let i = 0; i < n; i++) {
      const offsetMs = onsetTimesSec[i] * 1000;
      aligned.push({
        refTime: refTimes[i],
        studentTime: student[i],
        deltaMs: Math.round((student[i] - refTimes[i]) * 100) / 100,
        refBeatLabel: formatBeatLabel(offsetMs, bpm),
      });
    }
    setPairs(aligned);
  }, []);

  const reset = useCallback(() => {
    refBreakRef.current = null;
    setStudentOnsets([]);
    setPairs([]);
  }, []);

  useEffect(() => {
    return () => {
      clickRef.current?.dispose();
      clickRef.current = null;
    };
  }, []);

  return {
    isPlayingRef,
    isRecording,
    studentOnsets,
    pairs,
    playReference,
    startRecording,
    stopRecording,
    reset,
  };
}
