import { describe, it, expect, vi } from 'vitest';
import { BassRhythmVariator } from './BassRhythmVariator';

describe('BassRhythmVariator', () => {
    const variator = new BassRhythmVariator();
    const standardLine = [36, 38, 40, 41]; // C2, D2, E2, F2

    it('should generate a 4-event list for standard fallback', () => {
        // Mocking Math.random to be high so no variations trigger
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9);
        const events = variator.applyVariations(standardLine, 0, 0.5, "G7");

        expect(events).toHaveLength(4);
        expect(events[0].time).toBe("0:0:0");
        expect(events[1].time).toBe("0:1:0");
        expect(events[2].time).toBe("0:2:0");
        expect(events[3].time).toBe("0:3:0");
        expect(events[0].note).toBe(36);
        spy.mockRestore();
    });

    it('should generate "The Push" variation correctly', () => {
        // Reset variator state
        variator.reset();

        // Mocking Math.random to trigger PUSH (Beat 4 logic)
        // PUSH_CHANCE_BASE is 0.20. Let's force it at beat 4.
        const spy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
        const events = variator.applyVariations(standardLine, 0, 0.8, "G7");

        // Should have events for 1, 2, 3 and then the Push on "and of 4" (0:3:2)
        // Actually, in the loop:
        // i=0: standard
        // i=1: skip check (random < 0.16) -> triggers double time fill
        // i=2: skip check (random < 0.16) -> triggers double time fill
        // i=3: push check (random < 0.20) -> triggers Push

        // Wait, if random=0.1, it might trigger double time on beat 1.
        // Let's use different values or more specific mocks if needed.

        const pushEvent = events.find(e => e.time === "0:3:2");
        expect(pushEvent).toBeDefined();
        expect(pushEvent?.note).toBe(31); // G1 root push for G7

        spy.mockRestore();
    });

    it('should skip downbeat after a Push', () => {
        variator.reset();

        // 1. Force a Push in first call
        const spyPush = vi.spyOn(Math, 'random').mockReturnValue(0.1);
        variator.applyVariations(standardLine, 0, 0.8, "G7");
        spyPush.mockRestore();

        // 2. Second call should start from index 1 (skip 0:0:0)
        const spyNormal = vi.spyOn(Math, 'random').mockReturnValue(0.9);
        const nextEvents = variator.applyVariations(standardLine, 1, 0.5, "Cmaj7");

        expect(nextEvents[0].time).not.toBe("0:0:0");
        expect(nextEvents[0].time).toBe("0:1:0");

        spyNormal.mockRestore();
    });
});
