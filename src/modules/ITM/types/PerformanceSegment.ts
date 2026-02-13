export interface PlayedNote {
    frequency: number;
    clarity: number;
    cents: number;
    timestamp: number;
    durationMs?: number;
}

export interface PerformanceSegment {
    id: string;
    standardId: string;
    bpm: number;
    key: string;
    measures: {
        measureIndex: number;
        chords: string[];
        notes: PlayedNote[];
        accuracyScore: number;
    }[];
    overallScore: number;
    timestamp: number;
}
