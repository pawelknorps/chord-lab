import { GrooveManager, type GrooveInstrument } from './GrooveManager';
import { getDrumPatternsByStyle } from '../../data/jjazzlab-drum-patterns';

export type DrumInstrument = "Ride" | "RideBell" | "Snare" | "SnareRim" | "Kick" | "HatPedal" | "HatOpen";

export interface DrumHit {
    time: string; // Tone.js time (e.g., "0:1:2")
    velocity: number;
    instrument: DrumInstrument;
    /** Linear phrasing: Accent | Ghost | Standard (optional, for internal use). */
    type?: "Accent" | "Ghost" | "Standard";
}

/**
 * LinearDrummingEngine — "Negative Space" / Linear Phrasing (Roy Haynes, Jack DeJohnette).
 * Ride and Snare are one melody split across two hands: when Ride rests, Snare fills the hole.
 * Starts from the standard Spang-a-Lang grid and applies a phrase mask; Snare speaks in the gaps.
 */
export class LinearDrummingEngine {
    /** Standard jazz ride grid (Spang-a-Lang): [1, 2, 2&, 3, 4, 4&] in "bar:beat:sixteenth" for one bar. */
    private readonly STANDARD_GRID = ["0:0:0", "0:1:0", "0:1:2", "0:2:0", "0:3:0", "0:3:2"];
    /** Waltz (3/4) ride: 1, 2, 3. DMP-08. */
    private readonly WALTZ_GRID = ["0:0:0", "0:1:0", "0:2:0"];

