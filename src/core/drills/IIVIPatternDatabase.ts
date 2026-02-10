import { ConceptAnalyzer } from '../theory/ConceptAnalyzer';
import type { IIVIPattern } from './IIVIPatternTypes';
import type { JazzStandard } from '../types/JazzStandard';

export class IIVIPatternDatabase {
    private patterns: IIVIPattern[] = [];
    private indexed: Map<string, IIVIPattern[]> = new Map();

    async scanStandards(standards: any[]): Promise<void> {
        console.log(`🔍 Scanning ${standards.length} standards for ii-V-I patterns...`);

        for (const song of standards) {
            if (!song.music?.measures) continue;

            const chords = song.music.measures.flatMap((m: any) => m.chords).filter((c: string) => c);
            const analysis = ConceptAnalyzer.analyze(chords, song.key);

            analysis.concepts.forEach((concept) => {
                if (concept.type === 'MajorII-V-I' || concept.type === 'MinorII-V-i') {
                    const pattern: IIVIPattern = {
                        id: `${song.title}-${concept.startIndex}`,
                        songTitle: song.title,
                        key: concept.metadata.key || song.key,
                        chords: [
                            chords[concept.startIndex],
                            chords[concept.startIndex + 1],
                            chords[concept.startIndex + 2],
                        ] as [string, string, string],
                        measures: [concept.startIndex, concept.startIndex + 1, concept.startIndex + 2] as [number, number, number],
                        type: concept.type === 'MajorII-V-I' ? 'Major' : 'Minor',
                        difficulty: this.calculateDifficulty(chords.slice(concept.startIndex, concept.startIndex + 3)),
                    };

                    this.patterns.push(pattern);

                    // Index by key
                    const keyPatterns = this.indexed.get(pattern.key) || [];
                    keyPatterns.push(pattern);
                    this.indexed.set(pattern.key, keyPatterns);
                }
            });
        }

        console.log(`✅ Found ${this.patterns.length} ii-V-I patterns`);
    }

    private calculateDifficulty(chords: string[]): 'Easy' | 'Medium' | 'Hard' {
        const hasAlterations = chords.some(c => c.includes('#') || c.includes('b') || c.includes('alt'));
        const hasExtensions = chords.some(c => c.includes('9') || c.includes('11') || c.includes('13'));

        if (hasAlterations) return 'Hard';
        if (hasExtensions) return 'Medium';
        return 'Easy';
    }

    getPatternsByKey(key: string): IIVIPattern[] {
        return this.indexed.get(key) || [];
    }

    getAllPatterns(): IIVIPattern[] {
        return this.patterns;
    }

    getRandomPattern(): IIVIPattern | null {
        if (this.patterns.length === 0) return null;
        return this.patterns[Math.floor(Math.random() * this.patterns.length)];
    }

    getCycleOfFifthsSequence(): IIVIPattern[] {
        const keys = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E', 'A', 'D', 'G'];
        const sequence: IIVIPattern[] = [];

        keys.forEach(key => {
            const patterns = this.getPatternsByKey(key);
            if (patterns.length > 0) {
                sequence.push(patterns[0]);
            }
        });

        return sequence;
    }
}

export const patternDatabase = new IIVIPatternDatabase();
