/**
 * Elastic Pulse Generation (2026 SOTA): Driving ride and lazy hi-hat.
 *
 * 1. Variable Swing Ratios by tempo (60–120: 3:1, 120–180: 2:1, 180–240: 1.5:1, 240+: ~1.1:1).
 * 2. Backbeat tension: skip-beat velocity = 0.65 × preceding pulse (rebound, not independent).
 * 3. Rotational velocity: ride drives; hi-hat "lazy" +5–10ms on 2 & 4 for pocket.
 *
 * Pattern library: Fundamental (Spang-a-Lang, Four-on-the-Floor), Bop/Propulsive (Bop Skip),
 * Ballad/Linear (Jazz Waltz). Time unit T = 1 quarter note; δ = swing offset (skip position).
 *
 * SOTA precision (2026):
 * - Cymbal wash: use long-release ride sample; do not cut the previous hit when a new one starts (let frequencies stack).
 * - Velocity humanization: ±5% on vel.
 * - Hi-Hat Link: beats 2 and 4 (or beat 2 in 3/4) trigger simultaneous pedal hi-hat at vel 1.2 for the "snap."
 */

import { GrooveManager } from '../theory/GrooveManager';

const RIDE_JITTER_MS = 3;
const LAZY_HAT_MS = 0.007; // 5–10ms: ride pulls forward, hi-hat sits back
const VELOCITY_HUMANIZE_PERCENT = 0.05; // ±5% on vel
const HI_HAT_LINK_VEL = 1.2; // Pedal hi-hat "snap" on 2 & 4

/** Functional role for pattern selection (Fundamental, Bop/Propulsive, Ballad/Linear). */
export type PatternRole = 'Fundamental' | 'Bop/Propulsive' | 'Ballad/Linear';

/** One ride hit in normalized time (beat = quarter-note index; isSkip = use δ offset). */
export interface RideHit {
    beat: number;
    vel: number;
    isSkip?: boolean;
}

/** Hi-Hat Link: beat indices (0-based) that get a simultaneous pedal hi-hat at vel 1.2. */
export interface JazzPatternDef {
    id: string;
    role: PatternRole;
    hits: RideHit[];
    /** Beat indices (0-based) for pedal hi-hat: [1, 3] = 2 & 4 in 4/4; [1] = beat 2 in 3/4. */
    hiHatBeats: number[];
    /** Beats per bar (4 or 3). */
    beatsPerBar: number;
}

/**
 * Pattern library: normalized time unit T = 1 quarter note. δ (swing offset) applied at schedule time from getSwingRatio(bpm).
 * STANDARD = Spang-a-Lang (4/4). FOUR_ON_FLOOR = straight quarter pulse (Gypsy/early swing). BOP_DRIVE = skip on 2 omitted (>220 BPM). WALTZ = 3/4.
 */
export const JAZZ_RIDE_PATTERNS: Record<string, JazzPatternDef> = {
    /** Baseline for ~90% of jazz: walking feel, skip on 2+ and 4+ ghosted for shimmer. */
    STANDARD: {
        id: 'STANDARD',
        role: 'Fundamental',
        beatsPerBar: 4,
        hiHatBeats: [1, 3],
        hits: [
            { beat: 0, vel: 0.8 },
            { beat: 1, vel: 1.1 },
            { beat: 1, vel: 0.7, isSkip: true },
            { beat: 2, vel: 0.9 },
            { beat: 3, vel: 1.1 },
            { beat: 3, vel: 0.7, isSkip: true }
        ]
    },
    /** Straight quarter pulse; no skip (Gypsy Jazz / early Swing). */
    FOUR_ON_FLOOR: {
        id: 'FOUR_ON_FLOOR',
        role: 'Fundamental',
        beatsPerBar: 4,
        hiHatBeats: [1, 3],
        hits: [
            { beat: 0, vel: 1.0 },
            { beat: 1, vel: 1.0 },
            { beat: 2, vel: 1.0 },
            { beat: 3, vel: 1.0 }
        ]
    },
    /** High-tempo (>220 BPM): skip on beat 2 omitted for "breath"; skip only on 4+. */
    BOP_DRIVE: {
        id: 'BOP_DRIVE',
        role: 'Bop/Propulsive',
        beatsPerBar: 4,
        hiHatBeats: [1, 3],
        hits: [
            { beat: 0, vel: 0.9 },
            { beat: 1, vel: 1.0 },
            { beat: 2, vel: 0.9 },
            { beat: 3, vel: 1.2 },
            { beat: 3, vel: 0.8, isSkip: true }
        ]
    },
    /** Jazz Waltz (3/4): skip on "and" of 2 and 3; hi-hat on beat 2. */
    WALTZ: {
        id: 'WALTZ',
        role: 'Ballad/Linear',
        beatsPerBar: 3,
        hiHatBeats: [1],
        hits: [
            { beat: 0, vel: 1.1 },
            { beat: 1, vel: 0.8 },
            { beat: 1, vel: 0.6, isSkip: true },
            { beat: 2, vel: 0.9 },
            { beat: 2, vel: 0.7, isSkip: true }
        ]
    }
};

/** Velocity humanization: ±5% (2026 SOTA). Optionally allow max > 1 for hi-hat "snap". */
export function humanizeVelocity(vel: number, percent: number = VELOCITY_HUMANIZE_PERCENT, max: number = 1): number {
    const variance = (Math.random() * 2 - 1) * percent;
    return Math.max(0, Math.min(max, vel * (1 + variance)));
}

