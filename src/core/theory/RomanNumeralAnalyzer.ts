import { Note, Distance } from 'tonal';
import * as Chord from '@tonaljs/chord';
import type { RomanNumeralAnalysis, HotspotData } from './RomanNumeralTypes';

export class RomanNumeralAnalyzer {
    static analyze(chord: string, key: string): RomanNumeralAnalysis {
        const chordData = Chord.get(chord);
        const root = chordData.tonic || 'C';

        // Calculate interval from key
        const keyNote = Tonal.Note.get(key);
        const chordNote = Tonal.Note.get(root);
        const interval = Tonal.Distance.interval(keyNote.pc, chordNote.pc);

        // Map to Roman numerals
        const romanMap: Record<string, string> = {
            '1P': 'I', '2M': 'II', '3M': 'III', '4P': 'IV',
            '5P': 'V', '6M': 'VI', '7M': 'VII',
            '2m': 'ii', '3m': 'iii', '6m': 'vi', '7m': 'vii'
        };

        const baseRoman = romanMap[interval] || 'I';
        const quality = chordData.quality;
        const isMinor = quality.includes('m') && !quality.includes('maj');

        let romanNumeral = isMinor ? baseRoman.toLowerCase() : baseRoman;
        if (quality.includes('7')) romanNumeral += '7';
        if (quality.includes('dim')) romanNumeral += '°';

        // Determine function
        let func: RomanNumeralAnalysis['function'] = 'tonic';
        if (['II', 'ii', 'IV'].includes(baseRoman)) func = 'subdominant';
        else if (['V', 'VII', 'vii'].includes(baseRoman)) func = 'dominant';
        else if (interval.includes('#') || interval.includes('b')) func = 'chromatic';

        return {
            chord,
            romanNumeral,
            function: func,
            complexity: this.calculateComplexity(chordData, func)
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

            // Check for key changes (chromatic movement)
            if (analysis.function === 'chromatic') {
                complexity += 2;
                reasons.push('Chromatic harmony');
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
