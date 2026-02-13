/**
 * Phase 17: Pro 2-bar break for Call and Response.
 * Uses DrumEngine (theory) to generate phrase + fill; returns hits and onset times for alignment.
 */

import * as Tone from 'tone';
import { DrumEngine, type DrumHit } from '../../../core/theory/DrumEngine';

export const CALL_RESPONSE_BPM = 120;

/** Generate a 2-bar "pro" break: bar 1 = linear phrase, bar 2 = fill (theory-driven, challenging). */
export function generateTwoBarBreak(bpm: number = CALL_RESPONSE_BPM): {
  hits: DrumHit[];
  onsetTimesSec: number[];
  totalSec: number;
  bpm: number;
} {
  const engine = new DrumEngine();
  const density = 0.5;

  // Bar 0: linear phrase (Ride/Snare interlock, hi-hat 2 & 4)
  const bar0 = engine.generateBar(density, 0, 0);
  // Bar 1: fill (phrase-end bar so engine may use fill; use barIndex 3 for fill)
  const bar1Raw = engine.generateBar(density, 0, 3);
  // Re-time bar 1 hits from "0:beat:sixteenth" to "1:beat:sixteenth"
  const bar1: DrumHit[] = bar1Raw.map((h) => {
    const [, beat, sixteenth] = h.time.split(':');
    return { ...h, time: `1:${beat}:${sixteenth}` };
  });

  const hits = [...bar0, ...bar1];

  // Onset times in seconds from start (Tone uses Transport BPM)
  Tone.Transport.bpm.value = bpm;
  const onsetSet = new Set<number>();
  hits.forEach((h) => {
    const sec = Tone.Time(h.time).toSeconds();
    onsetSet.add(Math.round(sec * 1000) / 1000);
  });
  const onsetTimesSec = [...onsetSet].sort((a, b) => a - b);
  const totalSec = Tone.Time('2m').toSeconds(); // 2 bars

  return { hits, onsetTimesSec, totalSec, bpm };
}