/** Hi-Hat Link velocity for the "snap" on 2 & 4 (or beat 2 in 3/4). Returns ~1.2 ±5%. */
export function getHiHatLinkVelocity(): number {
    return humanizeVelocity(HI_HAT_LINK_VEL, VELOCITY_HUMANIZE_PERCENT, 1.5);
}

export class DrivingRideCymbal {
    private groove = new GrooveManager();
    private baseVelocity = 0.7;

    /**
     * Fraction of beat for the skip-beat ("a-lang"). 2026 SOTA: linear interpolation by BPM.
     * 60–120: 0.75 (3:1 dotted-eighth). 120–250: linear to 0.55. 250+: 0.55 (nearly straight).
     */
    getSwingRatio(bpm: number): number {
        return this.groove.getSwingRatio(bpm);
    }

    /**
     * Offset in seconds from start of beat to the skip-beat. Use for scheduling the "lang".
     */
    getSkipBeatOffsetInBeat(bpm: number): number {
        return this.groove.getOffBeatOffsetInBeat(bpm);
    }

    /**
     * Micro-timing jitter for ride (σ ≈ 3ms). Call once per hit.
     */
    getRideJitter(): number {
        return this.groove.getHumanizationJitter(RIDE_JITTER_MS);
    }

    /**
     * Lazy hi-hat offset in seconds (5–10ms late on 2 & 4 for pocket).
     */
    getLazyHatOffset(): number {
        return LAZY_HAT_MS;
    }

    /**
     * Pulse velocity for a beat (backbeats 2 & 4 accented +20%).
     */
    getPulseVelocity(beatIndex0Based: number): number {
        const isBackbeat = beatIndex0Based === 1 || beatIndex0Based === 3;
        return this.baseVelocity * (isBackbeat ? 1.2 : 1);
    }

    /**
     * Skip-beat velocity = 0.65 × preceding pulse (rebound rule).
     */
    getSkipVelocity(pulseVelocity: number): number {
        return pulseVelocity * 0.65;
    }

    /**
     * One bar: 4 quarter pulses + 2 skip-beats on 2 & 4. Returns schedule entries { time, velocity, isSkip, beat }.
     * Caller triggers sampler at time + getRideJitter().
     */
    getBarSchedule(time: number, bpm: number): { time: number; velocity: number; isSkip: boolean; beat: number }[] {
        const ratio = this.getSwingRatio(bpm);
        const beatDuration = 60 / Math.max(20, Math.min(400, bpm));
        const skipOffset = beatDuration * ratio;
        const out: { time: number; velocity: number; isSkip: boolean; beat: number }[] = [];

        for (let beat = 0; beat < 4; beat++) {
            const isBackbeat = beat === 1 || beat === 3;
            const beatTime = time + beat * beatDuration;
            const pulseVel = this.getPulseVelocity(beat);
            out.push({ time: beatTime, velocity: pulseVel, isSkip: false, beat });
            if (isBackbeat) {
                out.push({
                    time: beatTime + skipOffset,
                    velocity: this.getSkipVelocity(pulseVel),
                    isSkip: true,
                    beat
                });
            }
        }
        return out;
    }

    /** Get pattern by id (STANDARD, FOUR_ON_FLOOR, BOP_DRIVE, WALTZ). */
    getPattern(patternId: string): JazzPatternDef | undefined {
        return JAZZ_RIDE_PATTERNS[patternId];
    }

    /** Get all patterns for a functional role. */
    getPatternsByRole(role: PatternRole): JazzPatternDef[] {
        return Object.values(JAZZ_RIDE_PATTERNS).filter(p => p.role === role);
    }

    /**
     * Schedule one bar from a pattern. Time unit T = 1 quarter note; δ from getSwingRatio(bpm).
     * Returns ride hits (with ±5% velocity humanization) and Hi-Hat Link hits (beats 2 & 4 at vel 1.2).
     * Caller adds getRideJitter() to ride times and getLazyHatOffset() to hi-hat times if desired.
     */
    getBarScheduleFromPattern(
        time: number,
        bpm: number,
        patternId: string
    ): {
        ride: { time: number; velocity: number; beat: number; isSkip: boolean }[];
        hiHat: { time: number; velocity: number; beat: number }[];
    } {
        const pattern = JAZZ_RIDE_PATTERNS[patternId];
        if (!pattern) {
            return { ride: [], hiHat: [] };
        }
        const beatDuration = 60 / Math.max(20, Math.min(400, bpm));
        const δ = this.getSwingRatio(bpm);

        const ride = pattern.hits.map(h => ({
            time: time + (h.beat + (h.isSkip ? δ : 0)) * beatDuration,
            velocity: humanizeVelocity(h.vel),
            beat: h.beat,
            isSkip: !!h.isSkip
        }));

        const hiHat = pattern.hiHatBeats.map(beat => ({
            time: time + beat * beatDuration,
            velocity: getHiHatLinkVelocity(),
            beat
        }));

        return { ride, hiHat };
    }

    /**
     * Pick pattern by BPM: BOP_DRIVE above 220 BPM, WALTZ when beatsPerBar === 3, else STANDARD.
     * Use FOUR_ON_FLOOR explicitly when you want straight quarter pulse.
     */
    suggestPattern(bpm: number, beatsPerBar: number = 4): string {
        if (beatsPerBar === 3) return 'WALTZ';
        if (bpm > 220) return 'BOP_DRIVE';
        return 'STANDARD';
    }
}
