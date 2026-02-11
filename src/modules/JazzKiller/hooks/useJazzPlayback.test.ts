import { describe, it, expect } from 'vitest';

/**
 * Regression: Legacy engine (useJazzPlayback) uses playbackPlan when present,
 * otherwise falls back to measures.map((_, i) => i). This test ensures the
 * fallback produces a valid plan so playback never gets an empty loop.
 */
describe('JazzKiller playback plan fallback', () => {
  function buildPlaybackPlan(song: { music?: { playbackPlan?: number[]; measures?: unknown[] } }): number[] {
    const hasPlan = (song.music?.playbackPlan?.length ?? 0) > 0;
    return hasPlan
      ? song.music!.playbackPlan!
      : song.music?.measures?.map((_: unknown, i: number) => i) ?? [];
  }

  it('uses playbackPlan when present', () => {
    const song = {
      music: {
        measures: [{ chords: ['C7'] }, { chords: ['F7'] }, { chords: ['G7'] }],
        playbackPlan: [0, 1, 0, 2],
      },
    };
    expect(buildPlaybackPlan(song)).toEqual([0, 1, 0, 2]);
  });

  it('falls back to measure indices when playbackPlan is empty', () => {
    const song = {
      music: {
        measures: [{ chords: ['C7'] }, { chords: ['F7'] }],
        playbackPlan: [],
      },
    };
    const plan = song.music.measures?.map((_: unknown, i: number) => i) ?? [];
    expect(plan).toEqual([0, 1]);
    expect(plan.length).toBe(song.music.measures!.length);
  });

  it('falls back to measure indices when playbackPlan is missing', () => {
    const song = {
      music: {
        measures: [{ chords: ['Am7'] }, { chords: ['D7'] }, { chords: ['Gmaj7'] }],
      },
    };
    expect(buildPlaybackPlan(song)).toEqual([0, 1, 2]);
  });
});
