/**
 * Phase 20: Smart Pattern Engine — Markov state machine over pattern types (LOW / MEDIUM / HIGH / FILL).
 * Called every 4–8 bars to choose the next energy band; FILL never repeats (0% self-transition).
 *
 * Call-and-Response (soloist-responsive): updateIntensity(soloistActivity) inverts band density vs soloist:
 * - High soloist activity (you play) → bias toward LOW_ENERGY so the band leaves more space.
 * - Low soloist activity (you rest) → bias toward HIGH_ENERGY / FILL so the band fills.
 * Uses mic pitch–derived soloist activity (0–1). Works with patternTypeBias in RhythmEngine.
 */

import type { PatternType } from './RhythmEngine';

const TYPES: PatternType[] = ['LOW_ENERGY', 'MEDIUM_ENERGY', 'HIGH_ENERGY', 'FILL'];

/** Row = current type, column = next type [LOW, MEDIUM, HIGH, FILL]. FILL → 0% self-repeat. */
const DEFAULT_MATRIX: Record<PatternType, number[]> = {
    LOW_ENERGY: [0.70, 0.20, 0.05, 0.05],
    MEDIUM_ENERGY: [0.15, 0.60, 0.15, 0.10],
    HIGH_ENERGY: [0.05, 0.20, 0.65, 0.10],
    FILL: [0.40, 0.40, 0.20, 0.00],
};

export class JazzMarkovEngine {
    private currentType: PatternType = 'MEDIUM_ENERGY';
    private matrix: Record<PatternType, number[]> = { ...DEFAULT_MATRIX };
    /** Call-and-response: when set, band leaves space when soloist plays, fills when soloist rests. */
    private intensityBias: Record<PatternType, number[]> | null = null;

    /**
     * Returns the next pattern type according to the transition matrix.
     * Call every 4 or 8 bars at beat 0.
     */
    public getNextPatternType(): PatternType {
        const row = this.intensityBias?.[this.currentType] ?? this.matrix[this.currentType];
        const r = Math.random();
        let cumulative = 0;
        for (let i = 0; i < TYPES.length; i++) {
            cumulative += row[i];
            if (r < cumulative) {
                this.currentType = TYPES[i];
                return TYPES[i];
            }
        }
        this.currentType = 'MEDIUM_ENERGY';
        return 'MEDIUM_ENERGY';
    }

    /**
     * Call-and-Response: bias matrix by soloist activity (mic pitch).
     * High activity (you play) → band uses less busy patterns (LOW_ENERGY).
     * Low activity (you rest) → band fills (HIGH_ENERGY, FILL).
     * Call before getNextPatternType() when soloist-responsive is on.
     */
    public updateIntensity(soloistActivity: number): void {
        if (soloistActivity > 0.6) {
            // Soloist playing: leave space — bias toward LOW_ENERGY and MEDIUM
            this.intensityBias = {
                LOW_ENERGY: [0.75, 0.18, 0.04, 0.03],
                MEDIUM_ENERGY: [0.45, 0.45, 0.07, 0.03],
                HIGH_ENERGY: [0.35, 0.45, 0.15, 0.05],
                FILL: [0.50, 0.35, 0.15, 0.00],
            };
        } else if (soloistActivity < 0.25) {
            // Soloist resting: band fills — bias toward HIGH_ENERGY and FILL
            this.intensityBias = {
                LOW_ENERGY: [0.15, 0.25, 0.45, 0.15],
                MEDIUM_ENERGY: [0.05, 0.25, 0.50, 0.20],
                HIGH_ENERGY: [0.05, 0.15, 0.60, 0.20],
                FILL: [0.25, 0.35, 0.25, 0.00],
            };
        } else {
            this.intensityBias = null;
        }
    }
}
