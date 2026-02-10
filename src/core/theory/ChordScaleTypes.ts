export interface ScaleOption {
    id: string;
    name: string;
    description: string;
    notes: string[];
    mood: 'stable' | 'tense' | 'bright' | 'dark' | 'exotic';
    sourceChord: string;
}

export interface ChordScaleMapping {
    primary: ScaleOption;
    alternatives: ScaleOption[];
}
