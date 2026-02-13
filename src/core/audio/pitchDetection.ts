import { useITMPitchStore } from '../../modules/ITM/state/useITMPitchStore';
import { getPitchAudioContext } from './sharedAudioContext';

/**
 * Pitch-to-Theory pipeline (REQ-MIC-08): stream → pitch (SwiftF0/MPM) → frequency.
 * Uses SwiftF0 neural pitch when SharedArrayBuffer is available; MPM/legacy autocorrelation fallback otherwise.
 * Uses AnalyserNode for RMS (noise gate ~-40 dB). Uses shared AudioContext so mic + playback don't glitch.
 */

/** dB above estimated noise floor to count as "voice" (adaptive). Lower = more trigger for quiet singing/guitar. */
const GATE_MARGIN_DB = 6;
/** How fast we learn the noise floor (0–1); higher = faster. */
const NOISE_FLOOR_SMOOTH = 0.003;
/** Initial noise floor before we have data (permissive). */
const INITIAL_NOISE_FLOOR_DB = -55;
/** Min/max noise floor so we don't gate too strict or too loose. */
const MIN_NOISE_FLOOR_DB = -50;
const MAX_NOISE_FLOOR_DB = -24;
/** Software gain; AGC will adjust around this. */
const INITIAL_GAIN = 2;
const MIN_GAIN = 0.5;
const MAX_GAIN = 3.5;
/** Target level when we have confident pitch (AGC). */
const TARGET_RMS_DB = -24;
const LEGACY_BUFFER_SIZE = 1024;
const MIN_FREQ = 80;
const MAX_FREQ = 1200;

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

/** Simple autocorrelation pitch when high-performance store is not ready (no SAB). */
function legacyPitchFromAnalyser(analyser: AnalyserNode, timeData: Uint8Array, sampleRate: number): PitchResult | null {
  analyser.getByteTimeDomainData(timeData as Uint8Array<ArrayBuffer>);
  const n = Math.min(LEGACY_BUFFER_SIZE, timeData.length);
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = (timeData[i] - 128) / 128;

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_FREQ));
  const maxLag = Math.min(n - 1, Math.ceil(sampleRate / MIN_FREQ));
  let bestLag = 0;
  let bestCorr = 0;

  for (let tau = minLag; tau <= maxLag; tau++) {
    let sum = 0;
    for (let i = 0; i < n - tau; i++) sum += buf[i] * buf[i + tau];
    const corr = sum / (n - tau);
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = tau;
    }
  }
  if (bestLag <= 0) return null;
  const frequency = sampleRate / bestLag;
  if (frequency < MIN_FREQ || frequency > MAX_FREQ) return null;
  const clarity = Math.min(1, bestCorr * 3);
  return { frequency, clarity };
}

export interface PitchResult {
  frequency: number;
  clarity: number;
}

export interface PitchPipeline {
  start: (onResult: (result: PitchResult | null) => void) => void;
  stop: () => void;
}

/** Throttle: only run heavy work every N frames (1 = every frame for snappier piano visual). */
const PITCH_LOOP_THROTTLE = 1;

/**
 * Create a pitch pipeline from a MediaStream.
 * Uses the dedicated pitch AudioContext (not Tone's) so mic/analyser never run on the playback thread.
 */
export function createPitchPipeline(stream: MediaStream): PitchPipeline {
  const { context: audioContext } = getPitchAudioContext();
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch((e) => console.warn('[pitch] context resume failed', e));
  }
  const source = audioContext.createMediaStreamSource(stream);
  const gainNode = audioContext.createGain();
  gainNode.gain.value = INITIAL_GAIN;
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(gainNode);
  gainNode.connect(analyser);

  const timeData = new Uint8Array(analyser.fftSize);
  let rafId = 0;
  let running = false;
  let noiseFloorDb = INITIAL_NOISE_FLOOR_DB;
  let frameCount = 0;

  const stop = () => {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    source.disconnect();
    gainNode.disconnect();
  };

  const start = (onResult: (result: PitchResult | null) => void) => {
    if (running) return;
    running = true;
    frameCount = 0;

    // Ensure high-performance store is initialized with SwiftF0 (CREPE is not used)
    const itmState = useITMPitchStore.getState();
    if ((!itmState.isReady || itmState.stream !== stream) && typeof SharedArrayBuffer !== 'undefined') {
      void itmState.initialize(stream, 'general', { useSwiftF0: true });
    }

    const loop = () => {
      if (!running) return;

      frameCount++;
      const doWork = frameCount % PITCH_LOOP_THROTTLE === 0;

      const itmStore = useITMPitchStore.getState();
      let result: PitchResult | null = null;
      if (itmStore.isReady && itmStore.stream === stream) {
        const storeResult = itmStore.getLatestPitch();
        if (storeResult && storeResult.frequency > 0) result = storeResult;
      }

      if (doWork) {
        const rmsDb = computeRmsDb(analyser, timeData);
        const gateDb = noiseFloorDb + GATE_MARGIN_DB;
        if (!result) {
          const legacy = legacyPitchFromAnalyser(analyser, timeData, audioContext.sampleRate);
          if (legacy) result = legacy;
        }
        const aboveGate = rmsDb >= gateDb;
        // When we have pitch from store (SwiftF0/MPM), show it even if slightly below gate so quiet singing/guitar still triggers
        const useResult = result && (aboveGate || (result.clarity >= 0.5 && rmsDb >= noiseFloorDb - 8));
        if (useResult) {
          onResult(result);
          const g = gainNode.gain.value;
          if (rmsDb < TARGET_RMS_DB && g < MAX_GAIN) gainNode.gain.value = Math.min(MAX_GAIN, g * 1.01);
          else if (rmsDb > TARGET_RMS_DB && g > MIN_GAIN) gainNode.gain.value = Math.max(MIN_GAIN, g * 0.99);
        } else {
          onResult(null);
          noiseFloorDb = Math.max(MIN_NOISE_FLOOR_DB, Math.min(MAX_NOISE_FLOOR_DB,
            noiseFloorDb * (1 - NOISE_FLOOR_SMOOTH) + rmsDb * NOISE_FLOOR_SMOOTH));
        }
      } else {
        if (result) onResult(result);
        else onResult(null);
      }

      if (running) rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
  };

  return { start, stop };
}
