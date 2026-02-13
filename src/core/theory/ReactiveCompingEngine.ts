/**
 * ReactiveCompingEngine – Listens to the "Virtual Room" (drums + bass)
 * and drives humanised piano comping: pocket (BPM-relative de-quantization),
 * conversation logic (sparse when bass is busy, dense when open; get out when drums are loud),
 * and vocabulary templates (Red Garland / Bill Evans / Herbie style).
 *
 * Combined with RhythmEngine: reactive target density drives RhythmEngine's energy;
 * pocket + shell/full + velocity humanization apply to every piano hit.
 */

export type BassMode = 'Walking' | 'TwoFeel';

/** Optional Phase 18 trio context: when solo or Ballad, density is capped (soloist space). */
export interface TrioContext { placeInCycle?: string; songStyle?: string }

/** Step-like shape for pocket calculation (RhythmEngine steps or internal hits). */
export interface StepLike {
    time: string;
    duration: string;
    isAnticipation?: boolean;
}

export interface CompingHit {
    /** Tone time within bar e.g. "0:1:2" */
    time: string;
    duration: string;
    velocity: number;
    type: 'Pad' | 'Comp' | 'Ghost' | 'Push';
    isStab: boolean;
    /** If true, play next bar's chord (anticipation) */
    isAnticipation?: boolean;
}

/** BPM-relative groove: fraction of one beat. Positive = late (drag), negative = early (push). */
const GROOVE_OFFSETS = {
    LayBack: 0.025,  // +25% of beat (pad/sustain – deep pocket)
    Tight: 0.010,    // +10% of beat (stabs/comping)
    Push: -0.015,    // -15% of beat (anticipation, "and of 4")
};

export class ReactiveCompingEngine {
    private lastBarDensity: number = 0;
    private soloistActivityWindow: number[] = [];
    private readonly WINDOW_SIZE = 8; // 8 bars / samples for smooth responsiveness

    /**
     * Update soloist activity (0.0 to 1.0) for the rolling window.
     * Higher activity (user playing more/faster) reduces comping density.
     */
    updateSoloistActivity(activity: number) {
        this.soloistActivityWindow.push(activity);
        if (this.soloistActivityWindow.length > this.WINDOW_SIZE) {
            this.soloistActivityWindow.shift();
        }
    }

    private getAverageSoloistActivity(): number {
        if (this.soloistActivityWindow.length === 0) return 0;
        return this.soloistActivityWindow.reduce((a, b) => a + b, 0) / this.soloistActivityWindow.length;
    }

    /**
     * Target density (0.0–1.0) from the "Virtual Room": bass mode + whole-tune intensity.
     * Intensity spans the tune arc (calm at start → peak toward middle → wind down).
     * Use as energy input to RhythmEngine.getRhythmPattern(bpm, targetDensity, opts)
     * so the band stays calm rhythmically at the beginning and rises toward the middle.
     * When trioContext indicates solo or Ballad, returned density is capped at 0.5 (hybrid—additive).
     */
    getTargetDensity(tuneIntensity: number, bassMode: BassMode, trioContext?: TrioContext): number {
        if (tuneIntensity > 0.85) return 0.1;
        const base = bassMode === 'Walking' ? 0.35 : 0.7;
        const target = base * (0.35 + 0.65 * tuneIntensity);
        this.lastBarDensity = Math.max(0.1, Math.min(1, target));
        const soloistSpace = trioContext && (trioContext.placeInCycle === 'solo' || trioContext.songStyle === 'Ballad');

        let density = soloistSpace ? Math.min(this.lastBarDensity, 0.5) : this.lastBarDensity;

        // REQ-AG-02: Reactive soloist space (Call-and-Response)
        const activity = this.getAverageSoloistActivity();
        density *= (1 - 0.55 * activity); // Up to 55% reduction when user is blazing

        return Math.max(0.05, density);
    }

    /**
     * BPM-relative human offset in seconds for any step (RhythmEngine or reactive).
     * Anticipations → Push; short stabs (8n/16n) → Tight; pads/sustains → LayBack.
     */
    getMicroTimingForStep(step: StepLike, bpm: number): number {
        const beatSeconds = 60 / Math.max(20, Math.min(400, bpm));
        const isAnticipation = step.isAnticipation || step.time.includes('3:2');
        if (isAnticipation) return beatSeconds * GROOVE_OFFSETS.Push;
        const isStab = step.duration === '8n' || step.duration === '16n';
        if (isStab) return beatSeconds * GROOVE_OFFSETS.Tight;
        // Long durations (4n, 2n, 4n., 2t, 4t, 8n.) get LayBack
        return beatSeconds * GROOVE_OFFSETS.LayBack;
    }

