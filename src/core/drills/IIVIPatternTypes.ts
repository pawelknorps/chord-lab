export interface IIVIPattern {
    id: string;
    songTitle: string;
    key: string;
    chords: [string, string, string];
    measures: [number, number, number];
    type: 'Major' | 'Minor';
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface IIVIDrillState {
    patterns: IIVIPattern[];
    currentDrillMode: 'cycle' | 'single-key' | 'random' | 'song-specific' | null;
    currentPatternIndex: number;
    drillSequence: IIVIPattern[];
}
