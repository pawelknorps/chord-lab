/**
 * Tests for audio glitch diagnosis: context isolation between playback (Tone) and pitch (mic + worklet).
 * See .planning/milestones/audio-glitch-diagnosis/
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use a constructor so instanceof checks pass; we need two distinct instances.
const FakeAudioContext = function (this: { state: string }) {
  this.state = 'running';
} as unknown as typeof AudioContext;

const playbackCtx = new (FakeAudioContext as any)();

vi.mock('tone', () => ({
  getContext: () => ({ rawContext: playbackCtx }),
}));

beforeEach(() => {
  vi.stubGlobal('AudioContext', FakeAudioContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('sharedAudioContext (audio glitch diagnosis)', () => {
  it('REQ-GLITCH-01: playback and pitch use different AudioContexts', async () => {
    vi.resetModules();
    const { getSharedAudioContext, getPitchAudioContext } = await import(
      './sharedAudioContext'
    );

    const shared = getSharedAudioContext();
    const pitch = getPitchAudioContext();

    expect(shared.context).toBe(playbackCtx);
    expect(pitch.context).toBeDefined();
    expect(pitch.context).not.toBe(playbackCtx);
    expect(pitch.context).toBeInstanceOf(FakeAudioContext);
  });

  it('getPitchAudioContext returns same context on repeated calls', async () => {
    vi.resetModules();
    const { getPitchAudioContext } = await import('./sharedAudioContext');

    const a = getPitchAudioContext();
    const b = getPitchAudioContext();

    expect(a.context).toBe(b.context);
  });
});
