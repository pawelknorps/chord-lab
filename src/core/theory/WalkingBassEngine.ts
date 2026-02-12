import * as Note from "@tonaljs/note";
import * as Chord from "@tonaljs/chord";
import { toTonalChordSymbol } from './chordSymbolForTonal';
import { BassRhythmVariator, BassEvent } from './BassRhythmVariator';

/**
 * WalkingBassEngine (Phase 12: Target & Approach - Bebop Edition)
 *
 * Teleological walking bass: every note in the bar is chosen specifically 
 * to set up the downbeat of the next bar.
 * 
 * Logic based on "Target & Enclosure" algorithm (Paul Chambers/Ray Brown style).
 */
export class WalkingBassEngine {
  private lastNoteMidi: number = 36; // Start around C2

  // Range Limit (Standard 4-String Bass / Jazz Range)
  private readonly RANGE_MIN = 28; // E1
  private readonly RANGE_MAX = 55; // G3

  private variator: BassRhythmVariator = new BassRhythmVariator();

  /**
   * Generates a walking bass line with rhythmic variations.
   */
  public generateVariedWalkingLine(
    currentChordSymbol: string,
    nextChordSymbol: string,
    barIndex: number,
    energy: number = 0.5
  ): BassEvent[] {
    const line = this.generateWalkingLine(currentChordSymbol, nextChordSymbol);
    return this.variator.applyVariations(line, barIndex, energy, nextChordSymbol);
  }

  /**
   * Generates a 4-note walking line tailored to the harmonic movement.
   * @param currentChordSymbol - e.g. "Dm7"
   * @param nextChordSymbol - The chord of the NEXT bar (e.g. "G7")
   */
  public generateWalkingLine(
    currentChordSymbol: string,
    nextChordSymbol: string
  ): number[] {
    const currentChord = Chord.get(toTonalChordSymbol(currentChordSymbol));
    const nextChord = Chord.get(toTonalChordSymbol(nextChordSymbol));

    // Normalize roots to a consistent octave for interval calculation
    const currentRoot = Note.midi((currentChord.tonic || "C") + "2") || 36;
    const nextRoot = Note.midi((nextChord.tonic || "C") + "2") || 36;

    // Calculate the Interval to the next chord
    const interval = nextRoot - currentRoot;

    let rawLine: number[];

    // 1. Select Strategy based on Harmonic Context
    // Is it a "Two-Five" or "Five-One" motion (Circle of Fifths)?
    if (Math.abs(interval) === 5 || Math.abs(interval) === 7) {
      rawLine = this.strategyCircleOfFifths(currentRoot, nextRoot, currentChordSymbol);
    }
    // Is it a Stepwise motion (e.g., Cmaj7 to Dm7)?
    else if (Math.abs(interval) === 1 || Math.abs(interval) === 2) {
      rawLine = this.strategyStepwise(currentRoot, nextRoot);
    }
    // Is it Static (Cmaj7 to Cmaj7 or Octave shift)?
    else {
      rawLine = this.strategyStatic(currentRoot, currentChordSymbol);
    }

    // 2. Constrain to physical bass range and maintain smooth voice leading from previous bar
    const constrainedLine = this.constrainAndSmooth(rawLine);

    this.lastNoteMidi = constrainedLine[3];
    return constrainedLine;
  }

  // --- STRATEGY 1: CIRCLE OF FIFTHS (The "Money" Progression) ---
  private strategyCircleOfFifths(current: number, target: number, chordSymbol: string): number[] {
    const isMinor = chordSymbol.toLowerCase().includes("m") && !chordSymbol.toLowerCase().includes("maj");
    const third = isMinor ? current + 3 : current + 4;
    const fifth = current + 7;

    // PATTERN A: The "Ray Brown" (Root - 3rd - 5th - Chromatic Approach)
    if (Math.random() > 0.4) {
      const approach = target > current ? target - 1 : target + 1;
      return [current, third, fifth, approach];
    }

    // PATTERN B: The "Dominant Drop" (Root - Octave - 7th - 5th of Target)
    const targetFifth = target - 5; // Low 5th of destination
    const sev = this.getSeventhInterval(chordSymbol);
    return [current, current + 12, current + sev, targetFifth];
  }

  // --- STRATEGY 2: STEPWISE MOTION ---
  private strategyStepwise(current: number, target: number): number[] {
    // ENCLOSURE LOGIC: Surrounding target from above and below
    // Beat 3: One whole step above Target
    // Beat 4: One half step below Target
    const upperNeighbor = target + 2;
    const lowerNeighbor = target - 1;

    // Path: Root -> 3rd -> Upper -> Lower
    return [current, current + 4, upperNeighbor, lowerNeighbor];
  }

  // --- STRATEGY 3: STATIC ---
  private strategyStatic(current: number, chordSymbol: string): number[] {
    const fifth = current + 7;
    const sixth = current + 9;
    const octave = current + 12;

    // The "Ron Carter" Pedal: Root - 5th - 6th - 5th
    if (Math.random() > 0.5) {
      return [current, fifth, sixth, fifth];
    }

    // The "Octave Skip": Root - Octave - 7th - 5th
    const sev = this.getSeventhInterval(chordSymbol);
    return [current, octave, current + sev, fifth];
  }

  /**
   * Voice Leading & Range Constraint.
   * Ensures the line stays within physical bass limits and 
   * picks the octave closest to the previous bar's ending note.
   */
  private constrainAndSmooth(line: number[]): number[] {
    // 1. First, find best octave for the start note relative to lastNoteMidi
    let startNote = line[0];
    while (Math.abs(startNote - 12 - this.lastNoteMidi) < Math.abs(startNote - this.lastNoteMidi)) {
      startNote -= 12;
    }
    while (Math.abs(startNote + 12 - this.lastNoteMidi) < Math.abs(startNote - this.lastNoteMidi)) {
      startNote += 12;
    }

    // 2. Apply the shift to the whole line to preserve melodic intervals
    const shift = startNote - line[0];
    let shiftedLine = line.map(n => n + shift);

    // 3. Hard-clamp to physical range (E1-G3)
    return shiftedLine.map(n => {
      let clamped = n;
      while (clamped < this.RANGE_MIN) clamped += 12;
      while (clamped > this.RANGE_MAX) clamped -= 12;
      return clamped;
    });
  }

  private getSeventhInterval(symbol: string): number {
    if (symbol.toLowerCase().includes("maj7") || symbol.toLowerCase().includes("^7")) return 11;
    return 10; // Dominant/Minor 7
  }

  /** Expose last note for external state sync. */
  public getLastNoteMidi(): number {
    return this.lastNoteMidi;
  }

  public setLastNoteMidi(midi: number): void {
    this.lastNoteMidi = Math.max(this.RANGE_MIN, Math.min(this.RANGE_MAX, midi));
  }
}
