
export interface RhythmStep {
    time: string;   // "0:beat:sixteenth"
    duration: string; // "8n", "4n", etc.
    isAnticipation?: boolean; // If true, play the NEXT chord
}

export type RhythmTemplateName = "Standard" | "Sustain" | "Driving";

export interface RhythmPattern {
    name: RhythmTemplateName;
    steps: RhythmStep[];
}

const RHYTHM_TEMPLATES: Record<RhythmTemplateName, RhythmStep[]> = {
    // Standard Swing: Charleston on beat 1 and "and of 2"
    Standard: [
        { time: "0:0:0", duration: "4n" },
        { time: "0:1:2", duration: "8n" }
    ],
    // Space: Just a sustained pad on 1 (Good for ballads/slow)
    Sustain: [
        { time: "0:0:0", duration: "1m" }
    ],
    // Driving: Hitting the "and of 4" (Anticipation)
    Driving: [
        { time: "0:0:0", duration: "2n" },
        { time: "0:2:2", duration: "8n" },
        { time: "0:3:2", duration: "8n", isAnticipation: true }
    ]
};

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

    // Desirable transitions (Bonus weights)
    private readonly transitionMatrix: Partial<Record<RhythmTemplateName, Partial<Record<RhythmTemplateName, number>>>> = {
        Sustain: { Standard: 20, Driving: 10 },
        Standard: { Driving: 30, Sustain: 10 },
        Driving: { Standard: 20, Sustain: 20 }
    };

    /**
     * Returns a rhythm template based on BPM and energy.
     */
    public getRhythmPattern(bpm: number, energy: number = 0.5): RhythmPattern {
        const options: RhythmTemplateName[] = ["Standard", "Sustain", "Driving"];
        const lastTemplate = this.history[this.history.length - 1] || null;

        // 1. Initial Weights based on BPM
        let weights: Record<RhythmTemplateName, number> = {
            Sustain: bpm < 100 ? 60 : (bpm > 160 ? 0 : 20),
            Standard: 40,
            Driving: bpm > 140 ? 40 : 20
        };

        // 2. Apply Energy Bias
        if (energy > 0.7) {
            weights.Driving *= 1.5;
            weights.Sustain *= 0.5;
        } else if (energy < 0.3) {
            weights.Sustain *= 1.5;
            weights.Driving *= 0.5;
        }

        // 3. Apply Markov Transition Bonuses
        if (lastTemplate && this.transitionMatrix[lastTemplate]) {
            const bonuses = this.transitionMatrix[lastTemplate]!;
            for (const [next, bonus] of Object.entries(bonuses)) {
                weights[next as RhythmTemplateName] += bonus;
            }
        }

        // 4. Apply Exponential Repetition Penalty
        this.history.forEach((prev, index) => {
            const recency = index / this.history.length; // 0 to 1
            options.forEach(opt => {
                if (opt === prev) {
                    const penalty = opt === "Sustain" ? this.SUSTAIN_PENALTY : this.REPETITION_PENALTY;
                    weights[opt] *= (penalty + (1 - recency) * 0.5);
                }
            });
        });

        // 5. Weighted Random Selection
        const selected = this.weightedRandom(weights);

        // Update History
        this.history.push(selected);
        if (this.history.length > this.MAX_HISTORY) {
            this.history.shift();
        }

        return {
            name: selected,
            steps: RHYTHM_TEMPLATES[selected]
        };
    }

    private weightedRandom(weights: Record<RhythmTemplateName, number>): RhythmTemplateName {
        const entries = Object.entries(weights) as [RhythmTemplateName, number][];
        const total = entries.reduce((acc, [_, w]) => acc + Math.max(0, w), 0);
        if (total === 0) return entries[0][0];

        const r = Math.random() * total;
        let sum = 0;
        for (const [name, weight] of entries) {
            sum += Math.max(0, weight);
            if (sum >= r) return name;
        }
        return entries[0][0];
    }
}