    /**
     * Returns comping hits for one bar with BPM-relative human offsets.
     * Call once per bar (e.g. at beat 0); then schedule each hit at
     * barStart + Tone.Time(hit.time).toSeconds() + hit.humanOffsetSeconds.
     *
     * @param drumIntensity 0.0 (brushes) to 1.0 (full swing)
     * @param bassMode "Walking" (busy) → sparse piano; "TwoFeel" (open) → denser
     */
    getCompingHitsForBar(
        drumIntensity: number,
        bassMode: BassMode,
        chordSymbol: string,
        _nextChordSymbol: string,
        bpm: number
    ): (CompingHit & { humanOffsetSeconds: number })[] {
        // 1. CONVERSATION: whole-tune intensity arc (calm start → middle peak) + bass mode
        let targetDensity = this.getTargetDensity(drumIntensity, bassMode);

        // 2. TEMPLATE (vocabulary)
        const template = this.selectTemplate(targetDensity, chordSymbol);

        // 3. MICRO-TIMING (pocket) – BPM-relative seconds
        const beatSeconds = 60 / Math.max(20, Math.min(400, bpm));
        return template.map((hit) => ({
            ...hit,
            humanOffsetSeconds: this.getMicroTiming(hit, beatSeconds),
        }));
    }

    /**
     * Human offset in seconds. Anticipations push; stabs drag slightly; pads drag more.
     */
    getMicroTiming(hit: CompingHit, beatSeconds: number): number {
        const isAnticipation = hit.isAnticipation || hit.type === 'Push' || (hit.time.includes('3:2'));
        if (isAnticipation) return beatSeconds * GROOVE_OFFSETS.Push;
        if (hit.isStab) return beatSeconds * GROOVE_OFFSETS.Tight;
        return beatSeconds * GROOVE_OFFSETS.LayBack;
    }

    /** Long-duration templates (quarters, halves, dotted, triplets) — used when intensity is low. */
    private static readonly LONG_TEMPLATES: CompingHit[][] = [
        [{ time: '0:0:0', duration: '2n', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '2n', velocity: 0.52, type: 'Pad', isStab: false }, { time: '0:2:0', duration: '2n', velocity: 0.48, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4n', velocity: 0.55, type: 'Pad', isStab: false }, { time: '0:1:0', duration: '4n', velocity: 0.5, type: 'Pad', isStab: false }, { time: '0:2:0', duration: '4n', velocity: 0.5, type: 'Pad', isStab: false }, { time: '0:3:0', duration: '4n', velocity: 0.48, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4n', velocity: 0.54, type: 'Pad', isStab: false }, { time: '0:1:0', duration: '4n', velocity: 0.5, type: 'Pad', isStab: false }, { time: '0:2:0', duration: '4n', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4n', velocity: 0.55, type: 'Pad', isStab: false }, { time: '0:2:0', duration: '4n', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4n', velocity: 0.54, type: 'Pad', isStab: false }, { time: '0:1:0', duration: '2n', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4n.', velocity: 0.54, type: 'Pad', isStab: false }, { time: '0:1:2', duration: '4n', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4n', velocity: 0.54, type: 'Pad', isStab: false }, { time: '0:1:2', duration: '4n.', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '2n', velocity: 0.52, type: 'Pad', isStab: false }, { time: '0:2:0', duration: '4n', velocity: 0.48, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '2t', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4t', velocity: 0.52, type: 'Pad', isStab: false }, { time: '0:1:0', duration: '4t', velocity: 0.5, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '4t', velocity: 0.52, type: 'Pad', isStab: false }, { time: '0:1:0', duration: '4t', velocity: 0.5, type: 'Pad', isStab: false }, { time: '0:2:0', duration: '4t', velocity: 0.48, type: 'Pad', isStab: false }],
        [{ time: '0:0:0', duration: '2n', velocity: 0.52, type: 'Pad', isStab: false }, { time: '0:2:0', duration: '2t', velocity: 0.48, type: 'Pad', isStab: false }],
    ];

    private selectTemplate(density: number, _chord: string): CompingHit[] {
        this.lastBarDensity = density;

        // A. Low intensity: prioritize long durations — quarters, halves, dotted, triplets
        if (density < 0.4) {
            const idx = Math.floor(Math.random() * ReactiveCompingEngine.LONG_TEMPLATES.length);
            return ReactiveCompingEngine.LONG_TEMPLATES[idx]!;
        }

        // B. Medium intensity: sustained color with some movement (Bill Evans style)
        if (density < 0.7) {
            return [
                { time: '0:0:0', duration: '2n', velocity: 0.5, type: 'Pad', isStab: false },
                { time: '0:2:2', duration: '4n', velocity: 0.45, type: 'Comp', isStab: false },
            ];
        }

        // C. High intensity: Herbie – aggressive rhythm, anticipations
        return [
            { time: '0:1:1', duration: '16n', velocity: 0.8, type: 'Comp', isStab: true },
            { time: '0:2:0', duration: '16n', velocity: 0.4, type: 'Ghost', isStab: true },
            { time: '0:3:2', duration: '8n', velocity: 0.9, type: 'Push', isStab: true, isAnticipation: true },
        ];
    }
}
