/**
 * Tests for audio glitch diagnosis: pitch pipeline context usage and main-thread load.
 * See .planning/milestones/audio-glitch-diagnosis/
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Pitch pipeline context usage (REQ-GLITCH-02)', () => {
  beforeEach(() => {
    vi.stubGlobal('SharedArrayBuffer', class SharedArrayBuffer {
      byteLength = 16;
      constructor(_length: number) {}
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('createPitchPipeline uses getPitchAudioContext (not Tone)', async () => {
    const getPitchAudioContext = vi.fn(() => {
      const gainRef = { value: 1.5 };
      const analyserRef = { fftSize: 2048, smoothingTimeConstant: 0.8, getByteTimeDomainData: vi.fn() };
      const sourceRef = { connect: vi.fn(), disconnect: vi.fn() };
      return {
        context: {
          state: 'running',
          sampleRate: 44100,
          createMediaStreamSource: () => sourceRef,
          createGain: () => ({ gain: gainRef, connect: vi.fn(), disconnect: vi.fn() }),
          createAnalyser: () => ({ ...analyserRef, connect: vi.fn(), disconnect: vi.fn(), frequencyBinCount: 2048 }),
        },
        owned: true,
      };
    });

    vi.doMock('./sharedAudioContext', () => ({
      getPitchAudioContext,
    }));

    const { createPitchPipeline } = await import('./pitchDetection');

    const fakeStream = {
      active: true,
      getAudioTracks: () => [],
    } as unknown as MediaStream;

    const pipeline = createPitchPipeline(fakeStream);

    expect(getPitchAudioContext).toHaveBeenCalled();
    pipeline.stop();
  });
});

describe('Main-thread load vs Tone scheduling (REQ-GLITCH-03)', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('simulated heavy RAF work does not prevent scheduled callback from firing', async () => {
    const scheduledTimes: number[] = [];
    const scheduleCallback = (): void => {
      scheduledTimes.push(performance.now());
    };

    // Simulate: requestAnimationFrame loop that does "work" (busy-wait a tiny bit)
    const rafLoop = (): void => {
      const start = performance.now();
      while (performance.now() - start < 2) {
        // ~2ms busy work per frame (simulates pitch read + store + React)
      }
      if (scheduledTimes.length === 0) requestAnimationFrame(rafLoop);
    };

    // Schedule a "Tone-like" callback in 3 frames
    let frameCount = 0;
    const scheduleInFrames = (): void => {
      frameCount++;
      if (frameCount >= 3) {
        scheduleCallback();
        return;
      }
      requestAnimationFrame(scheduleInFrames);
    };

    requestAnimationFrame(rafLoop);
    requestAnimationFrame(scheduleInFrames);

    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (scheduledTimes.length > 0) {
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });

    expect(scheduledTimes.length).toBeGreaterThanOrEqual(1);
    // If main-thread were starved, this would never fire or fire very late.
    // We only assert it fired; threshold assertion can be added with real Tone.
  });
});
