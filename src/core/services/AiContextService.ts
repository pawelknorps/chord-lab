import { ConceptAnalyzer } from '../theory/ConceptAnalyzer';
import { RomanNumeralAnalyzer } from '../theory/RomanNumeralAnalyzer';
import { midiToNoteName, noteNameToMidi } from '../theory';
import { GuideToneCalculator } from '../theory/GuideToneCalculator';
import { ChordScaleEngine } from '../theory/ChordScaleEngine';
import * as Chord from '@tonaljs/chord';

export interface SemanticMeasure {
    index: number;
    label: string; // e.g. "Bar 1"
    chords: string[];
    analysis: string[]; // Roman numerals
    guideTones: Array<{ chord: string; third: string; seventh: string }>;
    chordTones: Array<{ chord: string; notes: string[] }>;
    suggestedScale: string[];
    concepts: string[]; // e.g. ["ii-V-I", "Secondary Dominant"]
    weight: 'low' | 'medium' | 'high'; // Tension/difficulty weight
}

export interface SemanticBundle {
    title: string;
    key: string;
    sections: Array<{
        label: string;
        measures: SemanticMeasure[];
    }>;
    globalConcepts: string[];
    pivotPoints: number[]; // Measure indices where key or mood shifts significantly
}

/**
 * AiContextService: Translates raw music theory data into a high-density 
 * "Semantic Language" optimized for Gemini Nano consumption.
 */
export class AiContextService {

    /**
     * Generates a Theory Bundle for a song.
     */
    static generateBundle(song: any, transpose: number = 0): SemanticBundle {
        const title = song.title || 'Unknown Standard';
        const rawKey = song.key || 'C';

        // Handle transposition for key
        const keyMidi = noteNameToMidi(rawKey + '4');
        const transposedKey = midiToNoteName(keyMidi + transpose, rawKey).replace(/[0-9-]/g, '');

        // Normalize measures
        let rawMeasures = song.music?.measures || song.measures || [];
        const flatMeasures: Array<{ chords: string[] }> = rawMeasures.map((m: any) => {
            if (Array.isArray(m)) return { chords: m };
            if (m && typeof m === 'object' && m.chords) return { chords: m.chords };
            if (typeof m === 'string') return { chords: [m.trim()] };
            return { chords: [] };
        });

        const flatChords = flatMeasures.flatMap((m: any) => m.chords).filter((c: string) => c && c.trim() !== '');

        // 1. High-level analysis
        const analysis = ConceptAnalyzer.analyze(flatChords, transposedKey);

        // 2. Map concepts to measure indices
        const conceptMap = new Map<number, string[]>();
        analysis.concepts.forEach(c => {
            for (let i = c.startIndex; i <= c.endIndex; i++) {
                const existing = conceptMap.get(i) || [];
                conceptMap.set(i, [...existing, c.type]);
            }
        });

        // 3. Structured measure breakdown
        const semanticMeasures: SemanticMeasure[] = flatMeasures.map((m: any, i: number) => {
            const chords = m.chords || [];
            const rn = chords.map((c: string) => {
                // If the chord is empty, return empty analysis
                if (!c || c.trim() === '') return '-';
                const analysis = RomanNumeralAnalyzer.analyze(c, transposedKey);
                return analysis.romanNumeral || 'I';
            });

            const guideTones = chords.map((c: string) => {
                const gt = GuideToneCalculator.calculate(c);
                return gt ? { chord: c, third: gt.third, seventh: gt.seventh } : null;
            }).filter(Boolean) as SemanticMeasure['guideTones'];

            const chordTones = chords.map((c: string) => {
                const info = Chord.get(c);
                return info && !info.empty ? { chord: c, notes: info.notes } : null;
            }).filter(Boolean) as SemanticMeasure['chordTones'];

            const suggestedScale = chords.map((c: string) => {
                const scaleInfo = ChordScaleEngine.getScales(c);
                return scaleInfo ? `${scaleInfo.primary.name}: ${scaleInfo.primary.notes.join(',')}` : '';
            }).filter(Boolean);

            const concepts = conceptMap.get(i) || [];

            // Heuristic for tension weight
            let weight: SemanticMeasure['weight'] = 'low';
            if (concepts.length > 0) weight = 'medium';
            if (
                concepts.includes('SecondaryDominant') ||
                concepts.includes('TritoneSubstitution') ||
                concepts.includes('MinorII-V-i')
            ) weight = 'high';

            return {
                index: i,
                label: `m.${i + 1}`,
                chords,
                analysis: rn,
                guideTones,
                chordTones,
                suggestedScale,
                concepts,
                weight
            };
        });

        // 4. Identify Pivot Points
        const pivotPoints: number[] = [];
        semanticMeasures.forEach((m, i) => {
            if (i === 0) return;
            // A pivot point is often where a new concept starts or a high weight area begins
            const prev = semanticMeasures[i - 1];
            if (m.concepts.length > 0 && prev.concepts.length === 0) pivotPoints.push(i);
            if (m.weight === 'high' && prev.weight !== 'high') pivotPoints.push(i);
        });

        return {
            title,
            key: transposedKey,
            sections: [{ label: 'Main', measures: semanticMeasures }],
            globalConcepts: Array.from(new Set(analysis.concepts.map(c => c.type))),
            pivotPoints
        };
    }

    /**
     * Converts a SemanticBundle into a Markdown string optimized for Gemini Nano.
     */
    static toMarkdown(bundle: SemanticBundle): string {
        if (!bundle || !bundle.sections || bundle.sections.length === 0 || bundle.sections[0].measures.length === 0) {
            return "## SEMANTIC MAP: (Data Unavailable)\nNo harmonic analysis could be generated for this song.";
        }

        let md = `## SEMANTIC MAP: ${bundle.title} (${bundle.key})\n\n`;

        md += `CONCEPT_SUMMARY: ${bundle.globalConcepts.join(', ') || 'Diatonic'}\n\n`;

        md += `| Bar | Chords | RN | Tones (1,3,5,7) | Scale Suggestion | Concepts |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

        // Limit to first 32 measures to save tokens, but prioritize pivots
        const visibleMeasures = bundle.sections[0].measures.slice(0, 32);

        visibleMeasures.forEach(m => {
            const chordStr = m.chords.join(' / ');
            const analysisStr = m.analysis.join(' / ');
            const tonesStr = m.chordTones.map(t => `${t.chord}:[${t.notes.join(',')}]`).join(' | ') || '-';
            const scaleStr = m.suggestedScale.join(' | ') || '-';
            const conceptStr = m.concepts.join(', ') || '-';
            const pivotMark = bundle.pivotPoints.includes(m.index) ? ' 📍' : '';

            md += `| ${m.label}${pivotMark} | ${chordStr} | ${analysisStr} | ${tonesStr} | ${scaleStr} | ${conceptStr} |\n`;
        });

        if (bundle.sections[0].measures.length > 32) {
            md += `\n*Note: Map truncated to first 32 bars to conserve intelligence bandwidth.*\n`;
        }

        return md.trim();
    }
}
