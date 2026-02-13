/**
 * AudioContext usage:
 * - getSharedAudioContext(): Tone's context (for playback only). Used by globalAudio.
 * - getPitchAudioContext(): Dedicated context for mic + pitch worklet only. Keeps
 *   heavy pitch processing off the playback thread so JazzKiller doesn't glitch
 *   when pitch detection and playback run together.
 */

import * as Tone from 'tone';

let fallbackContext: AudioContext | null = null;
let pitchContext: AudioContext | null = null;

const NativeAC = typeof globalThis !== 'undefined' ? (globalThis as Window & { AudioContext?: typeof AudioContext }).AudioContext : undefined;

/** Get the shared native AudioContext (Tone's after init, or a single fallback). Used for playback only. */
export function getSharedAudioContext(): { context: AudioContext; owned: boolean } {
  if (NativeAC) {
    try {
      const toneCtx = Tone.getContext();
      const raw = (toneCtx as { rawContext?: unknown }).rawContext;
      if (raw && raw instanceof NativeAC) return { context: raw as AudioContext, owned: false };
    } catch {
      // Tone not ready
    }
  }
  if (!fallbackContext) fallbackContext = new (NativeAC || AudioContext)({ latencyHint: 'interactive', sampleRate: 44100 });
  return { context: fallbackContext, owned: true };
}

/**
 * Get a dedicated AudioContext for the pitch pipeline (mic → worklet).
 * Must not be Tone's context so that heavy pitch worklet processing cannot block
 * playback and cause glitches when both are active.
 *
 * Uses latencyHint: 'interactive' so the browser uses smaller internal buffers
 * and delivers 128-sample blocks to the worklet with minimal delay. (The
 * render quantum size is fixed at 128 samples; we can only influence how
 * soon the context delivers those blocks.) For an even lower target, some
 * browsers accept a numeric latencyHint in seconds (e.g. 0.01 for 10 ms).
 */
export function getPitchAudioContext(): { context: AudioContext; owned: boolean } {
  if (!NativeAC) {
    if (!pitchContext) pitchContext = new AudioContext({ latencyHint: 'interactive', sampleRate: 44100 });
    return { context: pitchContext, owned: true };
  }
  if (!pitchContext || pitchContext.state === 'closed') {
    pitchContext = new NativeAC({ latencyHint: 'interactive', sampleRate: 44100 });
  }
  return { context: pitchContext, owned: true };
}

/** Close the dedicated pitch context (e.g. when pitch store cleans up). Call from app code that owns the pitch pipeline. */
export function closePitchAudioContext(): void {
  if (pitchContext) {
    void pitchContext.close();
    pitchContext = null;
  }
}
