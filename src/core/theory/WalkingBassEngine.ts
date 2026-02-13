import * as Note from "@tonaljs/note";
import * as Chord from "@tonaljs/chord";
import { toTonalChordSymbol } from './chordSymbolForTonal';
import { BassRhythmVariator, BassEvent } from './BassRhythmVariator';

/**
 * Chord tone intervals in semitones from root (Friedland / bassist vocabulary).
 * Used for Beat 2 & 3 connector notes (arpeggiation).
 */
const CHORD_TONE_INTERVALS: Record<string, number[]> = {
  maj7: [0, 4, 7, 11],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
};

/**
 * WalkingBassEngine (Phase 12: Friedland "Building Walking Bass Lines")
 *
 * Prioritizes NOVELTY and interesting chord connections while respecting music theory:
 * - Harmonic context drives strategy: Circle of Fifths (V–I, ii–V), Stepwise (voice-led),
 *   Static (pedal), Classic (enclosure, tension–release) for other intervals.
 * - Beat 4 = approach (chromatic, dominant, scale, tritone, or 3rd-of-next).
 * - Beats 2–3 = chord tones, scalar runs, or 3rd→7th voice leading toward Beat 4.
 *
 * FRIEDLAND_WEIGHT < 1 so context-specific strategies (Circle, Stepwise, Static, Classic)
 * are used most of the time for varied, theory-rich bass lines.
 */
export class WalkingBassEngine {
  private lastNoteMidi: number = 36; // Start around C2

  // Range: E1–G3 (standard 4-string bass / jazz)
  private readonly RANGE_MIN = 28; // E1
  private readonly RANGE_MAX = 55; // G3

  /** Novelty-first: 0.25 = 25% Friedland, 75% context strategies (Circle, Stepwise, Static, Classic). */
  private readonly FRIEDLAND_WEIGHT = 0.25;

  private variator: BassRhythmVariator = new BassRhythmVariator();

  /**
   * Barry Harris "6th Diminished" Strategy.
   * For Major/Minor 6th chords, use the scale-of-sixths to provide chromatic but functional passing tones.
   */
  private strategyBarryHarris(currentRoot: number, nextRoot: number, currentChordSymbol: string): number[] {
    const isMinor = currentChordSymbol.toLowerCase().includes('m') && !currentChordSymbol.toLowerCase().includes('maj');
    // 6th Diminished Scale: 1 2 3 4 5 b6 6 7 (Major) or 1 2 b3 4 5 b6 6 7 (Minor)
    const scale = isMinor ? [0, 2, 3, 5, 7, 8, 9, 11] : [0, 2, 4, 5, 7, 8, 9, 11];

    const beat1 = this.adjustOctave(currentRoot, this.lastNoteMidi);

    // Choose 3 notes from the scale that lead to nextRoot
    // Barry Harris: "Always go to the nearest diminished note if you're lost"
    const approach = nextRoot > currentRoot ? nextRoot - 1 : nextRoot + 1;

    // Pick scale degrees that provide a "bebop" contour (e.g. 1 -> 2 -> b6 -> 5 -> approach)
    // We'll just pick interesting ones for now.
    const beat2 = this.adjustOctave(currentRoot + scale[2], beat1); // 3rd
    const beat3 = this.adjustOctave(currentRoot + scale[5], beat2); // b6 (diminished passing tone)
    const beat4 = this.adjustOctave(approach, beat3);

    return [beat1, beat2, beat3, beat4];
  }

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

    // Calculate the interval to the next chord (semitones)
    const interval = nextRoot - currentRoot;
    const absInterval = Math.abs(interval);

    let rawLine: number[];

    // Novelty-first: prefer context-specific strategies (Circle, Stepwise, Static, Classic)
    const useFriedland = Math.random() < this.FRIEDLAND_WEIGHT;
    const isBH = currentChordSymbol.toLowerCase().includes('6') || (currentChordSymbol.toLowerCase().includes('maj') && Math.random() < 0.3);

