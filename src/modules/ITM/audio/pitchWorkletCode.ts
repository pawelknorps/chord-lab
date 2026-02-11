/**
 * Audio Worklet Processor for high-performance pitch detection.
 * Uses a robust McLeod Pitch Method (MPM) implementation and writes results to a SharedArrayBuffer.
 */

export const pitchWorkletCode = `
class PitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sharedBuffer = null;
    this.sampleRate = 44100;
    
    // Config
    this.bufferSize = 2048; // Standard for jazz-proof low-end
    this.inputBuffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.processCount = 0;
    
    this.port.onmessage = (event) => {
      if (event.data.type === 'init') {
        this.sharedBuffer = new Float32Array(event.data.buffer);
        this.sampleRate = event.data.sampleRate || 44100;
      }
    };
  }

  process(inputs) {
    const input = inputs[0][0];
    if (!input || !this.sharedBuffer) return true;

    // 1. Fill ring buffer
    for (let i = 0; i < input.length; i++) {
        this.inputBuffer[this.writeIndex] = input[i];
        this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
    }

    // 2. Perform detection every 4 calls (~512 samples / 11ms / 86Hz)
    // This provides a good balance between responsiveness and CPU usage.
    this.processCount++;
    if (this.processCount >= 4) {
        this.processCount = 0;
        const [pitch, clarity] = this.detectPitch(this.getLatestBuffer());

        // 3. Write to SharedArrayBuffer
        // Index 0: Frequency, Index 1: Clarity, Index 2: Timestamp
        this.sharedBuffer[0] = pitch;
        this.sharedBuffer[1] = clarity;
        this.sharedBuffer[2] = currentTime;
    }

    return true;
  }

  getLatestBuffer() {
      const buffer = new Float32Array(this.bufferSize);
      for (let i = 0; i < this.bufferSize; i++) {
          buffer[i] = this.inputBuffer[(this.writeIndex + i) % this.bufferSize];
      }
      return buffer;
  }

  /**
   * McLeod Pitch Method (MPM) - A robust pitch detection algorithm.
   * Implementation optimized for the AudioWorklet.
   */
  detectPitch(buffer) {
      const n = buffer.length;
      const nsdf = new Float32Array(n);
      
      // 1. Compute NSDF (Normalized Square Difference Function)
      for (let tau = 0; tau < n; tau++) {
          let acf = 0;
          let divisor = 0;
          for (let i = 0; i < n - tau; i++) {
              acf += buffer[i] * buffer[i + tau];
              divisor += buffer[i] * buffer[i] + buffer[i + tau] * buffer[i + tau];
          }
          nsdf[tau] = (2 * acf) / (divisor || 1e-6);
      }

      // 2. Find peaks in NSDF
      const peaks = [];
      for (let i = 1; i < n - 1; i++) {
          if (nsdf[i] > nsdf[i - 1] && nsdf[i] > nsdf[i + 1]) {
              peaks.push(i);
          }
      }

      if (peaks.length === 0) return [0, 0];

      // 3. Select the best peak (highest within a threshold)
      let maxNsdf = 0;
      for (let i = 0; i < peaks.length; i++) {
          if (nsdf[peaks[i]] > maxNsdf) maxNsdf = nsdf[peaks[i]];
      }

      const threshold = 0.9 * maxNsdf;
      let targetPeak = -1;
      
      for (let i = 0; i < peaks.length; i++) {
          const peak = peaks[i];
          if (nsdf[peak] >= threshold) {
              targetPeak = peak;
              break;
          }
      }

      if (targetPeak === -1) return [0, 0];

      // 4. Parabolic Interpolation for higher precision
      const x0 = targetPeak - 1;
      const x1 = targetPeak;
      const x2 = targetPeak + 1;
      const y0 = nsdf[x0];
      const y1 = nsdf[x1];
      const y2 = nsdf[x2];
      
      const p = x1 + (y0 - y2) / (2 * (y0 - 2 * y1 + y2) || 1e-6);
      const frequency = this.sampleRate / p;
      const clarity = nsdf[targetPeak];

      // Frequency filtering (ignore unrealistic results)
      if (frequency < 20 || frequency > 4000) return [0, 0];

      return [frequency, clarity];
  }
}

registerProcessor('pitch-processor', PitchProcessor);
`;
