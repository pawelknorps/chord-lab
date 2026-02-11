/**
 * Central app-wide microphone service (REQ-MIC-01, REQ-MIC-02).
 * Owns a single getUserMedia stream; all modules consume this service.
 * Does not open mic automatically; requires explicit start() (e.g. user action).
 *
 * Modes (REQ-MIC-05): "pitch" (Harmonic Mirror) is the default; consumers use
 * useAuralMirror() or createPitchPipeline(stream) to subscribe to pitch.
 * "rhythm" (clapping/beat) is secondary; onset/beat subscription can be added when needed.
 */

let stream: MediaStream | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

/**
 * Request microphone access and start the single app-wide stream.
 * Idempotent if already active.
 */
export async function start(): Promise<void> {
  if (stream != null && stream.active) return;
  if (stream != null) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  const constraints: MediaStreamConstraints = {
    audio: {
      // @ts-expect-error - voiceIsolation is a 2026/modern browser feature
      voiceIsolation: true,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  };
  stream = await navigator.mediaDevices.getUserMedia(constraints);
  notify();
}

/**
 * Stop all tracks and release the stream. Safe to call when already stopped.
 */
export function stop(): void {
  if (stream == null) return;
  stream.getTracks().forEach((t) => t.stop());
  stream = null;
  notify();
}

/**
 * True when a stream exists and is active.
 */
export function isActive(): boolean {
  return stream != null && stream.active;
}

/**
 * Current stream for consumers (e.g. AnalyserNode, pitch detector). Null when stopped.
 */
export function getStream(): MediaStream | null {
  return stream;
}

/**
 * Subscribe to stream lifecycle changes (start/stop). Returns unsubscribe.
 */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
