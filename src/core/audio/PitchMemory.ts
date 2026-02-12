/**
 * Shared memory for the High-Performance Ear (CREPE-WASM / MPM).
 * 8 bytes: Float32 frequency, Float32 confidence. Main thread and Audio Worklet
 * share this buffer for zero-latency pitch reads (no postMessage).
 * Requires Cross-Origin Isolation (COOP/COEP) for SharedArrayBuffer.
 */
const BYTES = 2 * Float32Array.BYTES_PER_ELEMENT;

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
  view[0] = 0;
  view[1] = 0;
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
