import { AnalysisResult, Concept } from './AnalysisTypes';

export interface WalkthroughStep {
    id: string;
    title: string;
    narrative: string;
    focusRange: { start: number; end: number } | null;
    concepts: Concept[];
    type: 'intro' | 'structural' | 'color' | 'outro';
}

export interface WalkthroughSession {
    steps: WalkthroughStep[];
}

export class WalkthroughEngine {
    static generate(
        analysis: AnalysisResult,
        songTitle: string,
        key: string,
        totalBars: number
    ): WalkthroughSession {
        const steps: WalkthroughStep[] = [];

        // 1. Intro Step
        steps.push({
            id: 'intro',
            title: `Welcome to ${songTitle}`,
            narrative: `This is a standard in the key of ${key}. It has ${totalBars} measures. Let's break down the harmony into understandable chunks.`,
            focusRange: null,
            concepts: [],
            type: 'intro',
        });

        // 2. Structural Patterns (ii-V-Is)
        // Sort concepts by start index
        const sortedConcepts = [...analysis.concepts].sort((a, b) => a.startIndex - b.startIndex);

        sortedConcepts.forEach((concept, index) => {
            if (concept.type === 'MajorII-V-I' || concept.type === 'MinorII-V-i') {
                const isMinor = concept.type === 'MinorII-V-i';
                const keyCenter = concept.metadata.key || 'Unknown';

                // Determine relationship to home key (simplified)
                const isHomeKey = keyCenter === key;
                const relationText = isHomeKey
                    ? `in the home key of ${key}`
                    : `modulating to ${keyCenter}`;

                steps.push({
                    id: `concept-${index}`,
                    title: isMinor ? `Minor ii-V-i in ${keyCenter}` : `Major ii-V-I in ${keyCenter}`,
                    narrative: `Here we see a classic ${isMinor ? 'minor' : 'major'} ii-V-I progression ${relationText}. This is a primary building block of the tune.`,
                    focusRange: { start: concept.startIndex, end: concept.endIndex },
                    concepts: [concept],
                    type: 'structural',
                });
            } else if (concept.type === 'SecondaryDominant') {
                const target = concept.metadata.target || 'resolution';
                steps.push({
                    id: `concept-${index}`,
                    title: 'Secondary Dominant',
                    narrative: `This dominant chord is not in the key of ${key}. It's a "Secondary Dominant" that temporarily tonicizes the ${target} chord, adding forward motion.`,
                    focusRange: { start: concept.startIndex, end: concept.endIndex },
                    concepts: [concept],
                    type: 'color',
                });
            } else if (concept.type === 'TritoneSubstitution') {
                const sub = concept.metadata.substitutes;
                steps.push({
                    id: `concept-${index}`,
                    title: 'Tritone Substitution',
                    narrative: `Here we have a Tritone Sub. Instead of playing ${sub}, we play a dominant 7th a tritone away (sharing the same guide tones) to create chromatic bass movement.`,
                    focusRange: { start: concept.startIndex, end: concept.endIndex },
                    concepts: [concept],
                    type: 'color',
                });
            } else if (concept.type === 'ColtraneChanges') {
                steps.push({
                    id: `concept-${index}`,
                    title: 'Coltrane Changes',
                    narrative: `This assumes a Cycle of Major Thirds, a pattern made famous by John Coltrane.`,
                    focusRange: { start: concept.startIndex, end: concept.endIndex },
                    concepts: [concept],
                    type: 'color',
                });
            }
        });

        // 3. Outro Step
        steps.push({
            id: 'outro',
            title: 'Ready to Practice',
            narrative: `You've seen the main components. Now use the "Start Session" button to practice the form, or loop any of the specific sections we just analyzed.`,
            focusRange: null,
            concepts: [],
            type: 'outro',
        });

        return { steps };
    }
}
