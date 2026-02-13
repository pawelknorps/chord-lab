/**
 * High-Performance Ear (2026): Low-latency pitch processor.
 * - AUDIO-THREAD LIGHT: Only copy, downsample, and write RMS/onset to SAB.
 * - MPM (autocorrelation) runs in MpmWorker; SwiftF0 runs in SwiftF0Worker (CREPE not used).
 * - Zero-copy circular buffer; downsample to 16 kHz for SwiftF0 and MPM worker.
 */
const CREPE_TARGET_HZ = 16000; // Frame format (16 kHz); SwiftF0 uses same format
const CREPE_FRAME_LEN = 1024;

class PitchProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = options?.processorOptions || {};
    const sab = opts.sab;
    this.sharedView = sab ? new Float32Array(sab) : null;
    const pcmSab = opts.pcmSab;
    this.pcmView = pcmSab ? new Float32Array(pcmSab) : null;
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

    // Onset / RMS Tracking
    this.currentRms = 0;
    this.lastRms = 0;
    this.onsetThreshold = 0.05; // Relative jump for "clap" detection
    this.onsetTime = 0;

    const presets = {
      auto: { min: 20, max: 4000 },
      bass: { min: 30, max: 400 },
      guitar: { min: 80, max: 1200 },
      trumpet: { min: 160, max: 1200 },
      saxophone: { min: 100, max: 1100 },
      voice: { min: 80, max: 1200 },
    };
    // Presets kept for possible future use; MPM runs in MpmWorker now
    const preset = presets[opts.instrumentId] || presets.auto;
    this.minHz = preset.min;
    this.maxHz = preset.max;
    this.performanceOffset = opts.performanceOffset || 0;
  }

  process(inputs) {
    const input = inputs[0]?.[0];
    if (!input || !this.sharedView) return true;

    const blockLen = input.length;
    const buf = this.nativeBuffer;
    const size = this.nativeBufferSize;
    let ptr = this.ptr;

    // RMS calculation for current block
    let sum = 0;
    for (let i = 0; i < blockLen; i++) {
      sum += input[i] * input[i];
    }
    this.currentRms = Math.sqrt(sum / blockLen);

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

    // Write RMS and onset every block (light; no MPM here)
    let onset = 0;
    if (this.currentRms > this.lastRms + this.onsetThreshold && this.currentRms > 0.02) {
      onset = 1;
    }
    this.lastRms = this.currentRms;
    this.sharedView[2] = this.currentRms;
    this.sharedView[3] = onset;

    // When buffer full: copy + downsample + write to pcmSab only. MPM runs in MpmWorker.
    // CRITICAL: consume the frame (samplesWritten -= size) so we only do this once per frame.
    // Without this we ran downsampling every process() call (~2.9 ms) and blocked the audio
    // thread → playback dropouts when pitch detection and playback run together.
    if (this.samplesWritten >= size) {
      const buf = this.nativeBuffer;
      const temp = this.tempNative;
      const out = this.downsampled;
      for (let i = 0; i < size; i++) {
        temp[i] = buf[(ptr + i) % size];
      }
      const ratio = size / CREPE_FRAME_LEN;
      for (let j = 0; j < CREPE_FRAME_LEN; j++) {
        const srcIdx = j * ratio;
        const lo = Math.floor(srcIdx);
        const hi = Math.min(lo + 1, size - 1);
        const frac = srcIdx - lo;
        out[j] = temp[lo] * (1 - frac) + temp[hi] * frac;
      }
      if (this.pcmView) {
        this.pcmView.set(out);
      }
      // REQ-AG-05: Record capture timestamp for latency tracking
      if (this.sharedView) {
        // Use provided offset + currentTime if performance.now() is missing (REQ-FIX-01)
        this.sharedView[4] = (typeof performance !== 'undefined')
          ? performance.now()
          : (currentTime * 1000 + this.performanceOffset);
      }
      this.samplesWritten -= size;
    }

    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);
