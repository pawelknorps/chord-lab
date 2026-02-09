import { describe, it, expect } from 'vitest';
import { getFunctionalNoteName } from './theoryEngine';

describe('Theory Engine', () => {
    describe('getFunctionalNoteName', () => {
        it('should correctly spell diatonic notes in C Major', () => {
            expect(getFunctionalNoteName(60, 'C')).toBe('C4');
            expect(getFunctionalNoteName(62, 'C')).toBe('D4');
            expect(getFunctionalNoteName(64, 'C')).toBe('E4');
        });

        it('should correctly spell secondary dominant thirds (Jazz rules)', () => {
            // V/ii in C is A7, third is C# (61)
            expect(getFunctionalNoteName(61, 'C', 'V/ii')).toBe('C#4');

            // V/V in C is D7, third is F# (66)
            expect(getFunctionalNoteName(66, 'C', 'V/V')).toBe('F#4');
        });

        it('should correctly spell modal interchange notes (Jazz rules)', () => {
            // iv in C is Fm, third is Ab (68)
            expect(getFunctionalNoteName(68, 'C', 'iv')).toBe('Ab4');

            // bVII in C is Bb, root is Bb (70)
            expect(getFunctionalNoteName(70, 'C', 'bVII')).toBe('Bb4');
        });

        it('should handle sharp keys (e.g., F# Major)', () => {
            // E# is the 7th of F# Major (65)
            expect(getFunctionalNoteName(65, 'F#')).toBe('E#4');
        });
    });
});
