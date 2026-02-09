export interface GuideTone {
    third: string;
    seventh: string;
    thirdMidi: number;
    seventhMidi: number;
}

export interface GuideToneResult {
    chord: string;
    guideTone: GuideTone;
    error?: string;
}
