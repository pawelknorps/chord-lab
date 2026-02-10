export interface RomanNumeralAnalysis {
    chord: string;
    romanNumeral: string;
    function: 'tonic' | 'subdominant' | 'dominant' | 'secondary' | 'chromatic';
    complexity: number;
}

export interface HotspotData {
    measureIndex: number;
    complexity: number;
    reasons: string[];
    isHotspot: boolean;
}
