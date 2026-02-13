import { AnalysisResult, Concept } from './AnalysisTypes';
import * as Chord from '@tonaljs/chord';
import * as Key from '@tonaljs/key';
import * as Distance from '@tonaljs/core';

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

            // Detect Tritone Substitutions
            this.detectTritoneSubstitutions(chords, keySignature, concepts);

            // Detect Coltrane Changes
            this.detectColtraneChanges(chords, concepts);

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

                // ii: minor 7th (or variations) — use type/aliases (Tonal chord.type is e.g. "m7", "maj7")
                const isMinorTwo = chord1.type === 'm7' || chord1.type === 'min7' || chord1.aliases?.includes('m7') === true;
                // V: dominant 7th
                const isDominantFive = chord2.type === '7' || chord2.type === '7alt' || chord2.aliases?.includes('7') === true;
                // I: major 7th or major triad
                const isMajorOne = chord3.type === 'maj7' || chord3.type === 'M7' || chord3.quality === 'Major' || chord3.aliases?.includes('maj7') === true;

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
                const chord3 = Chord.get(window[2]);

                if (!chord1.tonic || !chord2.tonic || !chord3.tonic) continue;

                // ii: half-diminished — Tonal type.name is "half-diminished", aliases include "m7b5", "ø", "h"
                const isHalfDim = chord1.type === 'm7b5' || chord1.type === 'half-diminished' || chord1.type === 'ø7' || chord1.aliases?.includes('m7b5') === true || chord1.aliases?.some((a: string) => /ø|half-dim|h7|h\b/.test(a)) === true;
                // V: dominant 7th (including altered) — Tonal "7alt" can be type "altered" or in aliases
                const isDominant = chord2.type === '7' || chord2.type === '7alt' || chord2.type === 'altered' || chord2.aliases?.includes('7') === true || chord2.aliases?.includes('7alt') === true || chord2.aliases?.includes('alt7') === true;
                // i: minor 7th, minor 6, or minor major 7
                const isMinorOne = chord3.type === 'm7' || chord3.type === 'm6' || chord3.type === 'mM7' || chord3.aliases?.includes('m7') === true;

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

                const isDominant = current.type === '7' || current.type === '7alt' || current.aliases?.includes('7') === true;

                if (isDominant) {
                    const tonicNote = keyInfo.tonic || keySignature;
                    // Don't treat as secondary if we're resolving to I (primary V-I)
                    if (next.tonic === tonicNote) continue;
                    // If current is not the key's V, it's a secondary dominant (e.g. A7 -> Dm in C)
                    if (current.tonic !== tonicNote) {
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
     * Detect Tritone Substitutions
     * A dominant chord can be replaced with another dominant chord a tritone (augmented 4th) away.
     * E.g., in C Major: G7 can be substituted with Db7
     */
    private static detectTritoneSubstitutions(
        chords: string[],
        _keySignature: string,
        concepts: Concept[]
    ): void {
        for (let i = 0; i < chords.length - 1; i++) {
            try {
                const current = Chord.get(chords[i]);
                const next = Chord.get(chords[i + 1]);

                if (!current.tonic || !next.tonic) continue;

                const isDominant = current.type === '7' || current.type === '7alt' || current.aliases?.includes('7') === true;

                if (isDominant) {
                    // Calculate the tritone (augmented 4th) from the next chord's root
                    const tritoneFromNext = Distance.transpose(next.tonic, 'A4');

                    if (current.tonic === tritoneFromNext) {
                        // This is a tritone substitution!
                        const originalDominant = Distance.transpose(next.tonic, 'P5'); // The "normal" V

                        concepts.push({
                            type: 'TritoneSubstitution',
                            startIndex: i,
                            endIndex: i + 1,
                            metadata: {
                                key: next.tonic,
                                substitutes: `${originalDominant}7`,
                                romanNumerals: ['subV', 'I'],
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
     * Detect Coltrane Changes (Giant Steps pattern)
     * Cycles of major thirds with ii-V-I in each key
     * Classic pattern: Bmaj7 -> D7 -> Gmaj7 -> Bb7 -> Ebmaj7 -> F#7 (then back to Bmaj7)
     */
    private static detectColtraneChanges(
        chords: string[],
        concepts: Concept[]
    ): void {
        // We need at least 6 chords to detect a full cycle
        if (chords.length < 6) return;

        for (let i = 0; i < chords.length - 5; i++) {
            try {
                const window = chords.slice(i, i + 6);
                const parsedChords = window.map((c) => Chord.get(c));

                // Check if all chords are valid
                if (parsedChords.some((c) => !c.tonic)) continue;

                // Extract tonics
                const tonics = parsedChords.map((c) => c.tonic!);

                // Giant Steps pattern: Major 3rd cycles
                // Pattern: Imaj7 -> V7/IVmaj7 -> IVmaj7 -> V7/bVIImaj7 -> bVIImaj7 -> V7/Imaj7
                // Example: Bmaj7 -> D7 -> Gmaj7 -> Bb7 -> Ebmaj7 -> F#7

                const isMajorThirdCycle =
                    this.isMajorThirdInterval(tonics[0], tonics[2]) && // I -> IV (major third)
                    this.isMajorThirdInterval(tonics[2], tonics[4]); // IV -> bVII (major third)

                const hasDominantConnections =
                    (parsedChords[1].type === '7' || parsedChords[1].aliases?.includes('7')) &&
                    (parsedChords[3].type === '7' || parsedChords[3].aliases?.includes('7')) &&
                    (parsedChords[5].type === '7' || parsedChords[5].aliases?.includes('7'));

                if (isMajorThirdCycle && hasDominantConnections) {
                    concepts.push({
                        type: 'ColtraneChanges',
                        startIndex: i,
                        endIndex: i + 5,
                        metadata: {
                            key: tonics[0],
                            romanNumerals: ['Imaj7', 'V7/IV', 'IVmaj7', 'V7/bVII', 'bVIImaj7', 'V7/I'],
                        },
                    });
                }
            } catch (e) {
                continue;
            }
        }
    }

    /**
     * Helper: Check if two notes are a major third apart
     */
    private static isMajorThirdInterval(note1: string, note2: string): boolean {
        try {
            const interval = Distance.distance(note1, note2);
            return interval === '3M' || interval === 'M3';
        } catch {
            return false;
        }
    }

    /**
     * Generate practice exercises from detected patterns.
     * Expects concepts with chord indices (startIndex/endIndex into chords array).
     * Returns one exercise per concept so indices align with detectedPatterns (which use measure indices elsewhere).
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
                    exercises.push({
                        type: concept.type,
                        startIndex: concept.startIndex,
                        chords: conceptChords,
                        practiceScale: iiChord?.tonic ? `${iiChord.tonic} Dorian` : undefined,
                        practiceArpeggio: iiChord?.notes?.join(', '),
                    });
                } catch (e) {
                    exercises.push({
                        type: concept.type,
                        startIndex: concept.startIndex,
                        chords: conceptChords,
                    });
                }
            } else if (concept.type === 'ColtraneChanges') {
                exercises.push({
                    type: concept.type,
                    startIndex: concept.startIndex,
                    chords: conceptChords,
                    practiceScale: 'Major third cycles',
                    practiceArpeggio: 'Practice each tonal center separately',
                });
            } else if (concept.type === 'SecondaryDominant' || concept.type === 'TritoneSubstitution') {
                exercises.push({
                    type: concept.type,
                    startIndex: concept.startIndex,
                    chords: conceptChords,
                });
            }
        }

        return exercises;
    }
}
