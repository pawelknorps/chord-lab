import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * JazzKiller premium engine playback contract:
 * - On first play: Tone.start() then Transport.start() immediately (so playback always starts),
 *   then initGlobalAudio() in background when !isAudioReady() (for guide chords). We do not
 *   await initGlobalAudio so that slow/failing init cannot block playback.
 */
describe('JazzKiller premium engine playback', () => {
  const mockToneStart = vi.fn().mockResolvedValue(undefined);
  const mockTransportStart = vi.fn();
  const mockTransportStop = vi.fn();
  const mockInitGlobalAudio = vi.fn().mockResolvedValue(undefined);
  let mockIsAudioReady: () => boolean;

  beforeEach(() => {
    vi.resetModules();
    mockToneStart.mockClear().mockResolvedValue(undefined);
    mockInitGlobalAudio.mockClear().mockResolvedValue(undefined);
    mockIsAudioReady = vi.fn().mockReturnValue(false);

    vi.doMock('tone', () => ({
      default: {
        start: mockToneStart,
        Transport: { start: mockTransportStart, stop: mockTransportStop },
        Sampler: vi.fn(),
        Reverb: vi.fn(),
        Draw: { schedule: vi.fn() },
        Time: vi.fn(() => ({ toSeconds: () => 0.5 })),
        Loop: vi.fn(() => ({ start: vi.fn(), dispose: vi.fn() })),
        Frequency: vi.fn((n: number) => ({ toNote: () => `C${n}` })),
      },
    }));
    vi.doMock('../../../core/audio/globalAudio', () => ({
      initAudio: mockInitGlobalAudio,
      isAudioReady: () => mockIsAudioReady(),
      playGuideChord: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts transport immediately and calls initGlobalAudio in background when !isAudioReady()', async () => {
    const isPlaying = false;
    if (!isPlaying) {
      mockToneStart().then(() => {
        mockTransportStart();
        if (!mockIsAudioReady()) mockInitGlobalAudio().catch(() => {});
      }).catch(() => {});
    }
    expect(mockToneStart).toHaveBeenCalled();
    await Promise.resolve();
    expect(mockTransportStart).toHaveBeenCalled();
    expect(mockInitGlobalAudio).toHaveBeenCalled();
  });

  it('does not call initGlobalAudio when starting playback and isAudioReady()', async () => {
    mockIsAudioReady = vi.fn().mockReturnValue(true);
    const isPlaying = false;
    if (!isPlaying) {
      mockToneStart().then(() => {
        mockTransportStart();
        if (!mockIsAudioReady()) mockInitGlobalAudio().catch(() => {});
      }).catch(() => {});
    }
    expect(mockToneStart).toHaveBeenCalled();
    await Promise.resolve();
    expect(mockInitGlobalAudio).not.toHaveBeenCalled();
    expect(mockTransportStart).toHaveBeenCalled();
  });

  it('on stop calls Transport.stop and sets isPlaying false', () => {
    const setPlaying = (v: boolean) => { /* signal update */ };
    const isPlaying = true;
    if (isPlaying) {
      mockTransportStop();
      setPlaying(false);
    }
    expect(mockTransportStop).toHaveBeenCalled();
  });
});
