/**
 * Central app-wide microphone service (REQ-MIC-01, REQ-MIC-02).
 * Owns a single getUserMedia stream; all modules consume this service.
 * Does not open mic automatically; requires explicit start() (e.g. user action).
 *
 * Modes (REQ-MIC-05): "pitch" (Harmonic Mirror) is the default; consumers use
 * useAuralMirror() or createPitchPipeline(stream) to subscribe to pitch.
 * "rhythm" (clapping/beat) is secondary; onset/beat subscription can be added when needed.
 */

const STORAGE_KEY = 'mic-preferred-device-id';

let stream: MediaStream | null = null;
let preferredDeviceId: string | null =
  (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

/**
 * List audio input devices (microphones). Call after user gesture if permissions not yet granted.
 */
export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'audioinput');
}

/**
 * Set preferred microphone device ID. Next start() will use this device.
 * Pass null to use system default (good when only one device or default works).
 */
export function setPreferredDeviceId(deviceId: string | null): void {
  preferredDeviceId = deviceId;
  if (typeof localStorage !== 'undefined') {
    if (deviceId) localStorage.setItem(STORAGE_KEY, deviceId);
    else localStorage.removeItem(STORAGE_KEY);
  }
}

export function getPreferredDeviceId(): string | null {
  return preferredDeviceId;
}

/**
 * Label of the current stream's audio track (e.g. "Built-in Microphone"). Null if no stream.
 */
export function getCurrentDeviceLabel(): string | null {
  const track = stream?.getAudioTracks()[0];
  return track?.label ?? null;
}

/**
 * Request microphone access and start the single app-wide stream.
 * Uses preferredDeviceId if set (exact device so MIDI/playback isn't picked up).
 * Pass null preferredDeviceId to use system default (single device that worked).
 * Idempotent if already active (same device).
 */
export async function start(): Promise<void> {
  const audioConstraints: MediaTrackConstraints = {
    // @ts-expect-error - voiceIsolation is a 2026/modern browser feature
    voiceIsolation: true,
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
  if (preferredDeviceId) {
    audioConstraints.deviceId = { exact: preferredDeviceId };
  }

  if (stream != null && stream.active) {
    const currentId = stream.getAudioTracks()[0]?.getSettings().deviceId;
    if (currentId === preferredDeviceId || (!preferredDeviceId && currentId)) return;
  }
  if (stream != null) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  const constraints: MediaStreamConstraints = {
    audio: audioConstraints,
    video: false,
  };
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    if (preferredDeviceId && err instanceof OverconstrainedError && err.constraint === 'deviceId') {
      preferredDeviceId = null;
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
      const fallback: MediaStreamConstraints = {
        audio: { ...audioConstraints, deviceId: undefined },
        video: false,
      };
      stream = await navigator.mediaDevices.getUserMedia(fallback);
    } else {
      throw err;
    }
  }
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
