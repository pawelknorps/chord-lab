import { AnalysisResult, Concept } from './AnalysisTypes';
import { Chord } from '@tonaljs/chord';
import { Key } from '@tonaljs/key';

export class ConceptAnalyzer {
    /**
     * Analyzes a sequence of chords and returns detected musical concepts.
     * 
     * @param chords Array of chord symbols (e.g., ["Dm7", "G7", "Cmaj7"])
     * @param keySignature The key context (e.g., "C", "Bb")
     */
    static analyze(chords: string[], keySignature: string = 'C'): AnalysisResult {
        const concepts: Concept[] = [];

        if (!chords || chords.length < 2) {
            return { concepts };
        }

        try {
            // Detect Major ii-V-I patterns
            this.detectMajorTwoFiveOne(chords, keySignature, concepts);

            // Detect Minor ii-V-i patterns
            this.detectMinorTwoFiveOne(chords, keySignature, concepts);

            // Detect Secondary Dominants
            this.detectSecondaryDominants(chords, keySignature, concepts);

        } catch (error) {
            console.warn('Analysis error:', error);
        }

        return { concepts };
    }

    /**
     * Detect Major ii-V-I progressions (e.g., Dm7 - G7 - Cmaj7 in C Major)
     */
    private static detectMajorTwoFiveOne(
        chords: string[],
        _keySignature: string,
        concepts: Concept[],
    ): void {
        for (let i = 0; i < chords.length - 2; i++) {
            const window = chords.slice(i, i + 3);

            try {
                // Parse chords
                const chord1 = Chord.get(window[0]);
                const chord2 = Chord.get(window[1]);
                const chord3 = Chord.get(window[2]);

                // Check if we have valid chord parsing
                if (!chord1.tonic || !chord2.tonic || !chord3.tonic) continue;

                // ii: minor 7th (or variations)
                const isMinorTwo = chord1.quality === 'm7' || chord1.quality === 'min7' || chord1.aliases.includes('m7');
                //V: dominant 7th
                const isDominantFive = chord2.quality === '7' || chord2.quality === 'dom7' || chord2.aliases.includes('7');
                // I: major 7th or major triad
                const isMajorOne = chord3.quality === 'M7' || chord3.quality === 'maj7' || chord3.quality === '' || chord3.quality === 'M' || chord3.aliases.includes('maj7');

                if (isMinorTwo && isDominantFive && isMajorOne) {
                    concepts.push({
                        type: 'MajorII-V-I',
                        startIndex: i,
                        endIndex: i + 2,
                        metadata: {
                            key: chord3.tonic, // Tonic is the I chord
                            romanNumerals: ['ii', 'V', 'I'],
                        },
                    });
                }
            } catch (e) {
                // Skip problematic chords
                continue;
            }
        }
    }

    /**
     * Detect Minor ii-V-i progressions (e.g., Dm7b5 - G7alt - Cm7 in C Minor)
     */
    private static detectMinorTwoFiveOne(
        chords: string[],
        _keySignature: string,
        concepts: Concept[]
    ): void {
        for (let i = 0; i < chords.length - 2; i++) {
            const window = chords.slice(i, i + 3);

            try {
                const chord1 = Chord.get(window[0]);
                const chord2 = Chord.get(window[1]);
                const chord3 = Chord.get(window[3]);

                if (!chord1.tonic || !chord2.tonic || !chord3.tonic) continue;

                // ii: half-diminished (m7b5)
                const isHalfDim = chord1.quality === 'm7b5' || chord1.quality === 'ø7' || chord1.aliases.includes('m7b5');
                // V: dominant 7th (often altered)
                const isDominant = chord2.quality === '7' || chord2.quality === '7alt' || chord2.aliases.includes('7');
                // i: minor 7th, minor 6, or minor major 7
                const isMinorOne = chord3.quality === 'm7' || chord3.quality === 'm6' || chord3.quality === 'mM7' || chord3.aliases.includes('m7');

                if (isHalfDim && isDominant && isMinorOne) {
                    concepts.push({
                        type: 'MinorII-V-i',
                        startIndex: i,
                        endIndex: i + 2,
                        metadata: {
                            key: chord3.tonic || '',
                            romanNumerals: ['iiø', 'V7', 'i'],
                        },
                    });
                }
            } catch (e) {
                continue;
            }
        }
    }

    /**
     * Detect Secondary Dominants (e.g., A7 -> Dm7 in C Major = V/ii)
     */
    private static detectSecondaryDominants(
        chords: string[],
        keySignature: string,
        concepts: Concept[]
    ): void {
        const keyInfo = Key.majorKey(keySignature);

        for (let i = 0; i < chords.length - 1; i++) {
            try {
                const current = Chord.get(chords[i]);
                const next = Chord.get(chords[i + 1]);

                if (!current.tonic || !next.tonic) continue;

                // Check if current chord is a dominant 7th
                const isDominant = current.quality === '7' || current.quality === 'dom7' || current.aliases.includes('7');

                if (isDominant) {
                    // Check if this is the diatonic V7 of the key
                    const tonicNote = keyInfo.tonic || keySignature;
                    // Simple check: if it's not V7 of the key, it's secondary
                    if (current.tonic !== tonicNote) {
                        // This is likely a secondary dominant
                        concepts.push({
                            type: 'SecondaryDominant',
                            startIndex: i,
                            endIndex: i + 1,
                            metadata: {
                                key: keySignature,
                                target: next.tonic,
                                romanNumerals: [`V/${next.tonic}`],
                            },
                        });
                    }
                }
            } catch (e) {
                continue;
            }
        }
    }

    /**
     * Generate practice exercises from detected patterns
     */
    static generateExercises(analysisResult: AnalysisResult, chords: string[]) {
        const exercises: Array<{
            type: string;
            startIndex: number;
            chords: string[];
            practiceScale?: string;
            practiceArpeggio?: string;
        }> = [];

        for (const concept of analysisResult.concepts) {
            const conceptChords = chords.slice(concept.startIndex, concept.endIndex + 1);

            if (concept.type === 'MajorII-V-I' || concept.type === 'MinorII-V-i') {
                try {
                    const iiChord = Chord.get(conceptChords[0]);

                    if (iiChord.tonic) {
                        exercises.push({
                            type: concept.type,
                            startIndex: concept.startIndex,
                            chords: conceptChords,
                            practiceScale: `${iiChord.tonic} Dorian`,
                            practiceArpeggio: iiChord.notes.join(', '),
                        });
                    }
                } catch (e) {
                    // Skip if chord parsing fails
                }
            }
        }

        return exercises;
    }
}
