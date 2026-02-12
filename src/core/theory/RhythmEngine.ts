
export interface RhythmStep {
    time: string;   // "0:beat:sixteenth"
    duration: string; // "8n", "4n", etc.
    isAnticipation?: boolean; // If true, play the NEXT chord
}

export type RhythmTemplateName =
    | "Standard"
    | "Sustain"
    | "BalladPad"
    | "Driving"
    | "RedGarland"
    | "BebopClassic"
    | "WyntonKelly"
    | "MonkMinimal"
    | "TheSkip"
    | "ThroughTheBar"
    | "LateLanding"
    | "BackbeatPhrase";

/** Phase 20: Smart Pattern Engine — energy band for Markov selection. */
export type PatternType = 'LOW_ENERGY' | 'MEDIUM_ENERGY' | 'HIGH_ENERGY' | 'FILL';

/** Phase 20: Map each rhythm template to a pattern type for Markov bias. */
export const RHYTHM_TEMPLATE_TO_PATTERN_TYPE: Record<RhythmTemplateName, PatternType> = {
    Sustain: 'LOW_ENERGY',
    BalladPad: 'LOW_ENERGY',
    Standard: 'MEDIUM_ENERGY',
    RedGarland: 'MEDIUM_ENERGY',
    Driving: 'MEDIUM_ENERGY',
    LateLanding: 'MEDIUM_ENERGY',
    BackbeatPhrase: 'MEDIUM_ENERGY',
    BebopClassic: 'HIGH_ENERGY',
    WyntonKelly: 'HIGH_ENERGY',
    MonkMinimal: 'HIGH_ENERGY',
    TheSkip: 'HIGH_ENERGY',
    ThroughTheBar: 'HIGH_ENERGY',
};

export interface RhythmPattern {
    name: RhythmTemplateName;
    steps: RhythmStep[];
}

/** Answer context for question–answer (call-and-response) comping. */
export interface AnswerContext {
    questionFrom: string;
    answerType: 'echo' | 'complement' | 'space';
}

/** Shortest subdivision the pianist can reliably articulate at the current tempo (human limit). */
export type TempoSubdivisionLimit = '8n' | '4n' | '2n';

/** Options for space-aware piano comping: longer note values when there's more time. */
export interface RhythmPatternOptions {
    /** Chords in the current bar; fewer = more space for longer notes. */
    chordsPerBar?: number;
    /** When set, piano "answers" the previous bar's rhythm with an answering motive. */
    answerContext?: AnswerContext;
    /**
     * Shortest subdivision allowed at this tempo (human articulation limit).
     * Fast tempos → use '4n' or '2n' (longer notes only); slow/medium → '8n' (allow eighths).
     * If omitted, derived from BPM passed to getRhythmPattern().
     */
    tempoSubdivisionLimit?: TempoSubdivisionLimit;
    /**
     * When true, tune is labeled "ballad": pianist plays calm, long note durations,
     * few rhythm divisions (favors BalladPad/Sustain, no busy patterns).
     */
    balladMode?: boolean;
    /** Phase 18: place-in-cycle; when 'solo' biases sustain (soloist space). Hybrid—additive to balladMode. */
    placeInCycle?: string;
    /** Phase 18: song-style; when 'Ballad' biases sustain. Hybrid—additive to balladMode. */
    songStyle?: string;
    /** Phase 20: When set, only templates of this type are eligible (Markov Smart Pattern Engine). */
    patternTypeBias?: PatternType;
}

