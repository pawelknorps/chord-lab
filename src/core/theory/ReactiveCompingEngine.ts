import * as Tone from 'tone';
import type { CompingEngine } from './CompingEngine';

/**
 * Micro-timing offsets in seconds (small values for subtle "pocket").
 * Pad/Sustain: slight drag; Stabs: tight; Anticipations: push.
 */
const GROOVE_OFFSETS = {
  LayBack: 0.012,  // +12ms (sustained chords sit back)
  Tight: 0.006,    // +6ms (short comping)
  Push: -0.008,    // -8ms (anticipations create urgency)
};

export type BassMode = 'Walking' | 'TwoFeel';

export interface CompingHit {
  time: string;       // "0:beat:sixteenth" relative to bar
  duration: string;
  velocity: number;
  type: 'Pad' | 'Comp' | 'Ghost' | 'Push';
  isStab: boolean;
  isAnticipation?: boolean;
}

/**
 * ReactiveCompingEngine: "Virtual Room" piano that reacts to bass and drums.
 *
 * - Pocket: De-quantized timing (LayBack / Tight / Push) with small offsets.
 * - Conversation: If bass is Walking → sparse; TwoFeel → denser; drums loud → sparse.
 * - Variable articulation: Stabs use shell (3rd+7th), sustains use full voicing.
 */
export class ReactiveCompingEngine {
  private lastBarDensity = 0;

  /**
   * Target density 0–1. Walking bass → sparse (0.3); TwoFeel → denser (0.7).
   * Drums intensity > 0.8 → get out of the way (0.1).
   */
  getTargetDensity(drumIntensity: number, bassMode: BassMode): number {
    let target = bassMode === 'Walking' ? 0.3 : 0.7;
    if (drumIntensity > 0.8) target = 0.1;
    return target;
  }

  /**
   * Select a 1-bar comping template by target density.
   * Red Garland (sparse), Bill Evans (sustain), Herbie (dense).
   */
  selectTemplate(targetDensity: number): CompingHit[] {
    if (targetDensity < 0.4) {
      // Red Garland: syncopated off-beats, good with walking bass
      return [
        { time: '0:1:2', duration: '16n', velocity: 0.7, type: 'Comp', isStab: true },
        { time: '0:3:2', duration: '8n', velocity: 0.6, type: 'Comp', isStab: true, isAnticipation: true },
      ];
    }
    if (targetDensity < 0.7) {
      // Bill Evans: sustained color, good for two-feel or ballads
      return [
        { time: '0:0:0', duration: '2n', velocity: 0.5, type: 'Pad', isStab: false },
        { time: '0:2:2', duration: '8n', velocity: 0.4, type: 'Ghost', isStab: true },
      ];
    }
    // Herbie: aggressive rhythm, specific accents
    return [
      { time: '0:1:1', duration: '16n', velocity: 0.8, type: 'Comp', isStab: true },
      { time: '0:2:0', duration: '16n', velocity: 0.4, type: 'Ghost', isStab: true },
      { time: '0:3:2', duration: '8n', velocity: 0.9, type: 'Push', isStab: true, isAnticipation: true },
    ];
  }

  /**
   * Micro-timing in seconds: anticipations push, stabs tight, pads lay back.
   */
  getMicroTiming(hit: CompingHit): number {
    if (hit.type === 'Push' || (hit.time.includes('3:2') && hit.isAnticipation)) {
      return GROOVE_OFFSETS.Push;
    }
    if (hit.isStab) return GROOVE_OFFSETS.Tight;
    return GROOVE_OFFSETS.LayBack;
  }

  /**
   * Schedule all piano hits for one bar. Call at beat 0 with bar start time.
   * Uses compingEngine for voicings; anticipations use nextChord.
   */
  scheduleBar(
    time: number,
    barIndex: number,
    currentChord: string,
    nextChord: string,
    drumIntensity: number,
    bassMode: BassMode,
    compingEngine: CompingEngine,
    pianoSampler: Tone.Sampler | null,
    options: { addRoot?: boolean; onNote?: (note: { midi: number; velocity: number; instrument: string; type: string; duration: number }) => void } = {}
  ): void {
    if (!currentChord || !pianoSampler?.loaded) return;

    const targetDensity = this.getTargetDensity(drumIntensity, bassMode);
    const template = this.selectTemplate(targetDensity);
    this.lastBarDensity = targetDensity;

    const { addRoot = false, onNote } = options;
    const mainVoicing = compingEngine.getNextVoicing(currentChord, { addRoot });
    const hasAnticipation = template.some((h) => h.isAnticipation);
    const anticipationVoicing =
      hasAnticipation && nextChord ? compingEngine.getNextVoicing(nextChord, { addRoot }) : null;

    template.forEach((hit) => {
      const targetChord = hit.isAnticipation && nextChord ? nextChord : currentChord;
      const voicing = hit.isAnticipation && anticipationVoicing?.length ? anticipationVoicing : mainVoicing;
      const notes = hit.isStab && voicing.length >= 2 ? [voicing[0], voicing[1]] : voicing;
      if (notes.length === 0) return;

      const timeInBar = Tone.Time(hit.time).toSeconds();
      const humanize = this.getMicroTiming(hit);
      const scheduleTime = time + timeInBar + humanize;
      const vel = hit.velocity * (0.8 + Math.random() * 0.4);
      const noteNames = notes.map((n) => Tone.Frequency(n, 'midi').toNote());

      pianoSampler.triggerAttackRelease(noteNames, hit.duration, scheduleTime, vel);
      notes.forEach((midi) => {
        onNote?.({
          midi,
          velocity: vel,
          instrument: 'piano',
          type: 'comp',
          duration: 1,
        });
      });
    });
  }
}
