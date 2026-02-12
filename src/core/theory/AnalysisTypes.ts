export type ConceptType =
    | 'MajorII-V-I'
    | 'MinorII-V-i'
    | 'SecondaryDominant'
    | 'TritoneSubstitution'
    | 'ColtraneChanges';

/** Key segment from tonality segmentation (Phase 21). */
export interface KeySegmentRef {
    startBar: number;
    endBar: number;
    key: string;
}

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
    /** Phase 21: key segment for this concept (optional). */
    keySegment?: KeySegmentRef;
    /** Phase 21: Roman numeral for single-chord concept or first of span (optional). */
    romanNumeral?: string;
    /** Phase 21: segment label e.g. "Key shift" (optional). */
    segmentLabel?: string;
}

export interface AnalysisResult {
    concepts: Concept[];
}