    /**
     * Generates a 1-bar phrase: Ride + Snare interlock. Hi-hat on 2 & 4 (4/4) or 2 & 3 (3/4).
     * @param barIndex Used for 2-bar motivic repetition (same mask for barIndex % 2).
     * @param intensity 0.0–1.0 (how busy; drives snare fill probability in holes).
     * @param divisionsPerBar When 3, use waltz ride (1, 2, 3) and hi-hat on 2 & 3.
     * @param preferClassicRide When true, use full spang-a-lang ride (no skips); prioritised by Markov (LOW/MEDIUM_ENERGY).
     */
    generatePhrase(barIndex: number, intensity: number, divisionsPerBar?: number, preferClassicRide?: boolean): DrumHit[] {
        const events: DrumHit[] = [];
        const isWaltz = divisionsPerBar === 3;
        const grid = isWaltz ? this.WALTZ_GRID : this.STANDARD_GRID;
        const phraseMask = preferClassicRide
            ? grid.map(() => true)
            : this.selectPhraseMask(intensity, barIndex, grid.length);

        grid.forEach((timeStep, index) => {
            const isRideActive = phraseMask[index];

            if (isRideActive) {
                const vel = isWaltz ? 0.7 + (index === 0 ? 0.1 : 0) : this.getRideVelocity(index);
                // Trigger RideBell on high intensity accents (e.g. beats 2 and 4)
                const isBell = !isWaltz && intensity > 0.8 && (index === 1 || index === 4 || Math.random() < 0.2);
                events.push({
                    time: timeStep,
                    instrument: isBell ? "RideBell" : "Ride",
                    velocity: vel,
                    type: "Standard"
                });
                if (!isWaltz && Math.random() < 0.3) {
                    events.push({ time: timeStep, instrument: "Snare", velocity: 0.2, type: "Ghost" });
                }
            } else {
                if (Math.random() < intensity) {
                    const isRim = intensity > 0.85 && Math.random() < 0.4;
                    events.push({
                        time: timeStep,
                        instrument: isRim ? "SnareRim" : "Snare",
                        velocity: 0.85,
                        type: "Accent"
                    });
                }
            }
        });

        if (isWaltz) {
            events.push({ time: "0:1:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
            events.push({ time: "0:2:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        } else {
            events.push({ time: "0:1:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
            events.push({ time: "0:3:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        }
        return events;
    }

    /**
     * Triplet fill (Elvin Jones style) — rare. Quarter-note triplet grid, rolling snare + ride.
     */
    generateFillTriplet(barIndex: number): DrumHit[] {
        const events: DrumHit[] = [];
        const tripletSixteenths = [0, 1.33, 2.66, 4, 5.33, 6.66, 8, 9.33, 10.66, 12, 13.33, 14.66];
        for (let i = 0; i < tripletSixteenths.length; i++) {
            const s = tripletSixteenths[i];
            const beat = Math.floor(s / 4);
            const sixteenth = s % 4;
            const time = `0:${beat}:${sixteenth.toFixed(2)}`;
            const isRide = i % 3 === 0;
            if (isRide) {
                events.push({ time, instrument: "Ride", velocity: 0.5 + (i === 0 ? 0.3 : 0), type: "Standard" });
            } else {
                events.push({ time, instrument: "Snare", velocity: 0.5 + (i >= 9 ? 0.35 : 0), type: "Accent" });
            }
        }
        events.push({ time: "0:1:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        events.push({ time: "0:3:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        return events;
    }

    /**
     * 8th-note fill: ride keeps time, snare builds on 8ths (2 & 4, then 2& 3 4&, then full bar).
     * Variants: light (beats 3–4), medium (2&–4), full (1–4).
     */
    generateFillEighths(barIndex: number): DrumHit[] {
        const events: DrumHit[] = [];
        // Ride: standard spang-a-lang so it stays grounded
        this.STANDARD_GRID.forEach((timeStep, index) => {
            events.push({
                time: timeStep,
                instrument: "Ride",
                velocity: this.getRideVelocity(index),
                type: "Standard"
            });
        });
        // Snare: 8th-note build. Use barIndex to pick variant (deterministic per phrase).
        const variant = (barIndex >> 2) % 3; // 0 = light, 1 = medium, 2 = full
        const eighthSlots: { time: string; vel: number }[] =
            variant === 0
                ? [{ time: "0:2:0", vel: 0.5 }, { time: "0:2:2", vel: 0.4 }, { time: "0:3:0", vel: 0.7 }, { time: "0:3:2", vel: 0.5 }]
                : variant === 1
                    ? [{ time: "0:1:2", vel: 0.4 }, { time: "0:2:0", vel: 0.5 }, { time: "0:2:2", vel: 0.45 }, { time: "0:3:0", vel: 0.7 }, { time: "0:3:2", vel: 0.55 }]
                    : [
                        { time: "0:0:0", vel: 0.45 }, { time: "0:0:2", vel: 0.4 }, { time: "0:1:0", vel: 0.5 }, { time: "0:1:2", vel: 0.45 },
                        { time: "0:2:0", vel: 0.55 }, { time: "0:2:2", vel: 0.5 }, { time: "0:3:0", vel: 0.75 }, { time: "0:3:2", vel: 0.6 }
                    ];
        eighthSlots.forEach(({ time, vel }) => {
            events.push({ time, instrument: "Snare", velocity: vel, type: "Accent" });
        });
        events.push({ time: "0:1:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        events.push({ time: "0:3:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        return events;
    }

    /**
     * Mixed fill: first half bar 8ths (ride + snare), second half triplets (rolling) for variety.
     */
    generateFillMixed(barIndex: number): DrumHit[] {
        const events: DrumHit[] = [];
        // Beats 1–2: 8th-note feel — ride on grid, snare on 1, 1&, 2, 2&
        const firstHalfRide = ["0:0:0", "0:0:2", "0:1:0", "0:1:2"];
        firstHalfRide.forEach((time, i) => {
            events.push({ time, instrument: "Ride", velocity: i % 2 === 0 ? 0.7 : 0.5, type: "Standard" });
        });
        [{ time: "0:0:0", vel: 0.5 }, { time: "0:0:2", vel: 0.4 }, { time: "0:1:0", vel: 0.55 }, { time: "0:1:2", vel: 0.45 }].forEach(({ time, vel }) => {
            events.push({ time, instrument: "Snare", velocity: vel, type: "Accent" });
        });
        // Beats 3–4: triplet roll (snare-heavy, ride accents on 3 and 4)
        const tripletSecondHalf = [8, 9.33, 10.66, 12, 13.33, 14.66]; // beat 2–4 in sixteenths
        tripletSecondHalf.forEach((s, i) => {
            const beat = Math.floor(s / 4);
            const sixteenth = s % 4;
            const time = `0:${beat}:${sixteenth.toFixed(2)}`;
            const isRide = i === 0 || i === 3;
            if (isRide) {
                events.push({ time, instrument: "Ride", velocity: 0.6, type: "Standard" });
            } else {
                events.push({ time, instrument: "Snare", velocity: 0.45 + (i >= 4 ? 0.25 : 0), type: "Accent" });
            }
        });
        events.push({ time: "0:1:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        events.push({ time: "0:3:0", instrument: "HatPedal", velocity: 0.7, type: "Standard" });
        return events;
    }

    /**
     * Chooses a fill type: triplet rare, 8ths and mixed more often. Called only when a fill is due.
     */
    generateFill(barIndex: number): DrumHit[] {
        const r = Math.random();
        if (r < 0.15) return this.generateFillTriplet(barIndex);
        if (r < 0.65) return this.generateFillEighths(barIndex);
        return this.generateFillMixed(barIndex);
    }

    private selectPhraseMask(intensity: number, barIndex: number, gridLen: number = 6): boolean[] {
        if (gridLen === 3) {
            // Waltz: 1, 2, 3 — full ride or sparse (2 of 3)
            if (intensity > 0.6) return [true, true, true];
            return (barIndex % 2 === 0) ? [true, true, false] : [true, false, true];
        }
        // Pattern A: "The Skip" (DeJohnette) — Snare hits 1 and 4, Ride plays middle
        const patternA = [false, true, true, true, false, true];
        // Pattern B: "The Driver" (Blakey) — full except and-of-4
        const patternB = [true, true, true, true, true, false];
        // Pattern C: "The Sparse" (Modern) — only ands; Snare fills beats
        const patternC = [false, false, true, false, false, true];

        const patterns = [patternA, patternB, patternC];
        let idx: number;
        if (intensity > 0.7) idx = 1;
        else if (intensity < 0.4) idx = 2;
        else idx = 0;
        // 2-bar motif: same pattern for two bars
        const motif = (barIndex >> 1) % patterns.length;
        return patterns[(idx + motif) % patterns.length];
    }

    /** Elastic Pulse: skip = 0.65 × pulse (rebound). Beat 1: 1.0, Beat 2: 1.2, Skip: 0.78, Beat 3: 1.0, Beat 4: 1.2, Skip: 0.78. Base 0.65. */
    private static readonly RIDE_VELOCITY_MAP = [1.0, 1.2, 0.78, 1.0, 1.2, 0.78];
    private getRideVelocity(index: number): number {
        const base = 0.65;
        const scale = LinearDrummingEngine.RIDE_VELOCITY_MAP[index] ?? 1;
        return base * scale + Math.random() * 0.06;
    }
}

// Placeholder types for now, assuming they are defined elsewhere or will be added.
type PlaceInCycle = string;
type SongStyleTag = string;

/**
 * DrumEngine (Phase 11: Pro DeJohnette-Style)
 * 
 * A rule-based generative engine that creates "elastic" jazz drums.
 * Features:
 * 1. Broken-time Ride (Elasticity)
 * 2. Conversational Snare/Kick (Chatter)
 * 3. Hi-Hat Anchor (2 & 4)
 * 4. Micro-timing (Ride Push, Snare Drag) — tempo-scaled via GrooveManager.
 * 5. Hybrid Linear Phrasing (optional): when barIndex is passed, uses LinearDrummingEngine
 *    for Ride/Snare/HiHat and merges with Kick + optional comping phrases.
 */
export class DrumEngine {
    private groove = new GrooveManager();
    private linearEngine = new LinearDrummingEngine();
    private phraseHistory: string[] = [];
    private readonly MAX_HISTORY = 4;

    /**
     * Phase 20: Public fill generation for Markov FILL bars (Smart Pattern Engine).
     */
    public generateFill(barIndex: number): DrumHit[] {
        return this.linearEngine.generateFill(barIndex);
    }

    /**
     * JJazzLab Library Import (Phase 6): Generate one bar of drum hits from a JJazzLab pattern.
     * When styleId is set, uses getDrumPatternsByStyle(styleId) and converts timeBeats → "0:beat:sixteenth".
     * Uses first bar of pattern only (events with timeBeats < 4); picks pattern by barIndex % pool length.
     */
    public generateBarFromJJazzLab(styleId: string, barIndex: number): DrumHit[] {
        const list = getDrumPatternsByStyle(styleId);
        if (list.length === 0) {
            return this.linearEngine.generatePhrase(barIndex, 0.5, 4, true);
        }
        const stdPatterns = list.filter((p) => p.type !== 'fill');
        const pool = stdPatterns.length > 0 ? stdPatterns : list;
        const pattern = pool[barIndex % pool.length];
        const hits: DrumHit[] = [];
        const maxBeats = 4; // one bar 4/4
        for (const e of pattern.events) {
            if (e.timeBeats >= maxBeats) continue;
            const beat = Math.floor(e.timeBeats);
            const sixteenth = Math.min(3, Math.max(0, Math.round((e.timeBeats - beat) * 4)));
            hits.push({
                time: `0:${beat}:${sixteenth}`,
                instrument: e.instrument as DrumInstrument,
                velocity: e.velocity,
            });
        }
        return hits;
    }

    /**
     * Classic Bebop & Swing Comping Phrases (Snare/Kick Conversation)
     */
    private readonly COMPING_PHRASES: { name: string; hits: { time: string; instrument: DrumInstrument; velocity: number }[]; minDensity: number }[] = [
        {
            name: "The Charleston",
            hits: [
                { time: "0:0:0", instrument: "Snare", velocity: 0.6 },
                { time: "0:1:2", instrument: "Snare", velocity: 0.4 }
            ],
            minDensity: 0.2
        },
        {
            name: "Bop Drive",
            hits: [
                { time: "0:1:2", instrument: "Snare", velocity: 0.5 },
                { time: "0:3:2", instrument: "Snare", velocity: 0.6 }
            ],
            minDensity: 0.4
        },
        {
            name: "The Drop (Klook-a-mop)",
            hits: [
                { time: "0:2:2", instrument: "Kick", velocity: 0.7 },
                { time: "0:3:0", instrument: "Snare", velocity: 0.5 }
            ],
            minDensity: 0.5
        },
        {
            name: "Philly Cross",
            hits: [
                { time: "0:0:2", instrument: "Snare", velocity: 0.4 },
                { time: "0:1:0", instrument: "Snare", velocity: 0.6 }
            ],
            minDensity: 0.3
        },
        {
            name: "Syncopated HITS",
            hits: [
                { time: "0:0:2", instrument: "Snare", velocity: 0.6 },
                { time: "0:2:2", instrument: "Snare", velocity: 0.6 }
            ],
            minDensity: 0.6
        },
        {
            name: "Max Roach Triplets",
            hits: [
                { time: "0:0:0", instrument: "Snare", velocity: 0.5 },
                { time: "0:0:1", instrument: "Snare", velocity: 0.4 },
                { time: "0:0:2", instrument: "Snare", velocity: 0.3 }
            ],
            minDensity: 0.7
        },
        {
            name: "Philly Joe Slick",
            hits: [
                { time: "0:2:2", instrument: "Snare", velocity: 0.5 },
                { time: "0:3:0", instrument: "Snare", velocity: 0.4 },
                { time: "0:3:1", instrument: "Kick", velocity: 0.6 },
                { time: "0:3:2", instrument: "Snare", velocity: 0.5 }
            ],
            minDensity: 0.6
        },
        {
            name: "Bop Turnaround",
            hits: [
                { time: "0:3:0", instrument: "Snare", velocity: 0.6 },
                { time: "0:3:1", instrument: "Snare", velocity: 0.5 },
                { time: "0:3:2", instrument: "Snare", velocity: 0.7 }
            ],
            minDensity: 0.8
        },
        {
            name: "Bop Head",
            hits: [
                { time: "0:0:0", instrument: "Snare", velocity: 0.7 },
                { time: "0:0:0", instrument: "Kick", velocity: 0.6 }
            ],
            minDensity: 0.4
        },
        {
            name: "The Hemiola",
            hits: [
                { time: "0:0:2", instrument: "Snare", velocity: 0.5 },
                { time: "0:1:1", instrument: "Snare", velocity: 0.5 },
                { time: "0:2:0", instrument: "Snare", velocity: 0.5 }
            ],
            minDensity: 0.7
        },
        {
            name: "Open Hat Accent",
            hits: [
                { time: "0:0:0", instrument: "Snare", velocity: 0.6 },
                { time: "0:2:2", instrument: "HatOpen", velocity: 0.5 }
            ],
            minDensity: 0.5
        },
        {
            name: "Anticipated 4",
            hits: [
                { time: "0:3:2", instrument: "Kick", velocity: 0.7 }
            ],
            minDensity: 0.3
        }
    ];

    /**
     * Generates a 1-bar phrase of drum hits based on density.
     * @param density 0.0 to 1.0 (How busy the drummer is)
     * @param pianoDensity 0.0 to 1.0 (Optional: Piano activity to trigger collaborative "listening")
     * @param _barIndex Optional. When provided, uses hybrid linear phrasing: LinearDrummingEngine for Ride/Snare/HiHat,
     *                 fill on bar 4, plus Kick and optional comping phrase from the classic engine.
     * @param answerContext Optional. When drums are "answering" another instrument: echo = fill/response, complement = backbeat, space = simple time.
     * @param pianoStepTimes Optional. Piano comping step times (e.g. ["0:0:0", "0:1:2"]) — kick accents a subset of these instead of always 1 and 3.
     * @param trioContext Optional Phase 18: when solo or Ballad, density is capped (soloist space). Hybrid—additive.
     * @param divisionsPerBar Optional. When 3, use waltz ride (1, 2, 3) and hi-hat on 2 & 3. DMP-08.
     * @param preferClassicRide Optional. When true, ride uses full spang-a-lang (no linear skips). Set from Markov: LOW/MEDIUM_ENERGY → true, HIGH_ENERGY → false.
     */
    public generateBar(
        density: number,
        pianoDensity: number,
        _barIndex: number,
        answerContext?: { questionFrom: string; answerType: 'echo' | 'complement' | 'space' },
        pianoStepTimes?: string[],
        trioContext?: { placeInCycle: PlaceInCycle, songStyle: SongStyleTag },
        divisionsPerBar: number = 8,
        preferClassicRide: boolean = false
    ): DrumHit[] {
        const listenerAdjustment = pianoDensity > 0.8 ? -0.3 : (pianoDensity < 0.2 ? 0.1 : 0);
        let effectiveDensity = Math.max(0.1, Math.min(1.0, density + listenerAdjustment));
        if (trioContext && (trioContext.placeInCycle === 'solo' || trioContext.songStyle === 'Ballad')) {
            effectiveDensity = Math.min(effectiveDensity, 0.5);
        }

        const hits: DrumHit[] = [];

        // Question–Answer: adjust behavior when drums are the responder
        let answerFillChance = 0.15;
        let answerApplyPhraseChance = 0.35;
        if (answerContext) {
            if (answerContext.answerType === 'echo') {
                answerFillChance = 0.45;
                answerApplyPhraseChance = 0.6;
            } else if (answerContext.answerType === 'complement') {
                effectiveDensity = Math.min(1.0, effectiveDensity + 0.15);
                answerApplyPhraseChance = 0.55;
            } else {
                effectiveDensity = Math.max(0.1, effectiveDensity - 0.2);
                answerFillChance = 0.05;
                answerApplyPhraseChance = 0.2;
            }
        }

        // Hybrid: Linear phrasing (Ride/Snare interlock) when barIndex is provided
        if (_barIndex !== undefined) {
            const isWaltz = divisionsPerBar === 3;
            const isPhraseEnd = _barIndex % 4 === 3;
            const baseFillChance = answerContext ? answerFillChance : 0.15 * (0.2 + 0.8 * effectiveDensity);
            const isFillBar = !isWaltz && isPhraseEnd && Math.random() < baseFillChance;
            if (isFillBar) {
                hits.push(...this.generateFill(_barIndex));
            } else {
                hits.push(...this.linearEngine.generatePhrase(_barIndex, effectiveDensity, divisionsPerBar, preferClassicRide));
            }
            // Kick: don't always hit every beat — either accent piano comping rhythms or sparse anchor (1 and sometimes 3)
            this.generateKickFromPianoOrSparse(hits, pianoStepTimes);
            // Optional comping phrase (hybrid): calm start = less snare/kick chatter, more sustained time
            const phraseChance = answerContext ? answerApplyPhraseChance : 0.35 * (0.2 + 0.8 * effectiveDensity);
            if (!isFillBar && effectiveDensity > 0.35 && Math.random() < phraseChance) {
                this.applyPhrase(hits, effectiveDensity);
            }
            return hits;
        }

        // Classic path: no barIndex
        hits.push({ time: "0:1:0", velocity: 0.7, instrument: "HatPedal" });
        hits.push({ time: "0:3:0", velocity: 0.7, instrument: "HatPedal" });
        this.generateRideStream(hits, effectiveDensity);
        if (effectiveDensity > 0.3 && Math.random() > 0.3) {
            this.applyPhrase(hits, effectiveDensity);
        } else {
            this.generateChatter(hits, effectiveDensity);
        }
        return hits;
    }

    /**
     * Elastic Pulse: Spang-a-lang with rebound rule. Skip-beat velocity = 0.65 × preceding pulse (V_skip ≈ 0.65 × V_down).
     * Backbeats 2 & 4 accented (1.2×); skip slots 2 & 5 = 0.78 (0.65 × 1.2) so skip is ghosted relative to pulse.
     */
    private static readonly RIDE_VELOCITY_MAP = [1.0, 1.2, 0.78, 1.0, 1.2, 0.78]; // skip = 0.65 × backbeat
    private static readonly RIDE_BASE_VEL = 0.65;
    private generateRideStream(hits: DrumHit[], _density: number) {
        const RIDE_GRID_12 = [
            { time: "0:0:0", slot: 0 },   // beat 1
            { time: "0:1:0", slot: 1 },   // beat 2
            { time: "0:1:2", slot: 2 },   // skip (2&) rebound of 2
            { time: "0:2:0", slot: 3 },   // beat 3
            { time: "0:3:0", slot: 4 },   // beat 4
            { time: "0:3:2", slot: 5 },   // skip (4&) rebound of 4
        ];
        RIDE_GRID_12.forEach(({ time, slot }) => {
            const vel = DrumEngine.RIDE_BASE_VEL * DrumEngine.RIDE_VELOCITY_MAP[slot] + (Math.random() * 0.06 - 0.03);
            hits.push({
                time,
                instrument: "Ride",
                velocity: Math.max(0.1, Math.min(1, vel)),
            });
        });
    }

    /**
     * Selects and applies a classic bebop/swing phrase.
     */
    private applyPhrase(hits: DrumHit[], density: number) {
        const validPhrases = this.COMPING_PHRASES.filter(p =>
            p.minDensity <= density && !this.phraseHistory.includes(p.name)
        );

        if (validPhrases.length === 0) {
            this.generateChatter(hits, density);
            return;
        }

        const phrase = validPhrases[Math.floor(Math.random() * validPhrases.length)];

        // Add phrase hits to the bar
        phrase.hits.forEach(hit => {
            hits.push({
                ...hit,
                velocity: hit.velocity + (Math.random() * 0.1 - 0.05)
            });
        });

        // Track history
        this.phraseHistory.push(phrase.name);
        if (this.phraseHistory.length > this.MAX_HISTORY) {
            this.phraseHistory.shift();
        }
    }

    /**
     * Kick: not every beat — either accent piano comping rhythms or sparse anchor (1 and sometimes 3).
     * When pianoStepTimes is provided, ~60% of bars accent a subset of piano step times; ~40% sparse.
     * When not provided, sparse only: 1 always, 3 with ~60% probability.
     */
    private generateKickFromPianoOrSparse(hits: DrumHit[], pianoStepTimes?: string[]): void {
        const hasPianoSteps = pianoStepTimes && pianoStepTimes.length > 0;
        const accentPiano = hasPianoSteps && Math.random() < 0.65;

        if (accentPiano && pianoStepTimes!.length > 0) {
            // Accent what the piano is doing: kick on a subset of piano step times (prefer downbeats)
            const downbeatTimes = ["0:0:0", "0:1:0", "0:2:0", "0:3:0"];
            const pianoDownbeats = pianoStepTimes!.filter(t => downbeatTimes.includes(t));
            const pianoUpbeats = pianoStepTimes!.filter(t => !downbeatTimes.includes(t));
            const candidates: { time: string; vel: number }[] = [];
            pianoDownbeats.forEach(t => {
                const isOneOrThree = t === "0:0:0" || t === "0:2:0";
                candidates.push({ time: t, vel: isOneOrThree ? 0.32 + Math.random() * 0.08 : 0.22 + Math.random() * 0.06 });
            });
            pianoUpbeats.forEach(t => {
                candidates.push({ time: t, vel: 0.18 + Math.random() * 0.06 });
            });
            // Dedupe by time (piano might have multiple steps on same slot)
            const byTime = new Map<string, number>();
            candidates.forEach(({ time, vel }) => {
                const existing = byTime.get(time);
                if (existing === undefined || vel > existing) byTime.set(time, vel);
            });
            const chosen = Array.from(byTime.entries());
            // Pick 1–3 kicks so we don't hit every beat
            const maxKicks = Math.min(chosen.length, Math.random() < 0.4 ? 1 : Math.random() < 0.6 ? 2 : 3);
            const shuffled = chosen.sort(() => Math.random() - 0.5).slice(0, maxKicks).sort((a, b) => a[0].localeCompare(b[0]));
            shuffled.forEach(([time, vel]) => {
                hits.push({ time, velocity: vel, instrument: "Kick" });
            });
            return;
        }

        // Sparse anchor: 1 always; 3 only sometimes (so not always "every other beat")
        hits.push({ time: "0:0:0", velocity: 0.28 + Math.random() * 0.08, instrument: "Kick" });
        if (Math.random() < 0.55) {
            hits.push({ time: "0:2:0", velocity: 0.2 + Math.random() * 0.06, instrument: "Kick" });
        }
    }

    /**
     * Bebop comping: stochastic, conversational. 12-grid logic.
     * Exclusion: Snare/Kick rarely on beat 1 (n0). Upbeat bias P(upbeat)≈0.7, P(downbeat)≈0.2.
     * Kick "bombs" on and-of-2 (n5) and and-of-4 (n11). Snare: more hits, lower velocity, ghosts common.
     */
    private generateBebopComping(hits: DrumHit[], density: number) {
        const upbeatSlots: { time: string; preferKick: boolean }[] = [
            { time: "0:0:2", preferKick: false },  // n2
            { time: "0:1:2", preferKick: true },   // n5
            { time: "0:2:2", preferKick: false },  // n8
            { time: "0:3:2", preferKick: true },   // n11
        ];
        const downbeatSlots = ["0:1:0", "0:2:0", "0:3:0"]; // exclude 0:0:0 (beat 1)

        const P_UPBEAT = 0.25 + density * 0.15;   // ~0.25–0.4 per upbeat slot
        const P_DOWNBEAT = 0.06 + density * 0.08; // ~0.06–0.14 per downbeat

        upbeatSlots.forEach(({ time, preferKick }) => {
            if (Math.random() >= P_UPBEAT) return;
            const isKick = preferKick && Math.random() < 0.5;
            const inst: DrumInstrument = isKick ? "Kick" : "Snare";
            const isGhost = inst === "Snare" && Math.random() < 0.5;
            const velocity = isKick
                ? 0.5 + Math.random() * 0.25
                : isGhost ? 0.12 + Math.random() * 0.18 : 0.35 + Math.random() * 0.25;
            hits.push({ time, instrument: inst, velocity });
        });

        downbeatSlots.forEach(time => {
            if (Math.random() >= P_DOWNBEAT) return;
            const inst: DrumInstrument = Math.random() < 0.2 ? "Kick" : "Snare";
            const velocity = inst === "Snare" ? 0.3 + Math.random() * 0.25 : 0.4 + Math.random() * 0.2;
            hits.push({ time, instrument: inst, velocity });
        });
    }

    /** @deprecated Use generateBebopComping for bebop feel. Kept for compatibility. */
    private generateChatter(hits: DrumHit[], density: number) {
        this.generateBebopComping(hits, density);
    }

    /**
     * Tempo-scaled micro-timing: offset as % of beat so feel stays consistent at any BPM.
     * Ride: tight (-3ms, ±3ms jitter). Snare: +4.5%. HatPedal/HatOpen: "lazy" +7ms for pocket. Kick: 0%.
     * @param bpm Current tempo (used to scale offsets and jitter).
     * @returns offset in seconds (positive = late, negative = early).
     */
    public getMicroTiming(bpm: number, inst: DrumInstrument): number {
        const grooveInst: GrooveInstrument =
            inst === "HatPedal" ? "HatPedal" : inst === "HatOpen" ? "HatOpen" : inst;
        return this.groove.getMicroTiming(bpm, grooveInst);
    }
}

