
export type BassEvent = {
    time: string;       // "0:0:0"
    duration: string;   // "4n"
    velocity: number;   // 0.8 to 1.0 for normal, 0.4 for ghost
    isGhost?: boolean;  // True = Muted/Dead note sound
    note: number;       // MIDI pitch
};

export class BassRhythmVariator {
    // Probability Controls (0.0 - 1.0)
    private readonly SKIP_CHANCE = 0.15; // 15% chance (Don't overdo it!)
    private readonly RAKE_CHANCE = 0.05; // 5% chance (Special effect)

    /**
     * Transforms a standard 4-note walking line into a rhythmic variation.
     * @param line - Array of 4 MIDI notes [Beat1, Beat2, Beat3, Beat4]
     * @param barIndex - Current bar index (can be used for structural variations)
     */
    public applyVariations(line: number[], _barIndex: number): BassEvent[] {
        const events: BassEvent[] = [];
        const roll = Math.random();

        // --- VARIATION 1: THE SKIP (Pushing the "And") ---
        // Instead of playing on Beat 3, we play on "And of 2"
        if (roll < this.SKIP_CHANCE) {
            // Beat 1 (Normal)
            events.push({ time: "0:0:0", duration: "4n", velocity: 0.9, note: line[0] });
            // Beat 2 (Shortened to 8n)
            events.push({ time: "0:1:0", duration: "8n", velocity: 0.85, note: line[1] });

            // The Skip (Ghost/Muted note on "And of 2")
            events.push({
                time: "0:1:2", // 16th note grid: 0 (on), 1 (e), 2 (and), 3 (a)
                duration: "8n",
                velocity: 0.6,
                isGhost: true,
                note: line[1] // Repeat previous note as ghost
            });

            // Beat 3 is SKIPPED (Rest)

            // Beat 4 (Normal recovery)
            events.push({ time: "0:3:0", duration: "4n", velocity: 0.9, note: line[3] });

            return events;
        }

        // --- VARIATION 2: THE RAKE (Triplet into Beat 1) ---
        // Adds muted notes BEFORE Beat 1.
        // NOTE: In useJazzBand, we schedule this leading into Beat 1 of the current bar.
        if (roll < this.SKIP_CHANCE + this.RAKE_CHANCE) {
            // The Rake (Fast triplets leading to 1)
            // We'll simulate this by playing the first ghost note slightly early or just at the start of beat 0
            events.push({ time: "0:0:0", duration: "16t", velocity: 0.4, isGhost: true, note: line[0] }); // Ghost
            events.push({ time: "0:0:1", duration: "8n", velocity: 1.0, note: line[0] }); // The Real Beat 1 (Slightly late/accented)

            // Remaining beats normal
            events.push({ time: "0:1:0", duration: "4n", velocity: 0.9, note: line[1] });
            events.push({ time: "0:2:0", duration: "4n", velocity: 0.9, note: line[2] });
            events.push({ time: "0:3:0", duration: "4n", velocity: 0.9, note: line[3] });

            return events;
        }

        // --- STANDARD (Fallback) ---
        // Just 4 quarter notes
        return line.map((note, i) => ({
            time: `0:${i}:0`,
            duration: "4n",
            velocity: i === 0 || i === 2 ? 0.95 : 0.85, // Accent 1 and 3 slightly (2-feel pulse)
            note: note
        }));
    }
}
