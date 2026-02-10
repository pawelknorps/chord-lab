import * as Chord from '@tonaljs/chord';
import * as Note from '@tonaljs/note';
import type { GuideTone } from './GuideToneTypes';

export class GuideToneCalculator {
    private static readonly BASE_OCTAVE = 4;

    static calculate(chordSymbol: string): GuideTone | null {
        try {
            const chord = Chord.get(chordSymbol);
            if (!chord.notes || chord.notes.length < 3) return null;

            const intervals = chord.intervals;
            const root = chord.tonic || 'C';

            // Find 3rd (or 4th for sus chords)
            let third = '';
            let thirdInterval = '';
            if (intervals.includes('3M')) {
                thirdInterval = '3M';
            } else if (intervals.includes('3m')) {
                thirdInterval = '3m';
            } else if (intervals.includes('4P')) {
                thirdInterval = '4P'; // Sus chord
            }

            if (thirdInterval) {
                third = Note.transpose(root, thirdInterval);
            }

            // Find 7th (or 6th for dim7)
            let seventh = '';
            let seventhInterval = '';
            if (intervals.includes('7M')) {
                seventhInterval = '7M';
            } else if (intervals.includes('7m')) {
                seventhInterval = '7m';
            } else if (intervals.includes('6M')) {
                seventhInterval = '6M'; // dim7 uses 6M (bb7)
            }

            if (seventhInterval) {
                seventh = Note.transpose(root, seventhInterval);
            }

            if (!third || !seventh) return null;

            // Convert to MIDI with octave
            const thirdMidi = Note.midi(`${third}${this.BASE_OCTAVE}`) || 60;
            const seventhMidi = Note.midi(`${seventh}${this.BASE_OCTAVE}`) || 67;

            return {
                third,
                seventh,
                thirdMidi,
                seventhMidi,
            };
        } catch (error) {
            console.error(`Error calculating guide tones for ${chordSymbol}:`, error);
            return null;
        }
    }

    static calculateMeasure(measureContent: string | string[]): GuideTone[] {
        const chords = Array.isArray(measureContent)
            ? measureContent
            : measureContent.split(/[\s,]+/).filter(c => c && c.length > 0);

        return chords.map(chord => this.calculate(chord)).filter((gt): gt is GuideTone => gt !== null);
    }
}
