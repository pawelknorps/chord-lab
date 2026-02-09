export type ConceptType =
    | 'MajorII-V-I'
    | 'MinorII-V-i'
    | 'SecondaryDominant'
    | 'TritoneSubstitution'
    | 'ColtraneChanges';

export interface Concept {
    type: ConceptType;
    startIndex: number;
    endIndex: number;
    metadata: {
        key?: string; // The tonal center (e.g., "C", "Gb")
        romanNumerals?: string[]; // The functional analysis (e.g., ["ii", "V", "I"])
        target?: string; // For functional dominants, e.g., "ii"
        substitutes?: string; // For tritone subs, the original chord being replaced
    };
}

export interface AnalysisResult {
    concepts: Concept[];
}
