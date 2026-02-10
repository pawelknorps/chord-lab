import * as Chord from '@tonaljs/chord';
import * as Note from '@tonaljs/note';

export interface Voicing {
    id: string;
    name: string;
    notes: string[];
    description: string;
}

export class VoicingEngine {
    /**
     * Generates standard jazz piano voicings for a given chord.
     */
    static getVoicings(chordSymbol: string): Voicing[] {
        const chord = Chord.get(chordSymbol);
        if (chord.empty) return [];

        const root = chord.tonic;
        if (!root) return [];

        const type = this.classifyChordType(chord.intervals);
        const voicings: Voicing[] = [];

        switch (type) {
            case 'Major7':
                voicings.push(...this.getMajorVoicings(root));
                break;
            case 'Minor7':
                voicings.push(...this.getMinorVoicings(root));
                break;
            case 'Dominant7':
                voicings.push(...this.getDominantVoicings(root, chordSymbol));
                break;
            case 'Minor7b5':
                voicings.push(...this.getHalfDimVoicings(root));
                break;
        }

        return voicings;
    }

    private static classifyChordType(intervals: string[]): string {
        if (intervals.includes('3M') && intervals.includes('7M')) return 'Major7';
        if (intervals.includes('3m') && intervals.includes('7m') && intervals.includes('5P')) return 'Minor7';
        if (intervals.includes('3M') && intervals.includes('7m')) return 'Dominant7';
        if (intervals.includes('3m') && intervals.includes('7m') && intervals.includes('5d')) return 'Minor7b5';
        return 'Unknown';
    }

    private static getMajorVoicings(root: string): Voicing[] {
        // Rootless Major 7 (A: 3-5-7-9, B: 7-9-3-5)
        return [
            {
                id: 'maj-rootless-a',
                name: 'Rootless Type A',
                notes: [
                    Note.transpose(root, '3M'),
                    Note.transpose(root, '5P'),
                    Note.transpose(root, '7M'),
                    Note.transpose(root, '9M')
                ],
                description: '3-5-7-9. Modern, airy sound.'
            },
            {
                id: 'maj-shell',
                name: 'Shell Voicing',
                notes: [root, Note.transpose(root, '3M'), Note.transpose(root, '7M')],
                description: '1-3-7. The essential structure.'
            }
        ];
    }

    private static getMinorVoicings(root: string): Voicing[] {
        return [
            {
                id: 'min-rootless-a',
                name: 'Rootless Type A',
                notes: [
                    Note.transpose(root, '3m'),
                    Note.transpose(root, '5P'),
                    Note.transpose(root, '7m'),
                    Note.transpose(root, '9M')
                ],
                description: '3-5-7-9. Standard jazz minor sound.'
            },
            {
                id: 'min-rootless-b',
                name: 'Rootless Type B',
                notes: [
                    Note.transpose(root, '7m'),
                    Note.transpose(root, '9M'),
                    Note.transpose(root, '3m'),
                    Note.transpose(root, '5P')
                ],
                description: '7-9-3-5. Inverted rootless.'
            }
        ];
    }

    private static getDominantVoicings(root: string, symbol: string): Voicing[] {
        const isAltered = symbol.includes('alt') || symbol.includes('b9') || symbol.includes('b13');

        if (isAltered) {
            return [
                {
                    id: 'dom-alt-abc',
                    name: 'Altered Shell',
                    notes: [
                        Note.transpose(root, '3M'),
                        Note.transpose(root, '7m'),
                        Note.transpose(root, 'b9'),
                        Note.transpose(root, 'b13')
                    ],
                    description: '3-7-b9-b13. High tension for resolution.'
                }
            ];
        }

        return [
            {
                id: 'dom-rootless-a',
                name: 'Rootless Type A',
                notes: [
                    Note.transpose(root, '3M'),
                    Note.transpose(root, '13M'),
                    Note.transpose(root, '7m'),
                    Note.transpose(root, '9M')
                ],
                description: '3-13-7-9. Rich dominant sound (13th instead of 5th).'
            },
            {
                id: 'dom-rootless-b',
                name: 'Rootless Type B',
                notes: [
                    Note.transpose(root, '7m'),
                    Note.transpose(root, '9M'),
                    Note.transpose(root, '3M'),
                    Note.transpose(root, '13M')
                ],
                description: '7-9-3-13. Inverted dominant voicing.'
            }
        ];
    }

    private static getHalfDimVoicings(root: string): Voicing[] {
        return [
            {
                id: 'm7b5-standard',
                name: 'Standard m7b5',
                notes: [
                    Note.transpose(root, '3m'),
                    Note.transpose(root, '5d'),
                    Note.transpose(root, '7m'),
                    Note.transpose(root, '9m') // often 9 is natural but b9 is also common
                ],
                description: '3-b5-b7-b9. Classic half-diminished tension.'
            }
        ];
    }
}
