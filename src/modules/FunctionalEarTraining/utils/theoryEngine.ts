import * as Progression from "@tonaljs/progression";
import * as Chord from "@tonaljs/chord";

export interface TheoreticalAnalysis {
    chord: string;
    roman: string;
    function: string;
    isSecondary?: boolean;
    isTritoneSub?: boolean;
    isModalInterchange?: boolean;
}

/**
 * Standardizes chord names and provides accurate Roman Numeral analysis
 */
export const analyzeProgression = (key: string, chords: string[]): TheoreticalAnalysis[] => {
    const isMinor = key.includes('m');

    return chords.map(chordName => {
        const cleanedChord = chordName.replace(/\(.*?\)/g, '').replace(/[[\]]/g, '').trim();
        const chord = Chord.get(cleanedChord);

        // 1. Get Roman Numeral
        let roman = Progression.toRomanNumerals(key, [cleanedChord])[0] || "?";

        // Minor Key Fixes
        if (isMinor) {
            if (roman === "IIm7") roman = "iim7b5";
            if (roman === "V7" && chord.intervals.includes("3M")) roman = "V7"; // Ensure major 3rd for dominant V
        }

        let functionalRole = "Stable";
        let isSecondary = false;
        let isTritoneSub = false;
        let isModalInterchange = false;

        // 2. Secondary Dominant Detection (V7/x)
        const hasMajorThird = chord.intervals.includes("3M");
        const hasMinorSeventh = chord.intervals.includes("7m");
        const isDom = hasMajorThird && hasMinorSeventh;

        if (isDom) {
            if (roman !== "V7" && roman !== "bVII7") {
                isSecondary = true;
                functionalRole = "Secondary Dominant";
            }
        }

        // 3. Tritone Substitution Detection (subV7/x)
        if (roman.includes("bII7") || roman.includes("bV7")) {
            isTritoneSub = true;
            functionalRole = "Tritone Sub";
        }

        // 4. Modal Interchange (Borrowed Chords)
        const borrowed = ["iv7", "bVImaj7", "bVII7", "bIImaj7", "v7"];
        if (borrowed.includes(roman)) {
            isModalInterchange = true;
            functionalRole = "Borrowed (Modal Interchange)";
        }

        return {
            chord: cleanedChord,
            roman,
            function: functionalRole,
            isSecondary,
            isTritoneSub,
            isModalInterchange
        };
    });
};

/**
 * Ensures note names are contextually correct for the given key
 */
export const getContextualNoteName = (midi: number, key: string): string => {
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
    const sharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    const index = midi % 12;
    return flatKeys.includes(key) ? flats[index] : sharps[index];
};
