export type ConceptType = 'MajorII-V-I' | 'MinorII-V-i' | 'SecondaryDominant';

export interface Concept {
    type: ConceptType;
    startIndex: number;
    endIndex: number;
    metadata: {
        key?: string; // The tonal center (e.g., "C", "Gb")
        romanNumerals?: string[]; // The functional analysis (e.g., ["ii", "V", "I"])
        target?: string; // For functional dominants, e.g., "ii"
    };
}

export interface AnalysisResult {
    concepts: Concept[];
}
