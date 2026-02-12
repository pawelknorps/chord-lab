import { describe, it, expect } from 'vitest';
import { BassRhythmVariator } from './BassRhythmVariator';

describe('BassRhythmVariator', () => {
    const variator = new BassRhythmVariator();
    const standardLine = [36, 38, 40, 41]; // C2, D2, E2, F2

    it('should generate a 4-event list for standard fallback', () => {
        // Mocking Math.random to be > 0.25 (Standard fallback)
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
        const events = variator.applyVariations(standardLine, 0);

        expect(events).toHaveLength(4);
        expect(events[0].time).toBe("0:0:0");
        expect(events[1].time).toBe("0:1:0");
        expect(events[2].time).toBe("0:2:0");
        expect(events[3].time).toBe("0:3:0");
        expect(events[0].note).toBe(36);
        spy.mockRestore();
    });

    it('should generate "The Skip" variation correctly', () => {
        // Mocking Math.random to < 0.15 (SKIP_CHANCE)
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
        const events = variator.applyVariations(standardLine, 0);

        // Beat 1, Beat 2, Skip (And of 2), Beat 4
        expect(events).toHaveLength(4);
        expect(events[0].time).toBe("0:0:0");
        expect(events[1].time).toBe("0:1:0");
        expect(events[2].time).toBe("0:1:2"); // Skip
        expect(events[2].isGhost).toBe(true);
        expect(events[3].time).toBe("0:3:0");
        spy.mockRestore();
    });

    it('should generate "The Rake" variation correctly', () => {
        // Mocking Math.random between 0.15 and 0.20
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.17);
        const events = variator.applyVariations(standardLine, 0);

        // Rake (two hits on beat 0/0:0:1), then rest of bar
        expect(events).toHaveLength(5);
        expect(events[0].time).toBe("0:0:0");
        expect(events[0].isGhost).toBe(true);
        expect(events[1].time).toBe("0:0:1");
        expect(events[2].time).toBe("0:1:0");
        spy.mockRestore();
    });

    it('should generate "The Drop" variation correctly', () => {
        // Mocking Math.random between 0.20 and 0.25
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.22);
        const events = variator.applyVariations(standardLine, 0);

        // Beat 1, (Beat 2 SILENT), Beat 3, Beat 4
        expect(events).toHaveLength(3);
        expect(events[0].time).toBe("0:0:0");
        expect(events[1].time).toBe("0:2:0");
        expect(events[2].time).toBe("0:3:0");
        spy.mockRestore();
    });
});
