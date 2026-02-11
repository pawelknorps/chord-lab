import { useState, useEffect, useRef } from 'react';
import * as Note from '@tonaljs/note';
import { useMicrophone } from './useMicrophone';
import { createPitchPipeline } from '../core/audio/pitchDetection';
import type { PitchResult } from '../core/audio/pitchDetection';

const CLARITY_THRESHOLD = 0.9;
const DEBOUNCE_MS = 100;

export interface AuralMirrorResult {
  liveNote: string | null;
  midi: number | null;
  clarity: number;
  isActive: boolean;
}

/**
 * Hook that returns the "Live Note" the student is playing (REQ-MIC-09).
 * Uses clarity threshold (> 90%), ~100 ms debounce, noise gate in pitch pipeline.
 */
export function useAuralMirror(): AuralMirrorResult & { start: () => Promise<void>; stop: () => void; error: Error | null } {
  const { start, stop, isActive, stream, error } = useMicrophone();
  const [liveNote, setLiveNote] = useState<string | null>(null);
  const [midi, setMidi] = useState<number | null>(null);
  const [clarity, setClarity] = useState(0);
  const pipelineRef = useRef<ReturnType<typeof createPitchPipeline> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!stream || !stream.active) {
      if (pipelineRef.current) {
        pipelineRef.current.stop();
        pipelineRef.current = null;
      }
      setLiveNote(null);
      setMidi(null);
      setClarity(0);
      return;
    }

    const pipeline = createPitchPipeline(stream);
    pipelineRef.current = pipeline;
    pipeline.start((result: PitchResult | null) => {
      if (!result || result.clarity < CLARITY_THRESHOLD) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          setLiveNote(null);
          setMidi(null);
          setClarity(result?.clarity ?? 0);
          debounceRef.current = null;
        }, DEBOUNCE_MS);
        return;
      }
      const noteName = Note.fromFreq(result.frequency);
      const midiNum = Note.midi(noteName);
      if (midiNum == null) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setLiveNote(noteName);
        setMidi(midiNum);
        setClarity(result.clarity);
        debounceRef.current = null;
      }, DEBOUNCE_MS);
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      pipeline.stop();
      pipelineRef.current = null;
      setLiveNote(null);
      setMidi(null);
      setClarity(0);
    };
  }, [stream]);

  return {
    start,
    stop,
    isActive,
    liveNote,
    midi,
    clarity,
    error,
  };
}
