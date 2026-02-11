/**
 * Pitch-to-Theory pipeline (REQ-MIC-08): stream → pitch (YIN/MPM or ml5) → frequency.
 * Uses AnalyserNode for RMS (noise gate ~-40 dB). Integrates with MicrophoneService stream.
 */

declare const ml5: { pitchDetection: (model: string, ctx: AudioContext, stream: MediaStream, cb: () => void) => { getPitch: (cb: (err: unknown, freq: number) => void) => void } } | undefined;

const NOISE_GATE_DB = -40;
const CLARITY_WHEN_VALID = 0.95;

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
 * Create a pitch pipeline from a MediaStream. Uses ml5 when available;
 * applies noise gate (RMS >= -40 dB) before emitting. Returns { start, stop }.
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
  let pitchDetector: { getPitch: (cb: (err: unknown, freq: number) => void) => void } | null = null;
  let running = false;

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    pitchDetector = null;
    source.disconnect();
    void audioContext.close();
  };

  const start = (onResult: (result: PitchResult | null) => void) => {
    if (running) return;
    running = true;

    if (typeof ml5 !== 'undefined' && ml5.pitchDetection) {
      try {
        const detector = ml5.pitchDetection(
          './model/',
          audioContext,
          stream,
          () => {
            const loop = () => {
              if (!running || !pitchDetector) return;
              const rmsDb = computeRmsDb(analyser, timeData);
              pitchDetector.getPitch((_err: unknown, frequency: number) => {
                if (!running) return;
                if (frequency && frequency > 0 && rmsDb >= NOISE_GATE_DB) {
                  onResult({ frequency, clarity: CLARITY_WHEN_VALID });
                } else {
                  onResult(null);
                }
                if (running) rafId = requestAnimationFrame(loop);
              });
            };
            loop();
          }
        );
        pitchDetector = detector;
      } catch {
        // ml5 failed; run loop without pitch, only noise gate
        const loop = () => {
          if (!running) return;
          const rmsDb = computeRmsDb(analyser, timeData);
          onResult(rmsDb >= NOISE_GATE_DB ? null : null);
          if (running) rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);
      }
    } else {
      // No ml5: still run analyser for future use (e.g. RMS-only)
      const loop = () => {
        if (!running) return;
        computeRmsDb(analyser, timeData);
        onResult(null);
        if (running) rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    }
  };

  return { start, stop };
}
