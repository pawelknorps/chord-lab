/**
 * Shared memory for the High-Performance Ear (SwiftF0 / MPM).
 * 8 bytes: Float32 frequency, Float32 confidence. Main thread and Audio Worklet
 * share this buffer for zero-latency pitch reads (no postMessage).
 * Requires Cross-Origin Isolation (COOP/COEP) for SharedArrayBuffer.
 */
const BYTES = 6 * Float32Array.BYTES_PER_ELEMENT;

export interface PitchMemoryResult {
  sab: SharedArrayBuffer;
  view: Float32Array;
}

export function createPitchMemory(): PitchMemoryResult {
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error(
      'SharedArrayBuffer is not available. Enable Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp.'
    );
  }
  const sab = new SharedArrayBuffer(BYTES);
  const view = new Float32Array(sab);
  view[0] = 0; // frequency
  view[1] = 0; // confidence
  view[2] = 0; // rms
  view[3] = 0; // onset
  view[4] = 0; // lastUpdated (performance.now() proxy)
  view[5] = 0; // latencyScore (ms)
  return { sab, view };
}

export interface PcmMemoryResult {
  sab: SharedArrayBuffer;
  view: Float32Array;
}

export function createPcmMemory(): PcmMemoryResult {
  if (typeof SharedArrayBuffer === 'undefined') {
    throw new Error('SharedArrayBuffer is not available.');
  }
  const sab = new SharedArrayBuffer(1024 * Float32Array.BYTES_PER_ELEMENT);
  const view = new Float32Array(sab);
  return { sab, view };
}

export function isPitchMemorySupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined';
}
