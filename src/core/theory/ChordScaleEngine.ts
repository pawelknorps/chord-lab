import * as Chord from '@tonaljs/chord';
import * as Scale from 'tonal-scale';
import { ChordScaleMapping, ScaleOption } from './ChordScaleTypes';

export class ChordScaleEngine {
    /**
     * Determines the best scales for a given chord symbol.
     * @param chordSymbol The chord symbol (e.g., "Dm7", "G7alt")
     * @param key Optional key context (e.g., "C")
     */
    static getScales(chordSymbol: string): ChordScaleMapping | null {
        const chord = Chord.get(chordSymbol);
        if (chord.empty) return null;

        const root = chord.tonic;
        if (!root) return null;

        const intervals = chord.intervals;
        const type = this.classifyChordType(intervals);

        switch (type) {
            case 'Major7':
            case 'Major6':
                return this.getMajorScales(root);
            case 'Minor7':
                return this.getMinorScales(root);
            case 'Minor6':
                return this.getMinor6Scales(root);
            case 'Dominant7':
                return this.getDominantScales(root, chordSymbol);
            case 'Minor7b5':
                return this.getHalfDiminishedScales(root);
            case 'Diminished7':
                return this.getDiminishedScales(root);
            default:
                return this.getGenericScales(root);
        }
    }

    private static getMinor6Scales(root: string): ChordScaleMapping {
        return {
            primary: this.createScaleOption(root, 'melodic minor', 'm6-melodic', 'Melodic minor. The standard choice for m6.', 'stable'),
            alternatives: [
                this.createScaleOption(root, 'dorian', 'm6-dorian', 'Dorian works well with the major 6th.', 'cool' as any)
            ]
        };
    }

    private static classifyChordType(intervals: string[]): string {
        if (intervals.includes('3M') && intervals.includes('7M')) return 'Major7';
        if (intervals.includes('3M') && intervals.includes('6M')) return 'Major6';
        if (intervals.includes('3m') && intervals.includes('7m') && intervals.includes('5P')) return 'Minor7';
        if (intervals.includes('3m') && intervals.includes('6M')) return 'Minor6';
        if (intervals.includes('3M') && intervals.includes('7m')) return 'Dominant7';
        if (intervals.includes('3m') && intervals.includes('7m') && intervals.includes('5d')) return 'Minor7b5';
        if (intervals.includes('3m') && intervals.includes('7d')) return 'Diminished7';
        return 'Unknown';
    }

    private static createScaleOption(root: string, scaleName: string, id: string, desc: string, mood: any): ScaleOption {
        const notes = Scale.notes(root, scaleName);
        return {
            id,
            name: `${root} ${scaleName}`,
            description: desc,
            notes: notes,
            mood,
            sourceChord: root
        };
    }

    private static getMajorScales(root: string): ChordScaleMapping {
        return {
            primary: this.createScaleOption(root, 'ionian', 'major-ionian', 'The standard major scale. Very stable.', 'stable'),
            alternatives: [
                this.createScaleOption(root, 'lydian', 'major-lydian', 'Major with a #4. Dreamy and bright.', 'bright'),
                this.createScaleOption(root, 'major pentatonic', 'major-pentatonic', 'Five notes, no wrong notes.', 'stable')
            ]
        };
    }

    private static getMinorScales(root: string): ChordScaleMapping {
        return {
            primary: this.createScaleOption(root, 'dorian', 'minor-dorian', 'The go-to jazz minor scale.', 'cool' as any), // TODO: Fix mood type
            alternatives: [
                this.createScaleOption(root, 'aeolian', 'minor-aeolian', 'Natural minor. Darker.', 'dark'),
                this.createScaleOption(root, 'minor pentatonic', 'minor-pentatonic', 'Classic blues/rock sound.', 'stable')
            ]
        };
    }

    private static getDominantScales(root: string, symbol: string): ChordScaleMapping {
        // Simple heuristic for alterations
        const isAltered = symbol.includes('alt') || symbol.includes('#9') || symbol.includes('b9');
        const isLydianDom = symbol.includes('#11');

        if (isAltered) {
            return {
                primary: this.createScaleOption(root, 'altered', 'dom-altered', 'Maximum tension. Contains all altered extensions.', 'tense'),
                alternatives: [
                    this.createScaleOption(root, 'mixolydian b9 b13', 'dom-mix-b9-b13', 'Harmonic minor mode 5. Spanish flavor.', 'exotic'),
                    this.createScaleOption(root, 'whole tone', 'dom-wholetone', 'Symmetrical, dream-like tension.', 'exotic')
                ]
            };
        }

        if (isLydianDom) {
            return {
                primary: this.createScaleOption(root, 'lydian dominant', 'dom-lydian-dom', 'Overtone series sound. Bright dominant.', 'bright'),
                alternatives: [
                    this.createScaleOption(root, 'mixolydian', 'dom-mixolydian', 'Standard dominant scale.', 'stable')
                ]
            };
        }

        return {
            primary: this.createScaleOption(root, 'mixolydian', 'dom-mixolydian', 'Standard dominant scale.', 'stable'),
            alternatives: [
                this.createScaleOption(root, 'lydian dominant', 'dom-lydian-dom', 'Adds a #11 for color.', 'bright'),
                this.createScaleOption(root, 'altered', 'dom-altered', 'Add tension to resolve strongly.', 'tense'),
                this.createScaleOption(root, 'major blues', 'dom-blues', 'Earthy, bluesy sound.', 'dark')
            ]
        };
    }

    private static getHalfDiminishedScales(root: string): ChordScaleMapping {
        return {
            primary: this.createScaleOption(root, 'locrian', 'half-dim-locrian', 'Standard choice for m7b5.', 'dark'),
            alternatives: [
                this.createScaleOption(root, 'locrian #2', 'half-dim-locrian-nat2', 'Locrian with a natural 2nd. More melodic.', 'bright') // tonal nomenclature might vary
            ]
        };
    }

    private static getDiminishedScales(root: string): ChordScaleMapping {
        return {
            primary: this.createScaleOption(root, 'diminished', 'dim-wh', 'Whole-Half diminished scale.', 'exotic'),
            alternatives: []
        };
    }

    private static getGenericScales(root: string): ChordScaleMapping {
        return {
            primary: this.createScaleOption(root, 'chromatic', 'chromatic', 'All 12 notes.', 'neutral' as any),
            alternatives: []
        };
    }
}
