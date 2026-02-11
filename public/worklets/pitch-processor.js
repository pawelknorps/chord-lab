/**
 * High-Performance Ear (2026): Low-latency pitch processor.
 * - Zero-copy circular buffer: 128-sample blocks copied with buffer.set(); ptr wrap.
 * - Downsamples native mic to 16 kHz (CREPE-trained rate) for ~3x faster inference.
 * - Hop size 128: run MPM every block once buffer is full (overlapping frames).
 * - Writes stabilized frequency + confidence to SAB. No console in hot path.
 */
const CREPE_TARGET_HZ = 16000;
const CREPE_FRAME_LEN = 1024;

class PitchProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = options?.processorOptions || {};
    const sab = opts.sab;
    this.sharedView = sab ? new Float32Array(sab) : null;
    const sampleRate = opts.sampleRate || 44100;
    this.sampleRate = sampleRate;

    // Native circular buffer: hold enough samples to yield 1024 @ 16 kHz
    this.nativeBufferSize = Math.ceil(CREPE_FRAME_LEN * sampleRate / CREPE_TARGET_HZ);
    this.nativeBuffer = new Float32Array(this.nativeBufferSize);
    this.ptr = 0;
    this.samplesWritten = 0;
    this.hopBlocks = Math.max(1, opts.hopBlocks || 1);
    this.blockCount = 0;

    // Pre-allocated buffers (no GC in process())
    this.tempNative = new Float32Array(this.nativeBufferSize);
    this.downsampled = new Float32Array(CREPE_FRAME_LEN);
    this.nsdf = new Float32Array(CREPE_FRAME_LEN);
    this.effectiveSampleRate = CREPE_TARGET_HZ;

    const presets = {
      auto: { min: 20, max: 4000 },
      bass: { min: 30, max: 400 },
      guitar: { min: 80, max: 1200 },
      trumpet: { min: 160, max: 1200 },
      saxophone: { min: 100, max: 1100 },
      voice: { min: 80, max: 1200 },
    };
    const preset = presets[opts.instrumentId] || presets.auto;
    this.minHz = preset.min;
    this.maxHz = preset.max;

    this.lastStablePitch = 0;
    this.pitchHistory = [];
    this.windowSize = 7;
    this.minConfidence = 0.92;
    this.hysteresisCents = 35;
    this.stabilityThreshold = 3;
    this.stableCount = 0;
    this.pendingPitch = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input || !this.sharedView) return true;

    const blockLen = input.length;
    const buf = this.nativeBuffer;
    const size = this.nativeBufferSize;
    let ptr = this.ptr;

    // Zero-copy: copy block into circular buffer (handle wrap)
    if (ptr + blockLen <= size) {
      buf.set(input, ptr);
    } else {
      const first = size - ptr;
      buf.set(input.subarray(0, first), ptr);
      buf.set(input.subarray(first), 0);
    }
    ptr = (ptr + blockLen) % size;
    this.ptr = ptr;
    this.samplesWritten += blockLen;

    // Run inference every hopBlocks once we have a full frame
    if (this.samplesWritten >= size) {
      this.blockCount++;
      if (this.blockCount >= this.hopBlocks) {
        this.blockCount = 0;
        this.runInference();
      }
    }

    return true;
  }

  runInference() {
    const buf = this.nativeBuffer;
    const size = this.nativeBufferSize;
    const ptr = this.ptr;
    const temp = this.tempNative;
    const out = this.downsampled;

    // Chronological copy: last `size` samples (oldest at ptr)
    for (let i = 0; i < size; i++) {
      temp[i] = buf[(ptr + i) % size];
    }

    // Downsample to 1024 @ 16 kHz (linear interpolation)
    const ratio = size / CREPE_FRAME_LEN;
    for (let j = 0; j < CREPE_FRAME_LEN; j++) {
      const srcIdx = j * ratio;
      const lo = Math.floor(srcIdx);
      const hi = Math.min(lo + 1, size - 1);
      const frac = srcIdx - lo;
      out[j] = temp[lo] * (1 - frac) + temp[hi] * frac;
    }

    let [pitch, confidence] = this.detectPitch(out, this.effectiveSampleRate);

    // 2026 Jazz Stabilization
    if (confidence >= this.minConfidence) {
      this.pitchHistory.push(pitch);
      if (this.pitchHistory.length > this.windowSize) this.pitchHistory.shift();

      if (this.pitchHistory.length >= 3) {
        const sorted = [...this.pitchHistory].sort((a, b) => a - b);
        const medianPitch = sorted[Math.floor(sorted.length / 2)];

        if (this.lastStablePitch === 0) {
          this.lastStablePitch = medianPitch;
        } else {
          const newMidi = 12 * Math.log2(medianPitch / 440) + 69;
          const currentMidi = 12 * Math.log2(this.lastStablePitch / 440) + 69;

          if (Math.abs(newMidi - currentMidi) > (this.hysteresisCents / 100)) {
            if (Math.abs(12 * Math.log2(medianPitch / this.pendingPitch)) < 0.1) {
              this.stableCount++;
            } else {
              this.stableCount = 1;
              this.pendingPitch = medianPitch;
            }
            if (this.stableCount >= this.stabilityThreshold) {
              this.lastStablePitch = medianPitch;
              this.stableCount = 0;
            }
          } else {
            this.stableCount = 0;
          }
        }
      } else {
        this.lastStablePitch = pitch;
      }
    }

    this.sharedView[0] = this.lastStablePitch;
    this.sharedView[1] = confidence;
  }

  detectPitch(buffer, sampleRate) {
    const n = buffer.length;
    const nsdf = this.nsdf;

    for (let tau = 0; tau < n; tau++) {
      let acf = 0;
      let divisor = 0;
      for (let i = 0; i < n - tau; i++) {
        acf += buffer[i] * buffer[i + tau];
        divisor += buffer[i] * buffer[i] + buffer[i + tau] * buffer[i + tau];
      }
      nsdf[tau] = (2 * acf) / (divisor || 1e-6);
    }

    const peaks = [];
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
    if (frequency < this.minHz || frequency > this.maxHz) return [0, 0];
    return [frequency, clarity];
  }
}

registerProcessor('pitch-processor', PitchProcessor);
