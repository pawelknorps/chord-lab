export interface LessonData {
    hotspots: Array<{
        type: string;
        measures: number[];
        analysis: string;
        difficulty?: 'easy' | 'medium' | 'hard';
    }>;
    avoidNotes: Array<{
        measure: number;
        chord: string;
        avoid: string[];
        reason?: string;
    }>;
    substitutions: Array<{
        original: string;
        sub: string;
        measures: number[];
        type?: 'tritone' | 'modal' | 'chromatic';
    }>;
    goldenLick: string;
    practicePoints?: string[];
    commonMistakes?: string[];
}

export const sampleLessons: Record<string, LessonData> = {
    'autumn-leaves': {
        hotspots: [
            { type: 'ii-V-I', measures: [1, 2, 3], analysis: 'Classic ii-V-I in Bb major', difficulty: 'easy' },
            { type: 'ii-V-i', measures: [5, 6, 7], analysis: 'Minor ii-V-i in G minor', difficulty: 'medium' }
        ],
        avoidNotes: [
            { measure: 1, chord: 'Cm7', avoid: ['F'], reason: '4th creates tension against the 3rd' }
        ],
        substitutions: [
            { original: 'D7', sub: 'Ab7', measures: [6], type: 'tritone' }
        ],
        goldenLick: 'Approach the 3rd from below on the ii chord, emphasize the 9th on the V7',
        practicePoints: ['Focus on voice leading in measures 1-4', 'Practice the turnaround slowly'],
        commonMistakes: ['Rushing the bridge', 'Missing the key change']
    },
    'all-the-things-you-are': {
        hotspots: [
            { type: 'ii-V-I', measures: [1, 2, 3], analysis: 'Ab major ii-V-I', difficulty: 'medium' }
        ],
        avoidNotes: [],
        substitutions: [],
        goldenLick: 'Use chromatic approach tones in the bridge',
        practicePoints: ['Master the key changes', 'Practice the bridge separately']
    }
};
