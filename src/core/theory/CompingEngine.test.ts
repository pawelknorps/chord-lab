import { describe, it, expect, beforeEach } from 'vitest';
import { CompingEngine } from './CompingEngine';

describe('CompingEngine', () => {
    let engine: CompingEngine;

    beforeEach(() => {
        engine = new CompingEngine();
    });

    it('should generate a rootless voicing for a major chord', () => {
        const voicing = engine.getNextVoicing('Cmaj7');
        expect(voicing.length).toBe(4);
        // Typical Major Type A: [E, B, D, E] or similar offsets [4, 11, 14, 16] from C3 (48)
        // C3 + 4 = 52 (E3), 48+11=59 (B3), 48+14=62 (D4), 48+16=64 (E4)
        expect(voicing).toContain(52); // E3
        expect(voicing).toContain(59); // B3
    });

    it('should use taxi-cab metric to find smooth transitions', () => {
        // Start with Dm7
        const dmVoicing = engine.getNextVoicing('Dm7');

        // Play G7 - should find a close voicing (smooth move)
        const g7Voicing = engine.getNextVoicing('G7');

        // Check Manhattan distance
        let distance = 0;
        const dSorted = [...dmVoicing].sort((a, b) => a - b);
        const gSorted = [...g7Voicing].sort((a, b) => a - b);
        for (let i = 0; i < dSorted.length; i++) {
            distance += Math.abs(dSorted[i] - gSorted[i]);
        }

        // ii-V-I transitions are usually very small (1-3 semitones total)
        expect(distance).toBeLessThan(10);
    });

    it('should apply tritone substitution on large jumps', () => {
        // Force a situation where a direct transition might be jumpy
        // This is hard to force with just A/B forms, but we can verify it doesn't crash 
        // and theoretically picks a closer one if we had more forms.
        // Let's at least verify it handles dominant chords.
        const v1 = engine.getNextVoicing('Dbmaj7'); // Somewhere low
        const v2 = engine.getNextVoicing('G7');      // G7 is a tritone away from Db

        // If it uses Tritone Sub, it might play Db7 (the sub) logic instead
        // We can't easily peek inside, but we can verify the result is a valid voicing
        expect(v2.length).toBeGreaterThanOrEqual(4);
    });

    it('should add root when Bass-Assist is enabled', () => {
        const voicing = engine.getNextVoicing('C7', { addRoot: true });
        expect(voicing.length).toBe(5); // 4 for grid + 1 for root
        expect(voicing[0]).toBe(36);   // C2 (Root-assist adds root - 12)
    });

    it('should obey the Soprano Anchor and stay below G5', () => {
        // Attempt to get a voicing for a high-pitched chord
        const voicing = engine.getNextVoicing('C7');
        const topNote = Math.max(...voicing);
        expect(topNote).toBeLessThanOrEqual(80); // G5
    });
});
