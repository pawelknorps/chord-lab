import standardsData from '../../modules/JazzKiller/utils/standards.json';
import type { Progression } from '../theory';

interface JazzSection {
    Label?: string;
    Repeats?: number;
    MainSegment: {
        Chords: string;
    };
    Endings?: { Chords: string }[];
}

interface JazzStandard {
    Title: string;
    Composer?: string;
    Key?: string;
    Rhythm?: string;
    TimeSignature?: string;
    Sections: JazzSection[];
    CompStyle?: string;
    Tempo?: number;
}

export function getAllJazzStandards(): Progression[] {
    const standards: JazzStandard[] = standardsData as JazzStandard[];

    return standards.map(standard => {
        // Flatten chords from all sections
        const allChords: string[] = [];
        const key = standard.Key || 'C';

        standard.Sections.forEach(section => {
            const iterations = section.Endings ? section.Endings.length : (section.Repeats ? section.Repeats + 1 : 1);

            for (let i = 0; i < iterations; i++) {
                // Add MainSegment Chords
                if (section.MainSegment.Chords) {
                    const measureStrings = section.MainSegment.Chords.split('|');
                    measureStrings.forEach(ms => {
                        if (ms.trim() || ms === "") {
                            const beatChords = ms.split(',').filter(c => c !== "");
                            beatChords.forEach(c => allChords.push(c));
                        }
                    });
                }

                // Add Ending Chords for this iteration
                if (section.Endings && section.Endings[i]) {
                    const endingMeasureStrings = section.Endings[i].Chords.split('|');
                    endingMeasureStrings.forEach(ms => {
                        if (ms.trim() || ms === "") {
                            const beatChords = ms.split(',').filter(c => c !== "");
                            beatChords.forEach(c => allChords.push(c));
                        }
                    });
                }
            }
        });

        return {
            name: standard.Title,
            genre: 'Jazz Standard',
            description: `${standard.Composer || 'Unknown'} • ${standard.Rhythm || 'Swing'} • Key of ${key}${standard.Tempo ? ` • ${standard.Tempo} BPM` : ''}`,
            chords: allChords,
            compStyle: standard.CompStyle,
            // We store metadata in description or could extend Progression if needed
            // Currently PresetsPanel displays description.
        };
    });
}
