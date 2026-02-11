export type DrumInstrument = "Ride" | "Snare" | "Kick" | "HatPedal";

export interface DrumHit {
    time: string; // Tone.js time (e.g., "0:1:2")
    velocity: number;
    instrument: DrumInstrument;
}

/**
 * DrumEngine (Phase 11: Pro DeJohnette-Style)
 * 
 * A rule-based generative engine that creates "elastic" jazz drums.
 * Features:
 * 1. Broken-time Ride (Elasticity)
 * 2. Conversational Snare/Kick (Chatter)
 * 3. Hi-Hat Anchor (2 & 4)
 * 4. Micro-timing (Ride Push, Snare Drag)
 */
export class DrumEngine {

    /**
     * Generates a 1-bar phrase of drum hits based on density.
     * @param density 0.0 to 1.0 (How busy the drummer is)
     * @param pianoDensity 0.0 to 1.0 (Optional: Piano activity to trigger collaborative "listening")
     */
    public generateBar(density: number, pianoDensity: number = 0): DrumHit[] {
        // Collaborative Listening: If piano is very busy (> 0.8), the drummer simplifies (-)
        const listenerAdjustment = pianoDensity > 0.8 ? -0.3 : (pianoDensity < 0.2 ? 0.1 : 0);
        const effectiveDensity = Math.max(0.1, Math.min(1.0, density + listenerAdjustment));

        const hits: DrumHit[] = [];

        // 1. The Anchor (Hi-Hat Pedal on 2 and 4)
        // Hard-coded to ground the "weirdness"
        hits.push({ time: "0:1:0", velocity: 0.7, instrument: "HatPedal" });
        hits.push({ time: "0:3:0", velocity: 0.7, instrument: "HatPedal" });

        // 2. The "Elastic" Ride
        this.generateRideStream(hits, effectiveDensity);

        // 3. The "Chatter" (Snare/Kick Conversation)
        this.generateComping(hits, effectiveDensity);

        return hits;
    }

    private generateRideStream(hits: DrumHit[], density: number) {
        const quarters = ["0:0:0", "0:1:0", "0:2:0", "0:3:0"];
        const skips = ["0:1:2", "0:3:2"]; // Triplet skip notes

        quarters.forEach(time => {
            // "Broken Time": 10% chance to skip a quarter note (creates "air")
            if (Math.random() > 0.1) {
                hits.push({
                    time,
                    instrument: "Ride",
                    velocity: 0.6 + Math.random() * 0.2
                });
            }
        });

        skips.forEach(time => {
            // Higher density = more frequent "spang-a-lang" feel.
            // Lower density = flatter, modern jazz feel.
            if (Math.random() < density) {
                hits.push({
                    time,
                    instrument: "Ride",
                    velocity: 0.3 + Math.random() * 0.2
                });
            }
        });
    }

    private generateComping(hits: DrumHit[], density: number) {
        // Conversation slots (mostly syncopated)
        const slots: { time: string; type: DrumInstrument }[] = [
            { time: "0:0:2", type: "Snare" }, // "And" of 1
            { time: "0:1:1", type: "Kick" },  // Triplet mid
            { time: "0:2:2", type: "Snare" }, // "And" of 3
            { time: "0:3:1", type: "Kick" },  // Triplet mid
            { time: "0:0:1", type: "Snare" }, // Early chatter
            { time: "0:2:1", type: "Kick" }   // Mid bar response
        ];

        slots.forEach(slot => {
            // Chatter probability scales with density
            if (Math.random() < density * 0.5) {
                const isGhost = Math.random() > 0.25; // 75% chance of ghost notes
                const velocity = isGhost ? 0.15 + Math.random() * 0.15 : 0.6 + Math.random() * 0.25;
                hits.push({
                    time: slot.time,
                    instrument: slot.type,
                    velocity
                });
            }
        });
    }

    /**
     * Calculates the micro-timing offset for a specific instrument.
     * Ride: Pushes ahead (-15ms)
     * Snare: Drags behind (+20ms)
     * @returns offset in seconds
     */
    public getMicroTiming(inst: DrumInstrument): number {
        let baseOffset = 0;
        if (inst === "Ride") baseOffset = -0.015;
        if (inst === "Snare") baseOffset = 0.020;

        // Random jitter (jitter should be very small, ±5ms)
        const jitter = (Math.random() * 0.01) - 0.005;
        return baseOffset + jitter;
    }
}
