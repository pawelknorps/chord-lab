import { describe, it, expect } from 'vitest';
import { ConceptAnalyzer } from './ConceptAnalyzer';

describe('ConceptAnalyzer', () => {
    describe('Major ii-V-I Detection', () => {
        it('should detect a classic ii-V-I in C Major', () => {
            const chords = ['Dm7', 'G7', 'Cmaj7'];
            const result = ConceptAnalyzer.analyze(chords, 'C');

            expect(result.concepts).toHaveLength(1);
            expect(result.concepts[0].type).toBe('MajorII-V-I');
            expect(result.concepts[0].startIndex).toBe(0);
            expect(result.concepts[0].endIndex).toBe(2);
        });

        it('should detect ii-V-I in Bb Major', () => {
            const chords = ['Cm7', 'F7', 'Bbmaj7'];
            const result = ConceptAnalyzer.analyze(chords, 'Bb');

            expect(result.concepts).toHaveLength(1);
            expect(result.concepts[0].type).toBe('MajorII-V-I');
        });

        it('should detect multiple ii-V-Is in Autumn Leaves', () => {
            // Simplified Autumn Leaves (first few bars)
            const chords = ['Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7', 'Gm'];
            const result = ConceptAnalyzer.analyze(chords, 'Bb');

            // Should find at least the first ii-V-I
            const majorPatterns = result.concepts.filter(c => c.type === 'MajorII-V-I');
            expect(majorPatterns.length).toBeGreaterThan(0);
        });
    });

    describe('Minor ii-V-i Detection', () => {
        it('should detect a classic ii-V-i in C Minor', () => {
            const chords = ['Dm7b5', 'G7alt', 'Cm7'];
            const result = ConceptAnalyzer.analyze(chords, 'Cm');

            expect(result.concepts).toHaveLength(1);
            expect(result.concepts[0].type).toBe('MinorII-V-i');
            expect(result.concepts[0].metadata.romanNumerals).toEqual(['iiø', 'V7', 'i']);
        });

        it('should detect ii-V-i in G Minor', () => {
            const chords = ['Am7b5', 'D7', 'Gm7'];
            const result = ConceptAnalyzer.analyze(chords, 'Gm');

            const minorPatterns = result.concepts.filter(c => c.type === 'MinorII-V-i');
            expect(minorPatterns.length).toBeGreaterThan(0);
        });
    });

    describe('Secondary Dominant Detection', () => {
        it('should detect A7 as V/ii in C Major', () => {
            const chords = ['A7', 'Dm7'];
            const result = ConceptAnalyzer.analyze(chords, 'C');

            const secDoms = result.concepts.filter(c => c.type === 'SecondaryDominant');
            expect(secDoms.length).toBeGreaterThan(0);
        });
    });

    describe('Exercise Generation', () => {
        it('should generate practice exercises from detected patterns', () => {
            const chords = ['Dm7', 'G7', 'Cmaj7'];
            const analysisResult = ConceptAnalyzer.analyze(chords, 'C');
            const exercises = ConceptAnalyzer.generateExercises(analysisResult, chords);

            expect(exercises).toHaveLength(1);
            expect(exercises[0].type).toBe('MajorII-V-I');
            expect(exercises[0].practiceScale).toContain('Dorian');
        });
    });

    describe('Complex Progressions', () => {
        it('should handle a mix of patterns', () => {
            const chords = [
                'Dm7', 'G7', 'Cmaj7', 'Cmaj7',  // ii-V-I in C
                'Em7', 'A7', 'Dm7', 'G7',        // ii-V in D, then ii-V (back to C)
                'Cm7', 'F7', 'Bbmaj7'            // ii-V-I in Bb
            ];

            const result = ConceptAnalyzer.analyze(chords, 'C');

            // Should find multiple patterns
            expect(result.concepts.length).toBeGreaterThan(0);

            const majorPatterns = result.concepts.filter(c => c.type === 'MajorII-V-I');
            expect(majorPatterns.length).toBeGreaterThan(0);
        });
    });
});