    if (isBH) {
      rawLine = this.strategyBarryHarris(currentRoot, nextRoot, currentChordSymbol);
    } else if (useFriedland) {
      rawLine = this.strategyFriedland(currentRoot, nextRoot, currentChordSymbol, nextChordSymbol);
    } else if (absInterval === 5 || absInterval === 7) {
      rawLine = this.strategyCircleOfFifths(currentRoot, nextRoot, currentChordSymbol);
    } else if (absInterval === 1 || absInterval === 2) {
      rawLine = this.strategyStepwise(currentRoot, nextRoot);
    } else if (absInterval === 0) {
      rawLine = this.strategyStatic(currentRoot, currentChordSymbol);
    } else {
      // Other intervals (3rds, 4ths, 6ths): use Classic (enclosure, tension–release, chromatic)
      rawLine = this.strategyClassic(currentRoot, nextRoot, currentChordSymbol);
    }

    // 2. Constrain to physical bass range and maintain smooth voice leading from previous bar
    const constrainedLine = this.constrainAndSmooth(rawLine);

    this.lastNoteMidi = constrainedLine[3];
    return constrainedLine;
  }

  // --- Friedland "Building Walking Bass Lines": Anchor → Journey → Approach ---
  /**
   * Beat 1 = root anchor. Beat 4 = approach to next bar's root (chromatic / dominant / scale).
   * Beats 2–3 = chord tones moving directionally toward Beat 4. No triple repetition.
   */
  private strategyFriedland(
    currentRoot: number,
    nextRoot: number,
    currentChordSymbol: string,
    nextChordSymbol: string
  ): number[] {
    // Beat 1: Anchor — root of current chord, octave-adjusted for smooth voice leading
    let beat1 = this.adjustOctave(currentRoot, this.lastNoteMidi);

    // Beat 4: Setup — must pull to next bar's Beat 1 (look ahead)
    const beat4Raw = this.getApproachNote(nextRoot, currentChordSymbol, nextChordSymbol);
    const beat4 = this.adjustOctave(beat4Raw, beat1);

    // Beats 2 & 3: Journey — chord tones bridging Beat 1 → Beat 4 (directional)
    const [beat2, beat3] = this.getConnectorNotes(beat1, beat4, currentChordSymbol);

    const rawLine = [beat1, beat2, beat3, beat4];
    return this.avoidRepetition(rawLine);
  }

  /**
   * Beat 4 approach: chromatic, dominant, scale, tritone, or upper neighbor — theory-rich variety.
   * Friedland: "Play a note on Beat 4 specifically to lead into the note on Beat 1 of the next bar."
   */
  private getApproachNote(
    targetRootMidi: number,
    _currentChordSymbol: string,
    _nextChordSymbol: string
  ): number {
    const r = Math.random();

    // Chromatic (40%): ±1 semitone from target — strongest pull
    if (r < 0.4) {
      return Math.random() > 0.5 ? targetRootMidi - 1 : targetRootMidi + 1;
    }

    // Dominant (25%): 5th of the TARGET (7 semitones above root)
    if (r < 0.65) {
      let fifthOfTarget = targetRootMidi + 7;
      if (fifthOfTarget > this.RANGE_MAX) fifthOfTarget -= 12;
      if (fifthOfTarget < this.RANGE_MIN) fifthOfTarget += 12;
      return fifthOfTarget;
    }

    // Scale (15%): diatonic step above (+2) or below (-2) target
    if (r < 0.8) {
      const stepAbove = targetRootMidi + 2;
      const stepBelow = targetRootMidi - 2;
      const choice = Math.random() > 0.5 ? stepAbove : stepBelow;
      return this.clampToRange(choice);
    }

    // Tritone approach (10%): tension that resolves to root next bar (jazz vocabulary)
    if (r < 0.9) {
      const tritoneUp = targetRootMidi + 6;
      const tritoneDown = targetRootMidi - 6;
      const choice = Math.random() > 0.5 ? tritoneUp : tritoneDown;
      return this.clampToRange(choice);
    }

    // Upper/lower neighbor (10%): whole step above or below target (enclosure flavor)
    const upperNeighbor = targetRootMidi + 2;
    const lowerNeighbor = targetRootMidi - 2;
    const choice = Math.random() > 0.5 ? upperNeighbor : lowerNeighbor;
    return this.clampToRange(choice);
  }

  /**
   * Connector notes: chord tones, scalar runs, or 3rd→7th voice leading toward Beat 4.
   * Variety: arpeggio (closest chord tones), scalar run (scale degrees), or 3rd–7th (guide-tone motion).
   */
  private getConnectorNotes(beat1: number, beat4: number, chordSymbol: string): [number, number] {
    const root = beat1;
    const ascending = beat4 > beat1;
    const strategy = Math.random();

    // 1. Scalar run (35%): root → 2nd → 3rd (up) or root → 7th → 6th (down) — singable, stepwise
    if (strategy < 0.35) {
      const second = ascending ? root + 2 : root - 2;
      const third = ascending ? root + 4 : root - 4;
      let b2 = this.adjustOctave(second, root);
      let b3 = this.adjustOctave(third, b2);
      if (b2 === b3) b3 = this.adjustOctave(ascending ? root + 7 : root - 7, b2);
      return [this.clampToRange(b2), this.clampToRange(b3)];
    }

    // 2. 3rd→7th voice leading (30%): guide-tone motion in direction of Beat 4
    if (strategy < 0.65) {
      const thirdSemis = chordSymbol.toLowerCase().includes('m') && !chordSymbol.toLowerCase().includes('maj') ? 3 : 4;
      const seventhSemis = this.getChordToneIntervals(chordSymbol)[3] ?? 10;
      let b2: number, b3: number;
      if (ascending) {
        b2 = this.adjustOctave(root + thirdSemis, root);
        b3 = this.adjustOctave(root + seventhSemis, b2);
      } else {
        b2 = this.adjustOctave(root - (12 - seventhSemis), root);
        b3 = this.adjustOctave(root - (12 - thirdSemis), b2);
      }
      if (b2 !== b3 && b2 !== beat1 && b3 !== beat1) return [this.clampToRange(b2), this.clampToRange(b3)];
    }

    // 3. Arpeggio / chord tones (35%): original logic — closest chord tones toward Beat 4
    const intervals = this.getChordToneIntervals(chordSymbol);
    const chordTones = intervals.map((semis) => this.adjustOctave(beat1 + semis, beat1));
    let beat2 = this.findClosestChordTone(chordTones, beat1, beat4);
    let beat3 = this.findClosestChordTone(chordTones, beat2, beat4);
    if (beat2 === beat1 && beat3 === beat1) {
      beat3 = beat1 + (ascending ? 2 : -2);
      beat3 = this.clampToRange(beat3);
    }
    return [beat2, beat3];
  }

  /** Chord tone intervals in semitones from root for current chord quality. */
  private getChordToneIntervals(symbol: string): number[] {
    const s = symbol.toLowerCase();
    if (s.includes('maj7') || s.includes('^7')) return CHORD_TONE_INTERVALS.maj7;
    if (s.includes('m7b5') || s.includes('ø')) return CHORD_TONE_INTERVALS.m7b5;
    if (s.includes('dim7')) return CHORD_TONE_INTERVALS.dim7;
    if (s.includes('m7') || s.includes('min7')) return CHORD_TONE_INTERVALS.m7;
    return CHORD_TONE_INTERVALS['7'];
  }

  /** Pick chord tone that is closest to target (directional motion toward Beat 4). */
  private findClosestChordTone(candidateMidis: number[], current: number, target: number): number {
    if (candidateMidis.length === 0) return current;
    return candidateMidis.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
  }

  /**
   * Keep note in range; choose octave that minimizes jump from reference (smooth voice leading).
   */
  private adjustOctave(note: number, reference: number): number {
    let n = note;
    while (n < this.RANGE_MIN) n += 12;
    while (n > this.RANGE_MAX) n -= 12;

    const distOrig = Math.abs(n - reference);
    const distUp = (n + 12) <= this.RANGE_MAX ? Math.abs(n + 12 - reference) : Infinity;
    const distDown = (n - 12) >= this.RANGE_MIN ? Math.abs(n - 12 - reference) : Infinity;

    if (distUp < distOrig) return n + 12;
    if (distDown < distOrig) return n - 12;
    return n;
  }

  /** Ensure no same pitch twice in a row (classic rule: avoid repetition unless pedaling). */
  private avoidRepetition(line: number[]): number[] {
    const out = [...line];
    for (let i = 1; i < out.length; i++) {
      if (out[i] === out[i - 1]) {
        // Nudge: move by a semitone (chromatic neighbor) — keep in pitch-class band
        const up = out[i] + 1;
        const down = out[i] - 1;
        if (out[i - 1] !== up && this.inRange(up)) out[i] = up;
        else if (out[i - 1] !== down && this.inRange(down)) out[i] = down;
        else out[i] = out[i] + 12; // octave shift as last resort
      }
    }
    return out;
  }

  private inRange(midi: number): boolean {
    return midi >= this.RANGE_MIN && midi <= this.RANGE_MAX;
  }

  // --- Helpers: approach notes & enclosure (counterpoint) ---
  private chromaticBelow(midi: number): number { return midi - 1; }
  /** Enclosure into target: upper neighbor (whole step above), then lower (half step below) → resolve next bar. */
  private enclosureUpperLower(target: number): [number, number] {
    return [target + 2, target - 1];
  }
  /** Reverse enclosure: lower then upper → target. */
  private enclosureLowerUpper(target: number): [number, number] {
    return [target - 1, target + 2];
  }

  // --- STRATEGY 0: CLASSIC (legacy patterns; chromatic, enclosure) — used only in target-vector blend ---
  // More chromatic: approach notes, enclosure, tension (7th/b9) → release.
  private strategyClassic(current: number, target: number, chordSymbol: string): number[] {
    const isMinor = chordSymbol.toLowerCase().includes("m") && !chordSymbol.toLowerCase().includes("maj");
    const third = current + (isMinor ? 3 : 4);
    const fifth = current + 7;
    const seventh = current + this.getSeventhInterval(chordSymbol);
    const approach = target > current ? target - 1 : target + 1;
    const r = Math.random();

    // Pattern A: Root - 3rd - 5th - Chromatic approach (arpeggio + approach)
    if (r < 0.25) return [current, third, fifth, approach];
    // Pattern B: Root - 5th - 7th - Chromatic (wider arpeggio + approach)
    if (r < 0.5) return [current, fifth, seventh, approach];
    // Pattern C: Enclosure into next bar — Root - 3rd - upper neighbor of target - lower neighbor (tension → release)
    if (r < 0.75) {
      const [upper, lower] = this.enclosureUpperLower(target);
      return [current, third, upper, lower];
    }
    // Pattern D: Tension (7th) then chromatic release — Root - chromatic approach to 3rd - 3rd - approach to target
    return [current, this.chromaticBelow(third), third, approach];
  }

  // --- STRATEGY 1: CIRCLE OF FIFTHS (The "Money" Progression) ---
  // More chromatic: double approach, enclosure, tension (7th) → release into 5th of target.
  private strategyCircleOfFifths(current: number, target: number, chordSymbol: string): number[] {
    const isMinor = chordSymbol.toLowerCase().includes("m") && !chordSymbol.toLowerCase().includes("maj");
    const third = isMinor ? current + 3 : current + 4;
    const fifth = current + 7;
    const sev = this.getSeventhInterval(chordSymbol);
    const approach = target > current ? target - 1 : target + 1;
    const targetFifth = target - 5;
    const r = Math.random();

    // PATTERN A: Ray Brown — Root - 3rd - 5th - Chromatic approach
    if (r < 0.25) return [current, third, fifth, approach];
    // PATTERN B: Dominant Drop — Root - Octave - 7th - 5th of Target
    if (r < 0.5) return [current, current + 12, current + sev, targetFifth];
    // PATTERN C: Enclosure into target — Root - 3rd - upper neighbor - lower neighbor (tension → release)
    if (r < 0.75) {
      const [upper, lower] = this.enclosureUpperLower(target);
      return [current, third, upper, lower];
    }
    // PATTERN D: Double chromatic — approach to approach (beat 3) then approach to target (beat 4); more tension
    const approachToApproach = approach > target ? approach + 1 : approach - 1;
    return [current, fifth, approachToApproach, approach];
  }

  // --- STRATEGY 2: STEPWISE MOTION ---
  // More chromatic: enclosure (upper-lower or lower-upper), chromatic passing, double approach.
  private strategyStepwise(current: number, target: number): number[] {
    const third = current + 4;
    const [upper, lower] = this.enclosureUpperLower(target);
    const [lowerN, upperN] = this.enclosureLowerUpper(target);
    const approach = target > current ? target - 1 : target + 1;
    const r = Math.random();

    // Enclosure: Root - 3rd - upper neighbor - lower neighbor (resolve next bar)
    if (r < 0.4) return [current, third, upper, lower];
    // Reverse enclosure: Root - 3rd - lower - upper (different tension curve)
    if (r < 0.7) return [current, third, lowerN, upperN];
    // Chromatic passing: Root - 3rd - chromatic approach to target - approach (double approach)
    const approach2 = target > current ? target - 2 : target + 2; // whole step away, then half step
    return [current, third, approach2, approach];
  }

  // --- STRATEGY 3: STATIC ---
  // More chromatic: tension (b6/#5) → release, enclosure of 5th, chromatic neighbor.
  private strategyStatic(current: number, chordSymbol: string): number[] {
    const fifth = current + 7;
    const sixth = current + 9;
    const fourth = current + 5;
    const octave = current + 12;
    const sev = this.getSeventhInterval(chordSymbol);
    const r = Math.random();

    // Ron Carter Pedal: Root - 5th - 6th - 5th
    if (r < 0.25) return [current, fifth, sixth, fifth];
    // Octave Skip: Root - Octave - 7th - 5th
    if (r < 0.5) return [current, octave, current + sev, fifth];
    // Tension → release: Root - 5th - b6 (#5) - 5th (chromatic neighbor above 5th)
    if (r < 0.75) return [current, fifth, current + 8, fifth];
    // Enclosure of 5th: Root - 4th - 6th - 5th (upper-lower around 5th; counterpoint)
    return [current, fourth, sixth, fifth];
  }

  /**
   * Voice Leading & Range Constraint.
   * - Keeps line in physical bass range (E1–G3).
   * - Prefer lower register: when multiple octave choices are valid, choose the lower.
   * - Logical phrases / counterpoint: prefer lines with smoother contour (smaller leaps, clearer direction).
   */
  private constrainAndSmooth(line: number[]): number[] {
    // 1. Find the shift that brings line[0] closest to lastNoteMidi (voice leading)
    let startNote = line[0];
    while (Math.abs(startNote - 12 - this.lastNoteMidi) < Math.abs(startNote - this.lastNoteMidi)) {
      startNote -= 12;
    }
    while (Math.abs(startNote + 12 - this.lastNoteMidi) < Math.abs(startNote - this.lastNoteMidi)) {
      startNote += 12;
    }
    const shift = startNote - line[0];

    // 2. Collect valid octave shifts (shift, shift-12, shift+12) that keep all notes in range
    const candidates: number[] = [];
    for (const s of [shift, shift - 12, shift + 12]) {
      const candidate = line.map(n => n + s);
      if (candidate.every(n => n >= this.RANGE_MIN && n <= this.RANGE_MAX)) {
        candidates.push(s);
      }
    }
    const shiftsToTry = candidates.length > 0 ? candidates : [shift];

    // 3. Prefer lower register + logical phrase (smoother contour)
    const scored = shiftsToTry.map(s => {
      const L = line.map(n => this.clampToRange(n + s));
      const avgPitch = L.reduce((a, b) => a + b, 0) / L.length;
      const totalLeap = L.slice(1).reduce((sum, n, i) => sum + Math.abs(n - L[i]), 0);
      const directionChanges = L.slice(1).reduce((count, n, i) => {
        const d = Math.sign(n - L[i]);
        const prev = i === 0 ? 0 : Math.sign(L[i] - L[i - 1]);
        return count + (d !== 0 && prev !== 0 && d !== prev ? 1 : 0);
      }, 0);
      // Lower avg = better; smaller leap = better; fewer direction changes = better (clearer phrase)
      const score = -avgPitch - totalLeap * 0.1 - directionChanges * 3;
      return { shift: s, line: L, score };
    });
    const best = scored.reduce((a, b) => (a.score >= b.score ? a : b));

    return best.line;
  }

  private clampToRange(midi: number): number {
    let n = midi;
    while (n < this.RANGE_MIN) n += 12;
    while (n > this.RANGE_MAX) n -= 12;
    return n;
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
