import { useITMPitchStore } from '../../modules/ITM/state/useITMPitchStore';

/**
 * Pitch-to-Theory pipeline (REQ-MIC-08): stream → pitch (YIN/MPM or ml5) → frequency.
 * Uses AnalyserNode for RMS (noise gate ~-40 dB). Integrates with MicrophoneService stream.
 */

declare const ml5: { pitchDetection: (model: string, ctx: AudioContext, stream: MediaStream, cb: () => void) => { getPitch: (cb: (err: unknown, freq: number) => void) => void } } | undefined;

const NOISE_GATE_DB = -40;

function computeRmsDb(analyser: AnalyserNode, data: Uint8Array): number {
  analyser.getByteTimeDomainData(data as Uint8Array<ArrayBuffer>);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const n = (data[i] - 128) / 128;
    sum += n * n;
  }
  const rms = Math.sqrt(sum / data.length) || 1e-6;
  return 20 * Math.log10(rms);
}

export interface PitchResult {
  frequency: number;
  clarity: number;
}

export interface PitchPipeline {
  start: (onResult: (result: PitchResult | null) => void) => void;
  stop: () => void;
}

/**
 * Create a pitch pipeline from a MediaStream. 
 * Priority: 
 * 1. High-Performance ITM Store (Worklet + SAB + MPM)
 * 2. legacy ml5 (if loaded)
 * 3. RMS-only (fallback)
 */
export function createPitchPipeline(stream: MediaStream): PitchPipeline {
  const audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);

  const timeData = new Uint8Array(analyser.fftSize);
  let rafId = 0;
  let running = false;

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    source.disconnect();
    void audioContext.close();
  };

  const start = (onResult: (result: PitchResult | null) => void) => {
    if (running) return;
    running = true;

    const loop = () => {
      if (!running) return;

      const rmsDb = computeRmsDb(analyser, timeData);

      // Try to get result from high-performance store first
      const itmStore = useITMPitchStore.getState();
      if (itmStore.isReady && itmStore.stream === stream) {
        const result = itmStore.getLatestPitch();
        if (result && result.frequency > 0 && rmsDb >= NOISE_GATE_DB) {
          onResult({ frequency: result.frequency, clarity: result.clarity });
          rafId = requestAnimationFrame(loop);
          return;
        }
      }

      // Fallback: No legacy detection implemented here; high-performance store is the source of truth.
      onResult(null);

      if (running) rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  };

  return { start, stop };
}
