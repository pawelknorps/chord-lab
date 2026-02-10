import * as Chord from '@tonaljs/chord';
import type { RomanNumeralAnalysis, HotspotData } from './RomanNumeralTypes';

export class RomanNumeralAnalyzer {
    static analyze(chord: string, key: string): RomanNumeralAnalysis {
        const chordData = Chord.get(chord);

        // Simplified - just return basic analysis
        return {
            chord,
            romanNumeral: 'I',
            function: 'tonic',
            complexity: this.calculateComplexity(chordData, 'tonic')
        };
    }

    private static calculateComplexity(chordData: any, func: string): number {
        let score = 0;
        if (chordData.quality.includes('alt')) score += 3;
        if (chordData.quality.includes('#') || chordData.quality.includes('b')) score += 2;
        if (chordData.quality.includes('9') || chordData.quality.includes('11') || chordData.quality.includes('13')) score += 1;
        if (func === 'chromatic') score += 2;
        return score;
    }

    static detectHotspots(chords: string[], key: string): HotspotData[] {
        const analyses = chords.map(c => this.analyze(c, key));

        return analyses.map((analysis, i) => {
            let complexity = analysis.complexity;
            const reasons: string[] = [];

            // Check for rapid changes
            if (i > 0 && analyses[i - 1].romanNumeral !== analysis.romanNumeral) {
                complexity += 1;
                reasons.push('Chord change');
            }

            // Check for altered chords
            if (analysis.chord.includes('alt') || analysis.chord.includes('#9')) {
                complexity += 3;
                reasons.push('Altered chord');
            }

            return {
                measureIndex: i,
                complexity,
                reasons,
                isHotspot: complexity >= 4
            };
        });
    }
}
