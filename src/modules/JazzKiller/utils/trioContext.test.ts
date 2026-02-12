import { describe, it, expect } from 'vitest';
import { getPlaceInCycle, getSongStyleTag, isSoloistSpace } from './trioContext';

describe('trioContext', () => {
    describe('getPlaceInCycle', () => {
        it('returns head for first chorus (currentLoop 0)', () => {
            expect(getPlaceInCycle(0, 4, 0, 32, null)).toBe('head');
            expect(getPlaceInCycle(0, 1, 0, 16, null)).toBe('head');
        });

        it('returns solo for middle choruses', () => {
            expect(getPlaceInCycle(1, 4, 0, 32, null)).toBe('solo');
            expect(getPlaceInCycle(2, 4, 8, 32, null)).toBe('solo');
        });

        it('returns out head for last chorus', () => {
            expect(getPlaceInCycle(3, 4, 0, 32, null)).toBe('out head');
        });

        it('returns ending for last 4 bars of last chorus when measure has ending marker', () => {
            expect(getPlaceInCycle(3, 4, 30, 32, { endingNumber: 1 })).toBe('ending');
            expect(getPlaceInCycle(3, 4, 31, 32, { isFirstOfEnding: true })).toBe('ending');
        });

        it('returns intro when first chorus and section label contains intro', () => {
            expect(getPlaceInCycle(0, 4, 2, 32, { sectionLabel: 'Intro' })).toBe('intro');
            expect(getPlaceInCycle(0, 4, 7, 32, { sectionLabel: 'Intro' })).toBe('intro');
        });

        it('returns head when totalLoops is 0 (guard)', () => {
            expect(getPlaceInCycle(0, 0, 0, 16, null)).toBe('head');
        });
    });

    describe('getSongStyleTag', () => {
        it('returns Ballad when style or compStyle contains ballad', () => {
            expect(getSongStyleTag({ style: 'Ballad' })).toBe('Ballad');
            expect(getSongStyleTag({ compStyle: 'Ballad' })).toBe('Ballad');
            expect(getSongStyleTag({ style: 'Swing', compStyle: 'Ballad comp' })).toBe('Ballad');
        });

        it('returns Ballad when tempo < 90', () => {
            expect(getSongStyleTag({ style: 'Swing' }, 72)).toBe('Ballad');
            expect(getSongStyleTag({ Tempo: 80 })).toBe('Ballad');
        });

        it('returns Waltz for 3/4', () => {
            expect(getSongStyleTag({ TimeSignature: '3/4' })).toBe('Waltz');
        });

        it('returns Bossa when style contains bossa', () => {
            expect(getSongStyleTag({ style: 'Bossa Nova' })).toBe('Bossa');
        });

        it('returns Latin when style contains latin/samba/mambo', () => {
            expect(getSongStyleTag({ style: 'Latin' })).toBe('Latin');
            expect(getSongStyleTag({ style: 'Samba' })).toBe('Latin');
        });

        it('returns Up-tempo when tempo > 190', () => {
            expect(getSongStyleTag({ style: 'Swing' }, 200)).toBe('Up-tempo');
        });

        it('returns Medium Swing when unknown', () => {
            expect(getSongStyleTag(null)).toBe('Medium Swing');
            expect(getSongStyleTag({ style: 'Swing' }, 120)).toBe('Medium Swing');
        });
    });

    describe('isSoloistSpace', () => {
        it('returns true when place is solo or style is Ballad', () => {
            expect(isSoloistSpace('solo', 'Medium Swing')).toBe(true);
            expect(isSoloistSpace('head', 'Ballad')).toBe(true);
            expect(isSoloistSpace('solo', 'Ballad')).toBe(true);
        });

        it('returns false when head and Medium Swing', () => {
            expect(isSoloistSpace('head', 'Medium Swing')).toBe(false);
            expect(isSoloistSpace('out head', 'Up-tempo')).toBe(false);
        });
    });
});