const RHYTHM_TEMPLATES: Record<RhythmTemplateName, RhythmStep[][]> = {
    // Standard Swing: mix of quarter and eighth — balanced long/short
    Standard: [
        [
            { time: "0:0:0", duration: "4n" },
            { time: "0:1:2", duration: "8n" }
        ],
        [
            { time: "0:0:0", duration: "2n" },
            { time: "0:2:2", duration: "8n" }
        ],
        [
            { time: "0:0:0", duration: "8n" },
            { time: "0:1:2", duration: "4n" }
        ]
    ],
    // Space: sustained pads — long note values for contrast (ballad-friendly)
    Sustain: [
        [{ time: "0:0:0", duration: "1m" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:2:0", duration: "2n" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:2:2", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n." }, { time: "0:3:2", duration: "8n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:1:0", duration: "2n" }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:2:0", duration: "4n" }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n." }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:2:0", duration: "2n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:1:0", duration: "2n." }, { time: "0:3:2", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:3:0", duration: "2n" }],
    ],
    // Ballad / long tones — primarily half and whole notes, minimal activity, calm two-feel
    BalladPad: [
        [{ time: "0:0:0", duration: "1m" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:2:0", duration: "2n" }],
        [{ time: "0:0:0", duration: "2n." }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:1:0", duration: "2n" }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:2:2", duration: "4n" }, { time: "0:3:2", duration: "4n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:1:2", duration: "2n" }, { time: "0:3:2", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:2:0", duration: "4n" }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:1:0", duration: "2n" }, { time: "0:3:0", duration: "2n" }],
        // Additional ballad patterns: sparse, long tones, two-feel
        [{ time: "0:0:0", duration: "4n" }, { time: "0:2:0", duration: "2n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:1:0", duration: "4n" }, { time: "0:2:0", duration: "2n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:1:0", duration: "2n." }, { time: "0:3:2", duration: "4n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:2:0", duration: "4n" }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:2:0", duration: "2n." }, { time: "0:3:2", duration: "4n" }],
        [{ time: "0:0:0", duration: "4n" }, { time: "0:3:0", duration: "2n" }],
        [{ time: "0:0:0", duration: "2n." }, { time: "0:3:0", duration: "4n" }],
        [{ time: "0:0:0", duration: "2n" }, { time: "0:3:0", duration: "2n" }],
        [{ time: "0:1:0", duration: "2n." }, { time: "0:3:2", duration: "4n" }],
    ],
    // Driving: long then short — half-note pad, then stabs and anticipation
    Driving: [
        [
            { time: "0:0:0", duration: "2n" },
            { time: "0:2:2", duration: "8n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ],
        [
            { time: "0:0:0", duration: "4n" },
            { time: "0:1:2", duration: "4n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ],
        [
            { time: "0:1:2", duration: "4n" },
            { time: "0:2:2", duration: "8n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ]
    ],
    // Red Garland: off-beats with at least one longer value for flow
    RedGarland: [
        [
            { time: "0:1:2", duration: "4n" },
            { time: "0:3:2", duration: "8n" }
        ],
        [
            { time: "0:1:2", duration: "8n" },
            { time: "0:3:2", duration: "4n" }
        ],
        [
            { time: "0:1:2", duration: "2n" },
            { time: "0:3:2", duration: "8n" }
        ]
    ],
    // Bebop: short jabs but add one longer hit for balance
    BebopClassic: [
        [{ time: "0:0:2", duration: "4n" }],
        [{ time: "0:0:2", duration: "8n" }, { time: "0:1:2", duration: "4n" }],
        [{ time: "0:0:2", duration: "8n" }, { time: "0:1:2", duration: "8n" }],
        [{ time: "0:1:2", duration: "4n" }, { time: "0:2:2", duration: "8n" }]
    ],
    // Wynton Kelly: bouncy but with quarter-note weight for flow
    WyntonKelly: [
        [
            { time: "0:0:0", duration: "4n" },
            { time: "0:1:2", duration: "8n" },
            { time: "0:2:2", duration: "8n" }
        ],
        [
            { time: "0:0:0", duration: "8n" },
            { time: "0:0:2", duration: "4n" },
            { time: "0:1:2", duration: "8n" }
        ],
        [
            { time: "0:0:0", duration: "4n" },
            { time: "0:1:2", duration: "8n" },
            { time: "0:2:2", duration: "8n" }
        ]
    ],
    // Monk Minimal: sparse — one longer note for contrast
    MonkMinimal: [
        [{ time: "0:1:2", duration: "4n" }],
        [{ time: "0:2:2", duration: "4n" }],
        [{ time: "0:0:2", duration: "2n" }],
        [{ time: "0:2:2", duration: "8n" }]
    ],
    // The Skip: anticipation with optional longer prep
    TheSkip: [
        [{ time: "0:3:2", duration: "8n", isAnticipation: true }],
        [{ time: "0:2:0", duration: "4n" }, { time: "0:3:2", duration: "8n", isAnticipation: true }],
        [{ time: "0:3:0", duration: "4n" }, { time: "0:3:2", duration: "8n", isAnticipation: true }]
    ],
    // Through the bar: phrase with long + short contrast
    ThroughTheBar: [
        [
            { time: "0:1:2", duration: "4n" },
            { time: "0:2:2", duration: "8n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ],
        [
            { time: "0:0:2", duration: "4n" },
            { time: "0:2:0", duration: "2n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ],
        [
            { time: "0:1:2", duration: "8n" },
            { time: "0:2:2", duration: "4n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ]
    ],
    // Late landing: quarter/half for flow, not just eighths
    LateLanding: [
        [
            { time: "0:0:2", duration: "4n" },
            { time: "0:2:0", duration: "4n" }
        ],
        [
            { time: "0:0:2", duration: "2n" },
            { time: "0:2:2", duration: "4n" }
        ],
        [
            { time: "0:1:2", duration: "4n" },
            { time: "0:3:0", duration: "4n" }
        ],
        [
            { time: "0:0:2", duration: "8n" },
            { time: "0:1:2", duration: "4n" },
            { time: "0:3:2", duration: "8n" }
        ]
    ],
    // Backbeat: 2 and 4 with longer values for balance
    BackbeatPhrase: [
        [
            { time: "0:1:2", duration: "4n" },
            { time: "0:3:2", duration: "4n" }
        ],
        [
            { time: "0:1:0", duration: "2n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ],
        [
            { time: "0:1:2", duration: "4n" },
            { time: "0:3:0", duration: "4n" },
            { time: "0:3:2", duration: "8n", isAnticipation: true }
        ]
    ]
};

/** Stretch note values when there is more space (slow tune or few chords). */
const DURATION_STRETCH: Record<string, string> = {
    "8n": "4n",
    "4n": "2n",
    "2n": "1m",
    "2n.": "1m",
    "1m": "1m"
};

const SUBDIVISION_STRETCH: Record<TempoSubdivisionLimit, Record<string, string>> = {
    "8n": { "16n": "8n", "8n": "8n", "4n": "4n", "2n": "2n", "1m": "1m" },
    "4n": { "16n": "4n", "8n": "4n", "4n": "4n", "2n": "2n", "1m": "1m" },
    "2n": { "16n": "2n", "8n": "2n", "4n": "2n", "2n": "2n", "1m": "1m" }
};

function getTempoSubdivisionLimitFromBpm(bpm: number): TempoSubdivisionLimit {
    if (bpm >= 180) return '2n';  // very fast: quarters and longer only
    if (bpm >= 150) return '4n';  // fast: no eighths
    return '8n';                  // medium/slow: allow eighths
}

/**
 * RhythmEngine (Phase 11: Pro State-Machine)
 * 
 * Uses a state-machine with deep history and Markov transition biases
 * to prevent robotic repetition and drive musical phrasing.
 */
export class RhythmEngine {
    private history: RhythmTemplateName[] = [];
    private readonly MAX_HISTORY = 4;
    private readonly REPETITION_PENALTY = 0.1;
    private readonly SUSTAIN_PENALTY = 0.6; // Allow some sustain repetition for pads

    // Desirable transitions (Bonus weights) — phrase variety and bar-crossing flow
    private readonly transitionMatrix: Partial<Record<RhythmTemplateName, Partial<Record<RhythmTemplateName, number>>>> = {
        Sustain: { Standard: 20, BalladPad: 15, BebopClassic: 15, MonkMinimal: 10, LateLanding: 12 },
        BalladPad: { Sustain: 18, Standard: 15, LateLanding: 15, MonkMinimal: 12 },
        Standard: { Driving: 30, RedGarland: 20, WyntonKelly: 15, ThroughTheBar: 18 },
        Driving: { RedGarland: 25, Standard: 20, TheSkip: 15, ThroughTheBar: 22 },
        RedGarland: { BebopClassic: 20, WyntonKelly: 20, BackbeatPhrase: 18 },
        BebopClassic: { MonkMinimal: 20, Standard: 15, LateLanding: 15 },
        WyntonKelly: { RedGarland: 15, Driving: 20, ThroughTheBar: 15 },
        MonkMinimal: { Sustain: 20, BalladPad: 18, BebopClassic: 15, LateLanding: 18 },
        TheSkip: { Standard: 30, WyntonKelly: 20, LateLanding: 20 },
        ThroughTheBar: { Standard: 25, TheSkip: 18, BackbeatPhrase: 15 },
        LateLanding: { ThroughTheBar: 20, RedGarland: 18, Standard: 15, BalladPad: 12 },
        BackbeatPhrase: { ThroughTheBar: 20, RedGarland: 22, TheSkip: 15 }
    };

    /**
     * Returns a rhythm template based on BPM, energy, and optional space context.
     * When there is more space (few chords per bar or slow tune), the player uses
     * longer note values (e.g. half notes, whole notes) and favors the Sustain template.
     */
    public getRhythmPattern(bpm: number, energy: number = 0.5, patternOptions?: RhythmPatternOptions): RhythmPattern {
        const opts: RhythmPatternOptions = patternOptions ?? {};
        const balladMode = opts.balladMode === true || opts.placeInCycle === 'solo' || opts.songStyle === 'Ballad';
        const chordsPerBar = opts.chordsPerBar ?? 2;
        const tempoLimit: TempoSubdivisionLimit = balladMode
            ? '4n'
            : (opts.tempoSubdivisionLimit ?? getTempoSubdivisionLimitFromBpm(bpm));

        let options: RhythmTemplateName[] = ["Standard", "Sustain", "BalladPad", "Driving", "RedGarland", "BebopClassic", "WyntonKelly", "MonkMinimal", "TheSkip", "ThroughTheBar", "LateLanding", "BackbeatPhrase"];

        // Phase 20: When FILL, piano plays minimal comp (one chord on 1) so drums can fill.
        if (opts.patternTypeBias === 'FILL') {
            const fillPattern: RhythmPattern = { name: 'Sustain', steps: [{ time: '0:0:0', duration: '4n' }] };
            return fillPattern;
        }
        // Phase 20: When patternTypeBias is set, restrict to templates of that type.
        if (opts.patternTypeBias && opts.patternTypeBias !== 'FILL') {
            const filtered = options.filter((name) => RHYTHM_TEMPLATE_TO_PATTERN_TYPE[name] === opts.patternTypeBias);
            if (filtered.length > 0) {
                options = filtered;
                const optionSet = new Set(options);
                (Object.keys(weights) as RhythmTemplateName[]).forEach((name) => {
                    if (!optionSet.has(name)) weights[name] = 0;
                });
            }
        }

        const lastTemplate = this.history[this.history.length - 1] || null;

        // More space = few chords per bar OR slow tempo → longer note values
        const hasMoreSpace = chordsPerBar <= 1 || bpm < 100;
        const hasLessSpace = chordsPerBar >= 3 || bpm > 160;

        // 1. Initial Weights based on BPM
        let weights: Record<RhythmTemplateName, number> = {
            Sustain: bpm < 100 ? 60 : (bpm > 160 ? 5 : 20),
            BalladPad: bpm < 120 ? 35 : (bpm > 160 ? 5 : 22),
            Standard: 40,
            Driving: bpm > 140 ? 40 : 20,
            RedGarland: 25,
            BebopClassic: 30,
            WyntonKelly: 25,
            MonkMinimal: 15,
            TheSkip: 20,
            ThroughTheBar: 25,
            LateLanding: 22,
            BackbeatPhrase: 20
        };

        // 1b. Ballad mode: only long-note phrases — BalladPad and Sustain only (no short rhythms from the start)
        if (balladMode) {
            weights.BalladPad = 1;
            weights.Sustain = 1;
            weights.MonkMinimal = 0;
            weights.LateLanding = 0;
            weights.Standard = 0;
            weights.Driving = 0;
            weights.RedGarland = 0;
            weights.BebopClassic = 0;
            weights.WyntonKelly = 0;
            weights.TheSkip = 0;
            weights.ThroughTheBar = 0;
            weights.BackbeatPhrase = 0;
        }

        // 2. Space rules: favor longer note values when there's more time
        if (hasMoreSpace) {
            weights.Sustain *= 3.0;   // Strongly favor whole-note pad
            weights.BalladPad *= 2.5; // Long tones for ballads / open space
            weights.MonkMinimal *= 2.0; // Monk is sparse, good for space
            weights.Driving *= 0.5;
            weights.RedGarland *= 0.5;
            weights.WyntonKelly *= 0.5;
            weights.BebopClassic *= 0.5;
            weights.TheSkip *= 0.5; // Less skipping when there's more space
            weights.ThroughTheBar *= 0.7;
            weights.LateLanding *= 1.2;
            weights.BackbeatPhrase *= 0.7;
        }
        if (hasLessSpace) {
            weights.Sustain *= 0.2;
            weights.BalladPad *= 0.2;
            weights.Standard *= 1.5;
            weights.Driving *= 1.5;
            weights.RedGarland *= 1.2; // Slightly more active
            weights.BebopClassic *= 1.5;
            weights.WyntonKelly *= 1.2; // Slightly more active
            weights.MonkMinimal *= 0.5; // Less sparse when less space
            weights.TheSkip *= 1.5; // More skipping when less space
            weights.ThroughTheBar *= 1.3;
            weights.LateLanding *= 1.0;
            weights.BackbeatPhrase *= 1.2;
        }

        // 3. Apply Energy Bias — low energy (start of tune / intros) = longer note durations (Sustain, BalladPad)
        // Ballad-like patterns are accessible in intros and calm sections of any style (e.g. medium swing).
        if (energy > 0.7) {
            weights.Driving *= 1.5;
            weights.Sustain *= 0.5;
            weights.BalladPad *= 0.4;
            weights.ThroughTheBar *= 1.3;
            weights.BackbeatPhrase *= 1.2;
        } else if (energy < 0.25) {
            // Very calm: strongly favor long tones (whole/half notes)
            weights.Sustain *= 2.2;
            weights.BalladPad *= 2.4;
            weights.MonkMinimal *= 1.8;
            weights.Driving *= 0.35;
            weights.RedGarland *= 0.4;
            weights.BebopClassic *= 0.35;
            weights.WyntonKelly *= 0.4;
            weights.TheSkip *= 0.3;
            weights.ThroughTheBar *= 0.5;
            weights.BackbeatPhrase *= 0.4;
            weights.LateLanding *= 1.3;
        } else if (energy < 0.35) {
            weights.Sustain *= 1.5;
            weights.BalladPad *= 1.6;
            weights.Driving *= 0.5;
            weights.LateLanding *= 1.2;
        } else if (energy < 0.5) {
            // Intro / calm section (e.g. medium swing intro): keep ballad-like patterns accessible to pianist
            weights.Sustain *= 1.35;
            weights.BalladPad *= 1.45;
            weights.MonkMinimal *= 1.15;
            weights.LateLanding *= 1.1;
            weights.Driving *= 0.8;
            weights.RedGarland *= 0.85;
            weights.BebopClassic *= 0.85;
            weights.WyntonKelly *= 0.85;
            weights.TheSkip *= 0.8;
            weights.ThroughTheBar *= 0.9;
            weights.BackbeatPhrase *= 0.85;
        }

        // 4. Apply Markov Transition Bonuses
        if (lastTemplate && this.transitionMatrix[lastTemplate]) {
            const bonuses = this.transitionMatrix[lastTemplate]!;
            for (const [next, bonus] of Object.entries(bonuses)) {
                weights[next as RhythmTemplateName] += bonus;
            }
        }

        // 5. Apply Exponential Repetition Penalty
        this.history.forEach((prev, index) => {
            const recency = index / this.history.length; // 0 to 1
            options.forEach(opt => {
                if (opt === prev) {
                    const penalty = (opt === "Sustain" || opt === "BalladPad") ? this.SUSTAIN_PENALTY : this.REPETITION_PENALTY;
                    weights[opt] *= (penalty + (1 - recency) * 0.5);
                }
            });
        });

        // 5a. Long/short balance: after stab-heavy patterns, favor templates with longer note values for logical flow
        const shortHeavyTemplates: RhythmTemplateName[] = ["BebopClassic", "MonkMinimal", "TheSkip"];
        const longerRhythmTemplates: RhythmTemplateName[] = ["Sustain", "BalladPad", "Driving", "Standard", "LateLanding", "RedGarland"];
        if (lastTemplate && shortHeavyTemplates.includes(lastTemplate)) {
            longerRhythmTemplates.forEach((name) => {
                weights[name] *= 1.4;
            });
        }

        // 5c. Tempo / human articulation: at fast tempo (longer subdivisions only), favor templates that use 4n/2n
        if (tempoLimit === '4n' || tempoLimit === '2n') {
            const fastTempoFriendly: RhythmTemplateName[] = ["Sustain", "BalladPad", "Driving", "Standard", "LateLanding", "RedGarland", "BackbeatPhrase"];
            const fastTempoUnfriendly: RhythmTemplateName[] = ["BebopClassic", "WyntonKelly", "ThroughTheBar", "MonkMinimal", "TheSkip"];
            fastTempoFriendly.forEach((name) => { weights[name] *= 1.3; });
            fastTempoUnfriendly.forEach((name) => { weights[name] *= 0.6; });
        }

        // 5b. Question–Answer: bias toward an "answering" motive when responding to another instrument
        const answerCtx = opts.answerContext;
        if (answerCtx) {
            const answerMultipliers: Record<RhythmTemplateName, number> =
                answerCtx.answerType === 'echo'
                    ? { Standard: 1.2, Sustain: 0.5, BalladPad: 0.5, Driving: 1.3, RedGarland: 1.8, BebopClassic: 1.8, WyntonKelly: 1.5, MonkMinimal: 1.2, TheSkip: 1.6, ThroughTheBar: 1.4, LateLanding: 1.3, BackbeatPhrase: 1.5 }
                    : answerCtx.answerType === 'complement'
                        ? { Standard: 1.6, Sustain: 1.2, BalladPad: 1.2, Driving: 1.4, RedGarland: 0.8, BebopClassic: 0.9, WyntonKelly: 1.2, MonkMinimal: 1.3, TheSkip: 1.2, ThroughTheBar: 1.2, LateLanding: 1.1, BackbeatPhrase: 1.2 }
                        : { Standard: 0.6, Sustain: 2.5, BalladPad: 2.2, Driving: 0.4, RedGarland: 0.5, BebopClassic: 0.5, WyntonKelly: 0.5, MonkMinimal: 2.0, TheSkip: 0.4, ThroughTheBar: 0.8, LateLanding: 1.2, BackbeatPhrase: 0.7 };
            options.forEach(opt => {
                weights[opt] *= answerMultipliers[opt] ?? 1;
            });
        }

        // 5d. Ballad: only long-note templates (Markov/answer could have raised short ones — lock them out)
        if (balladMode) {
            const balladOnly: RhythmTemplateName[] = ["BalladPad", "Sustain"];
            options.forEach(opt => {
                if (!balladOnly.includes(opt)) weights[opt] = 0;
            });
        }

        // 6. Weighted Random Selection
        const selected = this.weightedRandom(weights);

        // Update History
        this.history.push(selected);
        if (this.history.length > this.MAX_HISTORY) {
            this.history.shift();
        }

        const variations = RHYTHM_TEMPLATES[selected];
        let steps = variations[Math.floor(Math.random() * variations.length)];

        // 7. Longer note durations: when more space OR low energy (intro/calm) OR ballad, stretch 8n→4n, 4n→2n, 2n→1m
        const preferLongerDurations = balladMode || hasMoreSpace || energy < 0.5;
        if (preferLongerDurations && steps.length > 0) {
            steps = steps.map((s) => ({
                ...s,
                duration: DURATION_STRETCH[s.duration] ?? s.duration
            }));
        }

        // 8. Apply tempo subdivision limit (human articulation): no note shorter than limit
        const stretchMap = SUBDIVISION_STRETCH[tempoLimit];
        if (stretchMap && steps.length > 0) {
            steps = steps.map((s) => ({
                ...s,
                duration: stretchMap[s.duration] ?? s.duration
            }));
        }

        return {
            name: selected,
            steps
        };
    }

    private weightedRandom(weights: Record<RhythmTemplateName, number>): RhythmTemplateName {
        const entries = Object.entries(weights) as [RhythmTemplateName, number][];
        const total = entries.reduce((acc, [_, w]) => acc + Math.max(0, w), 0);
        if (total === 0) return entries[0][0];

        const r = Math.random() * total;
        let sum = 0;
        for (const [name, weight] of entries) {
            const w = Math.max(0, weight);
            if (w <= 0) continue; // skip zero-weight options so they are never selected
            sum += w;
            if (sum >= r) return name;
        }
        return entries[entries.length - 1][0];
    }
}
