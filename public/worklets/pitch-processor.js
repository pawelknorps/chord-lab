/**
 * High-Performance Ear: Audio Worklet pitch processor.
 * Writes frequency and confidence to SharedArrayBuffer (index 0 and 1).
 * Uses McLeod Pitch Method (MPM); replace with CREPE-WASM when available.
 */
class PitchProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = options?.processorOptions || {};
    const sab = opts.sab;
    this.sharedView = sab ? new Float32Array(sab) : null;
    this.sampleRate = opts.sampleRate || 44100;
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.ptr = 0;
    this.processCount = 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input || !this.sharedView) return true;

    for (let i = 0; i < input.length; i++) {
      this.buffer[this.ptr++] = input[i];
      if (this.ptr >= this.bufferSize) {
        const [pitch, confidence] = this.detectPitch(this.buffer);
        this.sharedView[0] = pitch;
        this.sharedView[1] = confidence;
        this.ptr = 0;
      }
    }
    return true;
  }

  detectPitch(buffer) {
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
    const frequency = this.sampleRate / p;
    const clarity = nsdf[targetPeak];
    if (frequency < 20 || frequency > 4000) return [0, 0];
    return [frequency, clarity];
  }
}

registerProcessor('pitch-processor', PitchProcessor);
