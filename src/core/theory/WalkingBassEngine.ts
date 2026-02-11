import * as Note from "@tonaljs/note";
import * as Chord from "@tonaljs/chord";

/**
 * WalkingBassEngine (Phase 12: Target & Approach)
 *
 * Teleological walking bass: every bar asks "Where is the next chord,
 * and how do I get there smoothly?" Beat 4 is the key—chromatic or
 * dominant approach into the next bar's root.
 *
 * 4-Beat Strategy:
 * - Beat 1 (Anchor): Establish harmonic function (root, or nearest chord tone).
 * - Beat 4 (Approach): Chromatic or 5th-of-destination leading to next bar's root.
 * - Beats 2–3 (Bridge): Chord tones or scale steps between Beat 1 and Beat 4.
 */
export class WalkingBassEngine {
  private lastNoteMidi: number = 41; // Start around F1
  private readonly RANGE_MIN = 28; // E1 (standard tuning low E)
  private readonly RANGE_MAX = 55; // G3 (thumb position start)

  /**
   * Generates a 4-note walking line for a single bar.
   * @param currentChordSymbol - e.g. "Dm7"
   * @param nextChordSymbol - The chord of the NEXT bar (e.g. "G7")
   */
  public generateWalkingLine(
    currentChordSymbol: string,
    nextChordSymbol: string
  ): number[] {
    const currentChord = Chord.get(currentChordSymbol);
    const nextChord = Chord.get(nextChordSymbol);
    const nextRootName = nextChord?.tonic ?? currentChord?.tonic ?? "C";
    const nextRootMidi = Note.midi(nextRootName + "2");
    const nextRoot =
      nextRootMidi != null ? nextRootMidi : 36; // fallback C2

    const line: number[] = [];

    // --- BEAT 1: The Anchor ---
    const beat1 = this.getNearestChordTone(currentChord, "1P");
    line.push(beat1);

    // --- BEAT 4: The Approach (calculated before 2 & 3) ---
    const beat4 = this.calculateApproachNote(nextRoot);

    // --- BEAT 2: The Direction ---
    const beat2 = this.getBridgeNote(currentChord, beat1, beat4);
    line.push(beat2);

    // --- BEAT 3: The Pivot ---
    const beat3 = this.getBridgeNote(currentChord, beat2, beat4);
    line.push(beat3);

    line.push(beat4);

    this.lastNoteMidi = beat4;

    return this.constrainRange(line);
  }

  /**
   * Beat 4 logic: how to land on the next chord.
   * Chromatic from below/above or 5th of destination.
   */
  private calculateApproachNote(targetMidi: number): number {
    const strategy = Math.random();
    const inRange = (n: number) =>
      Math.max(this.RANGE_MIN, Math.min(this.RANGE_MAX, n));

    if (strategy > 0.6) {
      return inRange(targetMidi - 1); // Chromatic from below
    }
    if (strategy > 0.3) {
      return inRange(targetMidi + 1); // Chromatic from above
    }
    return inRange(targetMidi - 5); // 5th of destination (e.g. going to C, play G)
  }

  /**
   * Beats 2 & 3: Find a chord tone or scale step between start and end.
   */
  private getBridgeNote(
    chord: { notes: string[] } | undefined,
    startNote: number,
    endNote: number
  ): number {
    if (!chord?.notes?.length) {
      return startNote < endNote ? startNote + 2 : startNote - 2;
    }

    const tones: number[] = [];
    for (const n of chord.notes) {
      const m1 = Note.midi(n + "1");
      const m2 = Note.midi(n + "2");
      if (m1 != null && m1 >= this.RANGE_MIN && m1 <= this.RANGE_MAX)
        tones.push(m1);
      if (m2 != null && m2 >= this.RANGE_MIN && m2 <= this.RANGE_MAX)
        tones.push(m2);
    }
    const unique = [...new Set(tones)].sort((a, b) => a - b);

    if (startNote < endNote) {
      const candidate = unique.find((t) => t > startNote && t < endNote);
      if (candidate != null) return candidate;
      return Math.min(
        this.RANGE_MAX,
        Math.max(this.RANGE_MIN, startNote + 2)
      );
    }
    if (startNote > endNote) {
      const candidate = unique.find((t) => t < startNote && t > endNote);
      if (candidate != null) return candidate;
      return Math.max(
        this.RANGE_MIN,
        Math.min(this.RANGE_MAX, startNote - 2)
      );
    }
    return startNote;
  }

  /**
   * Beat 1: Root (or given interval) closest to current hand position.
   */
  private getNearestChordTone(
    chord: { tonic?: string } | undefined,
    interval: string
  ): number {
    const root = chord?.tonic ?? "C";
    const baseName =
      interval === "1P"
        ? root
        : (Note.transpose(root + "4", interval) || root).replace(/\d/g, "") || root;

    const optionA = Note.midi(baseName + "1");
    const optionB = Note.midi(baseName + "2");
    const a = optionA != null ? optionA : 28;
    const b = optionB != null ? optionB : 40;

    const chosen =
      Math.abs(a - this.lastNoteMidi) <= Math.abs(b - this.lastNoteMidi)
        ? a
        : b;
    return Math.max(
      this.RANGE_MIN,
      Math.min(this.RANGE_MAX, chosen)
    );
  }

  private constrainRange(line: number[]): number[] {
    return line.map((note) => {
      if (note < this.RANGE_MIN) return note + 12;
      if (note > this.RANGE_MAX) return note - 12;
      return note;
    });
  }

  /** Expose last note for external state sync (e.g. useJazzBand). */
  public getLastNoteMidi(): number {
    return this.lastNoteMidi;
  }

  /** Set last note (e.g. when resuming or syncing with playback). */
  public setLastNoteMidi(midi: number): void {
    this.lastNoteMidi = Math.max(
      this.RANGE_MIN,
      Math.min(this.RANGE_MAX, midi)
    );
  }
}
