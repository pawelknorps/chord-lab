import * as Note from "@tonaljs/note";
import * as Chord from "@tonaljs/chord";
import { getChordDna } from './ChordDna';
import { toTonalChordSymbol } from './chordSymbolForTonal';

export type Voicing = number[];

/**
 * VOICING_LIBRARY (Phase 11: Pro Comping Engine)
 * Pre-curated "Grips" (hand shapes) standardized for professional jazz piano sound.
 */
const VOICING_LIBRARY: Record<string, Record<string, number[]>> = {
    Major: {
        A: [4, 11, 14, 16], // 3, 7, 9, 3 (Open)
        B: [11, 16, 19, 23], // 7, 3, 5, 9 (Inverted)
        C: [4, 9, 11, 16],  // 3, 6, 7, 9 (Kenny Barron style)
        D: [11, 14, 16, 19]  // 7, 9, 3, 5
    },
    Minor: {
        A: [3, 10, 14, 17], // b3, b7, 9, 11 (Bill Evans Style)
        B: [10, 15, 17, 22], // b7, b3, 11, 9
        C: [3, 7, 10, 14],  // b3, 5, b7, 9
        D: [10, 14, 15, 19]  // b7, 9, b3, 5
    },
    Dominant: {
        A: [4, 10, 14, 21], // 3, b7, 9, 13 (13th chord sound)
        B: [10, 16, 19, 22], // b7, 3, 13, 9
        C: [4, 10, 16, 20],  // 3, b7, 3, b13 (Passing sound)
        D: [10, 14, 16, 21]  // b7, 9, 3, 13
    },
    Altered: {
        A: [4, 10, 15, 20], // 3, b7, #9, b13 (The "Altered" sound)
        B: [10, 16, 20, 22], // b7, 3, b13, #9
        C: [4, 10, 13, 15],  // 3, b7, b9, #9 (Crunchy)
        D: [10, 13, 16, 21]  // b7, b9, 3, 13
    },
    HalfDim: {
        A: [3, 10, 13, 18], // b3, b7, b9, 11 (Dark)
        B: [10, 15, 18, 22], // b7, b3, 11, b9
        C: [3, 6, 10, 13],  // b3, b5, b7, b9
        D: [10, 13, 15, 18]  // b7, b9, b3, 11
    },
    /** Full diminished 7 (0,3,6,9). Half-dim (m7b5) uses HalfDim. */
    Dim7: {
        A: [3, 6, 9, 12],   // b3, b5, bb7, b3 (stack of minor thirds)
        B: [6, 9, 12, 15],  // b5, bb7, b3, b5
        C: [0, 3, 6, 9],    // 1, b3, b5, bb7
        D: [9, 12, 15, 18]  // bb7, b3, b5, bb7
    }
};

/**
 * CompingEngine (Phase 11: Pro Voice-Leading)
 * 
 * Combines a "Grip Dictionary" with a "Taxi Cab Solver" (Manhattan Distance)
 * and "Tritone Substitutions" to find the most musical paths between chords.
 */
export class CompingEngine {
    private lastVoicing: Voicing | null = null;
    private readonly RANGE_LIMIT_TOP = 80; // G5 roughly
    private readonly POCKET_MIN = 48; // C3
    private readonly POCKET_MAX = 60; // C4

    /**
     * Resets the engine state.
     */
    public reset(): void {
        this.lastVoicing = null;
    }

