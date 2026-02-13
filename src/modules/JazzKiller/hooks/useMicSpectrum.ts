import { useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import * as MicrophoneService from '../../../core/audio/MicrophoneService';
import { getPitchAudioContext } from '../../../core/audio/sharedAudioContext';

const FFT_SIZE = 2048;
const SMOOTHING = 0.75;

/** Low-frequency bins (e.g. ~20–400 Hz) for warmth */
function warmthFromBins(bins: Uint8Array): number {
  const len = Math.floor(bins.length * 0.15);
  let sum = 0;
  for (let i = 0; i < len; i++) sum += bins[i];
  return len > 0 ? sum / len / 255 : 0;
}

/** High-frequency bins (e.g. ~2k–8k Hz) for brightness */
function brightnessFromBins(bins: Uint8Array): number {
  const start = Math.floor(bins.length * 0.5);
  const end = bins.length;
  let sum = 0;
  for (let i = start; i < end; i++) sum += bins[i];
  const n = end - start;
  return n > 0 ? sum / n / 255 : 0;
}

export interface MicSpectrumState {
  /** Updated every frame; read in a requestAnimationFrame loop for spectrum viz */
  frequencyDataRef: MutableRefObject<Uint8Array | null>;
  warmth: number;
  brightness: number;
  isActive: boolean;
}

/**
 * FFT analysis of the app-wide microphone stream for spectrum visualization
 * and tone feedback (warmth vs brightness). Only active when mic is started.
 * Uses the pitch pipeline's AudioContext (getPitchAudioContext) so we don't
 * create a third context and add more load on the audio thread when playback + pitch run together.
 */
export function useMicSpectrum(): MicSpectrumState {
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const [state, setState] = useState<MicSpectrumState>({
    frequencyDataRef: frequencyDataRef as MutableRefObject<Uint8Array | null>,
    warmth: 0,
    brightness: 0,
    isActive: false,
  });
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  const [streamVersion, setStreamVersion] = useState(0);
  useEffect(() => {
    const unsub = MicrophoneService.subscribe(() => setStreamVersion((v) => v + 1));
    return unsub;
  }, []);

  useEffect(() => {
    const stream = MicrophoneService.getStream();
    if (!stream?.active) {
      frequencyDataRef.current = null;
      setState((s) => ({ ...s, warmth: 0, brightness: 0, isActive: false }));
      return;
    }

    const { context: ctx } = getPitchAudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = SMOOTHING;
    source.connect(analyser);

    contextRef.current = ctx;
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    dataRef.current = data;

    let running = true;
    const loop = () => {
      if (!running || !analyserRef.current || !dataRef.current) return;
      analyserRef.current.getByteFrequencyData(dataRef.current);
      frequencyDataRef.current = dataRef.current;
      const warmth = warmthFromBins(dataRef.current);
      const brightness = brightnessFromBins(dataRef.current);
      frameCountRef.current += 1;
      if (frameCountRef.current % 3 === 0) {
        setState((s) => ({ ...s, warmth, brightness, isActive: true }));
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      source.disconnect();
      // Do not close ctx — pitch pipeline may still use it; we only disconnect our nodes
      analyserRef.current = null;
      contextRef.current = null;
      dataRef.current = null;
      frequencyDataRef.current = null;
      setState((s) => ({ ...s, warmth: 0, brightness: 0, isActive: false }));
    };
  }, [streamVersion]);

  return state;
}
