import { useEffect, useRef } from 'react';
import { createPitchMemory, isPitchMemorySupported } from '../core/audio/PitchMemory';

export interface PitchTrackerResult {
  frequency: number;
  confidence: number;
}

/**
 * Zero-latency pitch tracker: polls SharedArrayBuffer written by the Audio Worklet.
 * Use when you need a ref that updates every frame (e.g. 60–120 Hz) without re-renders.
 * Requires Cross-Origin Isolation (COOP/COEP) for SharedArrayBuffer.
 * For app-wide mic + store, use useMicrophone + useHighPerformancePitch + useITMPitchStore instead.
 */
export function usePitchTracker(isReady: boolean): React.MutableRefObject<PitchTrackerResult> {
  const pitchRef = useRef<PitchTrackerResult>({ frequency: 0, confidence: 0 });
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isReady || !isPitchMemorySupported()) return;

    let cancelled = false;
    let rafId = 0;

    const start = async () => {
      try {
        const { sab, view } = createPitchMemory();
        const ctx = new AudioContext({ latencyHint: 'interactive', sampleRate: 44100 });
        await ctx.audioWorklet.addModule('/worklets/pitch-processor.js');

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        const source = ctx.createMediaStreamSource(stream);
        const node = new AudioWorkletNode(ctx, 'pitch-processor', {
          processorOptions: { sab, sampleRate: ctx.sampleRate },
        });
        source.connect(node);

        cleanupRef.current = () => {
          source.disconnect();
          node.disconnect();
          stream.getTracks().forEach((t) => t.stop());
          void ctx.close();
        };

        const poll = () => {
          if (cancelled) return;
          pitchRef.current.frequency = view[0];
          pitchRef.current.confidence = view[1];
          rafId = requestAnimationFrame(poll);
        };
        poll();
      } catch (e) {
        console.warn('[usePitchTracker] start failed', e);
      }
    };

    void start();
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [isReady]);

  return pitchRef;
}
