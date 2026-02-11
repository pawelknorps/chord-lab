/**
 * High-Performance Ear (2026): Zero-latency pitch processor.
 * - Captures 128-sample buffers from the mic, fills a 1024-sample circular buffer.
 * - Runs MPM (or CREPE-WASM when available) and writes frequency + confidence to SAB.
 * - Throttled: run pitch detection every 2nd full buffer to avoid glitching playback.
 * - Float32Array on SAB: single writer (worklet) / single reader (main thread); direct write.
 */
class PitchProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = options?.processorOptions || {};
    const sab = opts.sab;
    this.sharedView = sab ? new Float32Array(sab) : null;
    this.sampleRate = opts.sampleRate || 44100;
    this.bufferSize = 1024; // CREPE window size
    this.buffer = new Float32Array(this.bufferSize);
    this.ptr = 0;
    this.runCount = 0; // run MPM every 2nd full buffer to reduce CPU on audio thread

    // Instrument presets (inlined for Worklet)
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

    // Stabilization state (inlined logic for Worklet)
    this.lastStablePitch = 0;
    this.pitchHistory = [];
    this.windowSize = 5;
    this.minConfidence = 0.85;
    this.hysteresisCents = 20;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input || !this.sharedView) return true;

    for (let i = 0; i < input.length; i++) {
      this.buffer[this.ptr++] = input[i];
      if (this.ptr >= this.bufferSize) {
        this.ptr = 0;
        this.runCount++;
        if (this.runCount >= 2) {
          this.runCount = 0;
          let [pitch, confidence] = this.detectPitch(this.buffer);

          // In-Worklet Stabilization
          if (confidence >= this.minConfidence) {
            this.pitchHistory.push(pitch);
            if (this.pitchHistory.length > this.windowSize) this.pitchHistory.shift();

            if (this.pitchHistory.length >= 3) {
              const sorted = [...this.pitchHistory].sort((a, b) => a - b);
              const medianPitch = sorted[Math.floor(sorted.length / 2)];

              if (this.lastStablePitch === 0) {
                this.lastStablePitch = medianPitch;
              } else {
                const centDiff = 1200 * Math.log2(medianPitch / this.lastStablePitch);
                if (Math.abs(centDiff) > this.hysteresisCents) {
                  this.lastStablePitch = medianPitch;
                }
              }
            } else {
              this.lastStablePitch = pitch;
            }
          }

          // Write stabilized values
          this.sharedView[0] = this.lastStablePitch;
          this.sharedView[1] = confidence;
        }
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
    if (frequency < this.minHz || frequency > this.maxHz) return [0, 0];
    return [frequency, clarity];
  }
}

registerProcessor('pitch-processor', PitchProcessor);
