/**
 * Types for JJazzLab-derived drum patterns (from drums44DB.mid).
 * Aligns with DrumEngine DrumInstrument; time in beats within the phrase.
 * @see legacy_projects/JJazzLab-master/plugins/JJSwing/.../drums/db/drums44DB.mid
 */

export type JJazzLabDrumInstrument = "Ride" | "Snare" | "Kick" | "HatPedal" | "HatOpen";

export interface JJazzLabDrumEvent {
  /** Time in beats from start of phrase (0 = downbeat). */
  timeBeats: number;
  instrument: JJazzLabDrumInstrument;
  velocity: number;
}

export interface JJazzLabDrumPattern {
  /** DrumsStyle id (e.g. RIDE_1, BRUSHES_1, INTRO, ENDING). */
  styleId: string;
  /** Human-readable name. */
  name: string;
  /** Events in one phrase (typically 1 or 2 bars). */
  events: JJazzLabDrumEvent[];
  /** Time signature for the phrase, e.g. [4, 4]. */
  timeSignature: [number, number];
  /** Optional: "fill" vs "std" (standard). */
  type?: "std" | "fill";
}
