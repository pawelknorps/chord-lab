/**
 * MPM Worker: runs autocorrelation (NSDF) pitch detection off the audio thread.
 * Reads downsampled PCM from SharedArrayBuffer (written by pitch-processor worklet),
 * writes frequency + confidence to the main pitch SAB. Prevents audio-thread blocking
 * Primary pitch engine is SwiftF0 (CREPE is not used).
 */

const CREPE_FRAME_LEN = 1024;
const SAMPLE_RATE_HZ = 16000;

const PRESETS: Record<string, { minHz: number; maxHz: number }> = {
  general: { minHz: 46.875, maxHz: 2093.75 },
  auto: { minHz: 46.875, maxHz: 2093.75 },
  voice: { minHz: 80, maxHz: 1100 },
  acousticGuitar: { minHz: 82, maxHz: 1050 },
  electricGuitar: { minHz: 82, maxHz: 1400 },
  saxophone: { minHz: 100, maxHz: 1400 },
  trumpet: { minHz: 160, maxHz: 1200 },
  bassGuitar: { minHz: 41, maxHz: 350 },
  bass: { minHz: 41, maxHz: 350 },
  guitar: { minHz: 82, maxHz: 1050 },
  vocals: { minHz: 80, maxHz: 1100 },
};

let sharedView: Float32Array | null = null;
let pcmView: Float32Array | null = null;
let minHz = 20;
let maxHz = 4000;
let pollId: ReturnType<typeof setInterval> | null = null;

// Stabilization state (median filter + hysteresis)
const WINDOW_SIZE = 7;
const MIN_CONFIDENCE = 0.72;
const HYSTERESIS_CENTS = 40;
const STABILITY_THRESHOLD = 2;
const pitchHistory = new Float64Array(WINDOW_SIZE);
let pitchHistoryCount = 0;
let pitchHistoryPtr = 0;
const sortedCopy = new Float64Array(WINDOW_SIZE);
let lastStablePitch = 0;
let stableCount = 0;
let pendingPitch = 0;

function detectPitch(buffer: Float32Array, sampleRate: number): [number, number] {
  const n = buffer.length;
  const nsdf = new Float32Array(n);

  for (let tau = 0; tau < n; tau++) {
    let acf = 0;
    let divisor = 0;
    for (let i = 0; i < n - tau; i++) {
      acf += buffer[i] * buffer[i + tau];
      divisor += buffer[i] * buffer[i] + buffer[i + tau] * buffer[i + tau];
    }
    nsdf[tau] = (2 * acf) / (divisor || 1e-6);
  }

  const peaks: number[] = [];
  for (let i = 1; i < n - 1; i++) {
    if (nsdf[i] > nsdf[i - 1] && nsdf[i] > nsdf[i + 1]) peaks.push(i);
  }
  if (peaks.length === 0) return [0, 0];

  let maxNsdf = 0;
  for (let i = 0; i < peaks.length; i++) {
    if (nsdf[peaks[i]] > maxNsdf) maxNsdf = nsdf[peaks[i]];
  }
  const threshold = 0.9 * maxNsdf;
  let targetPeak = -1;
  for (let i = 0; i < peaks.length; i++) {
    if (nsdf[peaks[i]] >= threshold) {
      targetPeak = peaks[i];
      break;
    }
  }
  if (targetPeak === -1) return [0, 0];

  const x0 = targetPeak - 1;
  const x1 = targetPeak;
  const x2 = targetPeak + 1;
  const y0 = nsdf[x0];
  const y1 = nsdf[x1];
  const y2 = nsdf[x2];
  const p = x1 + (y0 - y2) / (2 * (y0 - 2 * y1 + y2) || 1e-6);
  const frequency = sampleRate / p;
  const clarity = nsdf[targetPeak];
  if (frequency < minHz || frequency > maxHz) return [0, 0];
  return [frequency, clarity];
}

function stabilize(pitch: number, confidence: number): number {
  if (confidence < MIN_CONFIDENCE) return lastStablePitch;

  const hist = pitchHistory;
  const cap = WINDOW_SIZE;
  if (pitchHistoryCount < cap) {
    hist[pitchHistoryCount] = pitch;
    pitchHistoryCount++;
  } else {
    hist[pitchHistoryPtr] = pitch;
    pitchHistoryPtr = (pitchHistoryPtr + 1) % cap;
  }

  const count = pitchHistoryCount;
  if (count < 3) return (lastStablePitch = pitch);

  const sorted = sortedCopy;
  let n = count;
  if (count === cap) {
    for (let i = 0; i < n; i++) sorted[i] = hist[(pitchHistoryPtr + i) % cap];
  } else {
    for (let i = 0; i < n; i++) sorted[i] = hist[i];
  }
  for (let i = 1; i < n; i++) {
    const v = sorted[i];
    let j = i;
    while (j > 0 && sorted[j - 1] > v) {
      sorted[j] = sorted[j - 1];
      j--;
    }
    sorted[j] = v;
  }
  const medianPitch = sorted[Math.floor(n / 2)];

  if (lastStablePitch === 0) {
    return (lastStablePitch = medianPitch);
  }

  const newMidi = 12 * Math.log2(medianPitch / 440) + 69;
  const currentMidi = 12 * Math.log2(lastStablePitch / 440) + 69;

  if (Math.abs(newMidi - currentMidi) > HYSTERESIS_CENTS / 100) {
    if (Math.abs(12 * Math.log2(medianPitch / pendingPitch)) < 0.1) {
      stableCount++;
    } else {
      stableCount = 1;
      pendingPitch = medianPitch;
    }
    if (stableCount >= STABILITY_THRESHOLD) {
      lastStablePitch = medianPitch;
      stableCount = 0;
    }
  } else {
    stableCount = 0;
  }
  return lastStablePitch;
}

function poll(): void {
  if (!sharedView || !pcmView) return;

  const pcm = new Float32Array(pcmView.buffer, pcmView.byteOffset, CREPE_FRAME_LEN);
  const [pitch, confidence] = detectPitch(pcm, SAMPLE_RATE_HZ);
  const stable = pitch > 0 ? stabilize(pitch, confidence) : 0;

  sharedView[0] = stable;
  sharedView[1] = confidence;
}

self.onmessage = (e: MessageEvent<{ type: string; data?: { sab: SharedArrayBuffer; pcmSab: SharedArrayBuffer; instrumentId?: string } }>) => {
  const { type, data } = e.data;
  if (type === 'init' && data?.sab && data?.pcmSab) {
    if (pollId) clearInterval(pollId);
    sharedView = new Float32Array(data.sab);
    pcmView = new Float32Array(data.pcmSab);
    const preset = PRESETS[data.instrumentId ?? 'general'] ?? PRESETS.general;
    minHz = preset.minHz;
    maxHz = preset.maxHz;
    lastStablePitch = 0;
    pitchHistoryCount = 0;
    pitchHistoryPtr = 0;
    stableCount = 0;
    pendingPitch = 0;
    pollId = setInterval(poll, 15);
  } else if (type === 'stop') {
    if (pollId) {
      clearInterval(pollId);
      pollId = null;
    }
    sharedView = null;
    pcmView = null;
  }
};
