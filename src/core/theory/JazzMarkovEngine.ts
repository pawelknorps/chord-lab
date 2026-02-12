/**
 * Phase 20: Smart Pattern Engine — Markov state machine over pattern types (LOW / MEDIUM / HIGH / FILL).
 * Called every 4–8 bars to choose the next energy band; FILL never repeats (0% self-transition).
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
    /** Phase 20 Wave 4: optional density bias overlay (soloist-responsive). */
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
     * Phase 20 Wave 4: Bias the matrix by soloist density (HIGH when dense, LOW when sparse).
     * Call before getNextPatternType() when soloist-responsive is on.
     */
    public updateIntensity(density: number): void {
        if (density > 0.75) {
            this.intensityBias = {
                LOW_ENERGY: [0.10, 0.20, 0.60, 0.10],
                MEDIUM_ENERGY: [0.05, 0.30, 0.50, 0.15],
                HIGH_ENERGY: [0.05, 0.20, 0.65, 0.10],
                FILL: [0.40, 0.40, 0.20, 0.00],
            };
        } else if (density < 0.3) {
            this.intensityBias = {
                LOW_ENERGY: [0.70, 0.20, 0.05, 0.05],
                MEDIUM_ENERGY: [0.50, 0.35, 0.05, 0.10],
                HIGH_ENERGY: [0.30, 0.50, 0.10, 0.10],
                FILL: [0.40, 0.40, 0.20, 0.00],
            };
        } else {
            this.intensityBias = null;
        }
    }
}
