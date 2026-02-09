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
}

export function getAllJazzStandards(): Progression[] {
    const standards: JazzStandard[] = standardsData as JazzStandard[];

    return standards.map(standard => {
        // Flatten chords from all sections
        const allChords: string[] = [];
        const key = standard.Key || 'C';

        standard.Sections.forEach(section => {
            // Logic from useJazzLibrary to parse chords
            if (section.MainSegment.Chords) {
                const measureStrings = section.MainSegment.Chords.split('|');
                measureStrings.forEach(ms => {
                    if (ms.trim() || ms === "") {
                        // Split by comma for beats
                        const beatChords = ms.split(',').filter(c => c !== "");
                        // No transposition needed here, we want the original chords for the preset
                        // But wait, the standards might use relative notation? No, they look absolute in JSON (D9, Fm6)
                        // But they map to the Key.
                        // Let's keep them as is.
                        beatChords.forEach(c => allChords.push(c));
                    }
                });
            }
        });

        return {
            name: standard.Title,
            genre: 'Jazz Standard',
            description: `${standard.Composer || 'Unknown'} • ${standard.Rhythm || 'Swing'} • Key of ${key}`,
            chords: allChords,
            // We store metadata in description or could extend Progression if needed
            // Currently PresetsPanel displays description.
        };
    });
}