    /**
     * Calculates the optimal next voicing.
     * Incorporates Taxi Cab metric, Soprano Anchor, and Tritone Substitutions.
     */
    public getNextVoicing(chordSymbol: string, options: { addRoot?: boolean, useTritoneSub?: boolean } = {}): Voicing {
        const { addRoot = false, useTritoneSub = true } = options;

        const tonalSymbol = toTonalChordSymbol(chordSymbol);
        const chord = Chord.get(tonalSymbol);
        const rootMidi = Note.midi(chord.tonic + "3");
        if (!rootMidi) return [];

        // Primary Candidates
        const primaryCandidates = this.generateCandidates(chordSymbol, rootMidi);

        // If it's the first chord, just pick Type A
        if (!this.lastVoicing) {
            const best = primaryCandidates[0];
            this.lastVoicing = best;
            return addRoot ? [rootMidi - 12, ...best] : best;
        }

        // 1. Calculate Best Primary Transition
        const bestPrimary = this.selectBest(primaryCandidates);
        const primaryScore = this.calculateTaxiCabDistance(this.lastVoicing, bestPrimary);

        // 2. Tritone Substitution Rule
        // If distance is too high (> 15) and it's a dominant chord, try the tritone sub
        const isDom = chordSymbol.includes("7") && !chordSymbol.includes("Maj") && !chordSymbol.includes("m");
        if (useTritoneSub && isDom && primaryScore > 15) {
            const subRoot = rootMidi + 6;
            const subRootName = Note.pitchClass(Note.fromMidi(subRoot));
            const subCandidates = this.generateCandidates(subRootName + "7alt", subRoot); // Subs are usually altered
            const bestSub = this.selectBest(subCandidates);
            const subScore = this.calculateTaxiCabDistance(this.lastVoicing, bestSub);

            if (subScore < primaryScore) {
                this.lastVoicing = bestSub;
                return addRoot ? [subRoot - 12, ...bestSub] : bestSub;
            }
        }

        this.lastVoicing = bestPrimary;
        return addRoot ? [rootMidi - 12, ...bestPrimary] : bestPrimary;
    }

    /**
     * Maps symbol to DNA/Library and generates Type A and Type B candidates.
     */
    private generateCandidates(symbol: string, root: number): Voicing[] {
        const dna = getChordDna(symbol);
        let library = VOICING_LIBRARY.Dominant; // Default

        if (dna) {
            const isMajor = dna.core.third === 'major' && dna.extension.hasSeventh && dna.intervalNames.includes('7M');
            const isMinor = dna.core.third === 'minor' && dna.core.fifth === 'perfect';
            const isDimTriad = dna.core.third === 'minor' && dna.core.fifth === 'diminished';
            const isDim7 = isDimTriad && dna.intervalNames.includes('6M');   // full dim7: bb7
            const isHalfDim = isDimTriad && dna.intervalNames.includes('7m'); // m7b5: b7
            const isDom = dna.core.third === 'major' && dna.intervalNames.includes('7m');
            const isAltered = dna.extension.alterationCount > 0 || symbol.includes('alt');

            if (isMajor) library = VOICING_LIBRARY.Major;
            else if (isDim7) library = VOICING_LIBRARY.Dim7;
            else if (isHalfDim) library = VOICING_LIBRARY.HalfDim;
            else if (isMinor) library = VOICING_LIBRARY.Minor;
            else if (isDom && isAltered) library = VOICING_LIBRARY.Altered;
            else if (isDom) library = VOICING_LIBRARY.Dominant;
        }

        // Generate all candidates from library
        return Object.values(library).map(intervals => {
            const pitches = intervals.map(n => root + n);
            return this.normalizeOctave(pitches, this.POCKET_MIN, this.POCKET_MAX);
        });
    }

    /**
     * Transposes voicing to fit within a specific range.
     */
    private normalizeOctave(voicing: number[], min: number, max: number): Voicing {
        let current = [...voicing].sort((a, b) => a - b);
        while (current[0] < min) current = current.map(n => n + 12);
        while (current[0] > max) current = current.map(n => n - 12);
        return current;
    }

    /**
     * Manhattan Distance between two voicings (aligned by voice).
     */
    private calculateTaxiCabDistance(current: Voicing, next: Voicing): number {
        if (current.length !== next.length) return 100;

        const cSorted = [...current].sort((a, b) => a - b);
        const nSorted = [...next].sort((a, b) => a - b);

        let distance = 0;
        for (let i = 0; i < cSorted.length; i++) {
            distance += Math.abs(cSorted[i] - nSorted[i]);
        }
        return distance;
    }

    /**
     * Decision engine to pick the best of candidates using Taxi Cab + Soprano Anchor.
     */
    private selectBest(candidates: Voicing[]): Voicing {
        if (!this.lastVoicing) return candidates[0];

        let bestVoicing = candidates[0];
        let minScore = Infinity;

        for (const candidate of candidates) {
            // 1. Base Taxi Cab Distance
            let score = this.calculateTaxiCabDistance(this.lastVoicing, candidate);

            // 2. Soprano Anchor Penalty (Rule 2)
            // Prevent the hand from creeping up indefinitely
            const topNote = Math.max(...candidate);
            if (topNote > this.RANGE_LIMIT_TOP) {
                score += 50; // Heavy penalty for going too high
            }

            // 3. Compare
            if (score < minScore) {
                minScore = score;
                bestVoicing = candidate;
            }
        }

        return bestVoicing;
    }
}
