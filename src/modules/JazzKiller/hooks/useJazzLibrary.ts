import { transposeChordSymbol, midiToNoteName, noteNameToMidi } from '../../../core/theory/index';
import standardsData from '../utils/standards.json';

export interface JazzStandard {
    Title: string;
    Composer?: string;
    Key?: string;
    Rhythm?: string;
    TimeSignature?: string;
    Sections: JazzSection[];
}

export interface JazzSection {
    Label?: string;
    Repeats?: number;
    MainSegment: {
        Chords: string;
    };
    Endings?: { Chords: string }[];
}

export const useJazzLibrary = () => {
    // Process standards data
    const standards: JazzStandard[] = standardsData as JazzStandard[];

    const getSongAsIRealFormat = (song: JazzStandard, transpose: number = 0) => {
        // Transform the structured JSON into the format expected by our components
        const measures: { chords: string[] }[] = [];

        // Determine new key with correct spelling
        const originalKey = song.Key || "C";
        const keyMidi = noteNameToMidi(originalKey + "4");
        const shiftedMidi = keyMidi + transpose;

        // Use theory engine to get correct spelling for the shifted key
        // We get a 1-note scale (Root) to get the correctly spelled name
        const transposedKey = midiToNoteName(shiftedMidi, originalKey).replace(/[0-9-]/g, '');

        song.Sections.forEach(section => {
            const iterations = section.Repeats ? section.Repeats + 1 : 1;

            for (let r = 0; r < iterations; r++) {
                // Handle MainSegment
                if (section.MainSegment.Chords) {
                    const measureStrings = section.MainSegment.Chords.split('|');
                    measureStrings.forEach(ms => {
                        if (ms.trim() || ms === "") {
                            // Split by comma for beats
                            const beatChords = ms.split(',').filter(c => c !== "");
                            const transposedChords = beatChords.map(c => transposeChordSymbol(c, transpose, transposedKey));
                            measures.push({ chords: transposedChords.length > 0 ? transposedChords : [""] });
                        }
                    });
                }

                // Note: Endings are tricky to handle in a flat loop without more logic
                // For now, we'll just take the first ending or ignore to keep it simple
            }
        });

        return {
            title: song.Title,
            composer: song.Composer || "Unknown",
            style: song.Rhythm || "Swing",
            key: transposedKey,
            music: {
                measures: measures
            }
        };
    };

    return { standards, getSongAsIRealFormat };
};
