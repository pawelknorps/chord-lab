import { useCallback } from 'react';
import { transposeChordSymbol, midiToNoteName, noteNameToMidi } from '../../../core/theory/index';
import standardsData from '../utils/standards.json';

export interface JazzStandard {
    Title: string;
    Composer?: string;
    Key?: string;
    Rhythm?: string;
    TimeSignature?: string;
    /** Original/suggested BPM from iReal or reference. Used when loading the tune. */
    Tempo?: number;
    /** Default repeat/loop count from iReal (e.g. 3 = play 3 times). Used when loading the tune. */
    DefaultLoops?: number;
    /** Comping style from iReal, if present. */
    CompStyle?: string;
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

    const getSongAsIRealFormat = useCallback((song: JazzStandard, transpose: number = 0) => {
        // Transform the structured JSON into the format expected by our components
        const visualMeasures: any[] = [];
        const playbackPlan: number[] = [];

        // Determine new key with correct spelling
        const originalKey = song.Key || "C";
        const keyMidi = noteNameToMidi(originalKey + "4");
        const shiftedMidi = keyMidi + transpose;
        const transposedKey = midiToNoteName(shiftedMidi, originalKey).replace(/[0-9-]/g, '');

        song.Sections.forEach(section => {
            const numEndings = section.Endings?.length || 0;
            const iterations = numEndings > 0 ? numEndings : (section.Repeats ? section.Repeats + 1 : 1);
            const isRepeated = iterations > 1;

            const sectionStartVisualIndex = visualMeasures.length;
            const mainSegmentVisualIndices: number[] = [];
            const endingVisualIndices: number[][] = [];

            // 1. Process MainSegment once for visual
            if (section.MainSegment.Chords) {
                const measureStrings = section.MainSegment.Chords.split('|');
                measureStrings.forEach((ms, msIdx) => {
                    const beatChords = ms.split(',').filter(c => c !== "");
                    const transposedChords = beatChords.map(c => transposeChordSymbol(c, transpose, transposedKey));

                    mainSegmentVisualIndices.push(visualMeasures.length);
                    visualMeasures.push({
                        chords: transposedChords.length > 0 ? transposedChords : [""],
                        sectionLabel: msIdx === 0 ? section.Label : undefined,
                        isFirstOfSection: msIdx === 0,
                        isStartRepeat: isRepeated && msIdx === 0,
                        isEndRepeat: isRepeated && !section.Endings && msIdx === measureStrings.length - 1
                    });
                });
            }

            // 2. Process Endings once for visual
            if (section.Endings) {
                section.Endings.forEach((ending, eIdx) => {
                    const endingIds: number[] = [];
                    const endingMeasureStrings = ending.Chords.split('|');
                    endingMeasureStrings.forEach((ms, msIdx) => {
                        const beatChords = ms.split(',').filter(c => c !== "");
                        const transposedChords = beatChords.map(c => transposeChordSymbol(c, transpose, transposedKey));

                        endingIds.push(visualMeasures.length);
                        visualMeasures.push({
                            chords: transposedChords.length > 0 ? transposedChords : [""],
                            endingNumber: eIdx + 1,
                            isFirstOfEnding: msIdx === 0,
                            isEndRepeat: isRepeated && eIdx < iterations - 1 && msIdx === endingMeasureStrings.length - 1
                        });
                    });
                    endingVisualIndices.push(endingIds);
                });
            }

            // 3. Build Playback Plan (Logical Expansion)
            for (let i = 0; i < iterations; i++) {
                // Add MainSegment to playback
                playbackPlan.push(...mainSegmentVisualIndices);

                // Add correct ending to playback
                if (endingVisualIndices.length > 0) {
                    if (endingVisualIndices[i]) {
                        playbackPlan.push(...endingVisualIndices[i]);
                    }
                }
            }
        });

        return {
            title: song.Title,
            composer: song.Composer || "Unknown",
            style: song.Rhythm || "Swing",
            compStyle: song.CompStyle,
            key: transposedKey,
            music: {
                measures: visualMeasures,
                playbackPlan: playbackPlan
            }
        };
    }, []);

    return { standards, getSongAsIRealFormat };
};
