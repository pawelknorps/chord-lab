# Jazz Band Comping Evolution – Research

Source: `.planning/phases/Jazz band comping evolution.md` (realized as this milestone).

## 1. SOTA 2026: Hybrid Model

Building a jazz trio "from scratch" mathematically is a monumental task—that’s why iReal Pro stayed with static MIDI loops for so long. In 2026, SOTA has moved toward **Markov-Chain Pattern Sequencing** and **Stochastic Groove Injection**.

- **Do not delete the pattern library.** Evolve it into a "Smart Pattern Engine."
- **Pattern Transition Matrix**: Each pattern tagged with Energy Level (1–5) and Connectivity Score.
- **Logic**: Engine does not just play Pattern A; it looks at current bar and asks: "Am I at a cadence? Is the soloist playing intensely?" Use a **Markov Chain** to determine the next pattern.
- **Example**: If in Pattern 1 (Low Energy), 70% stay there, 20% move to Pattern 2 (Medium), 10% play a "Fill."

## 2. Stochastic Humanization Layer

A pattern library sounds fake because every "and of 2" is perfectly at the same tick. The 2026 fix is **Micro-Timing Offsets**.

- **Bass "Lazy" Factor**: Shift every bass note by a random value between −5ms and +2ms (slightly behind the beat for weight).
- **Piano "Velocity Velocity"**: Apply a Gaussian Blur to MIDI velocities so they fluctuate naturally within a 10% range.
- **Ghost Note Probability**: Add a "Probability Gate" to snare/hi-hat ghost notes—play them only 60% of the time so the loop "breathes."

## 3. Procedural Lead-In Generation

The most robotic part is the **transition between chords**.

- **Rule**: The last eighth note of any bar should be **Procedural**, not from the pattern.
- **Logic**: Use Functional Decomposition: for the final note of a bar, ignore the pattern and compute a **Chromatic Approach** or **Dominant Lead-in** to the next chord's root.
- **Result**: The bass line feels "connected" to the harmony rather than just looping a shape.

## 4. Comparison: Pattern Library vs SOTA Engine

| Feature           | Static Pattern Library   | 2026 Hybrid Engine                    |
|------------------|---------------------------|---------------------------------------|
| Feel             | Loops perfectly (Robotic) | Jitters and drifts (Human)            |
| Transitions      | Abrupt or repetitive      | Procedural lead-ins & Markov          |
| Energy           | Constant                  | Dynamic (scales with user input)      |
| Drum Fills       | Pre-recorded              | Generated via "Fill Rules" every 8 bars |

## 5. Meter Independence (Future)

To support every meter mathematically, store the pattern library as **Rhythmic Fragments** rather than full bars.

- **Atomize**: Break 4/4 patterns into 1-beat atoms.
- **Recombination**: To play 5/4, take three "Normal" atoms and two "Syncopated" atoms; for 7/8, three "Normal" and one "Shortened" (eighth-note) atom.
- **Math**: Generate any meter while keeping the hand-crafted feel of original samples.

## 6. Markov Pattern Engine (TypeScript Sketch)

```ts
type PatternType = 'LOW_ENERGY' | 'MEDIUM_ENERGY' | 'HIGH_ENERGY' | 'FILL';

interface Pattern {
  id: string;
  type: PatternType;
  midiData: any;
}

// Transition Matrix: [LOW, MEDIUM, HIGH, FILL]
private matrix: Record<PatternType, number[]> = {
  'LOW_ENERGY':    [0.70, 0.20, 0.05, 0.05],
  'MEDIUM_ENERGY': [0.15, 0.60, 0.15, 0.10],
  'HIGH_ENERGY':   [0.05, 0.20, 0.65, 0.10],
  'FILL':          [0.40, 0.40, 0.20, 0.00]  // After fill, reset to groove
};
```

- **getNextPatternType()**: Called every 4 or 8 bars; use cumulative random over row.
- **getPatternForBar()**: Select a specific pattern from the chosen category (random within type).
- **Integration with mic**: If student density > 0.8, bias matrix toward HIGH_ENERGY (e.g. update MEDIUM row to favor HIGH).

## 7. RhythmicDensityTracker (Sketch)

- **Window**: 4 seconds of onset "memory."
- **Onset logic**: Register hit when confidence > 0.88 and (pitch jump > 20Hz or RMS spike).
- **getDensity()**: Notes-per-second–style, normalized 0–1 (e.g. 20+ onsets in window ≈ 1.0).
- **Bridge**: `updateBandVibe(tracker, engine)` — density > 0.75 → bias HIGH; density < 0.3 → bias LOW; else MEDIUM. Adjust **probabilities**, do not flip instantly.

## 8. Advantages

- **Non-Linearity**: Unlike iReal, a unique "performance" every time with the same pattern library.
- **Fill Logic**: FILL state has 0% self-repeat so drummer plays fill one bar then returns to time.
- **Zero Latency**: Markov transition &lt;1ms; can run on final beat of bar without interrupting Transport.
- **SwiftF0**: Fast enough for granular onset detection; confidence gate reduces noise (cough, background).

## 9. Pattern Categories Summary

| State  | Feel                          | Best For                    |
|--------|-------------------------------|-----------------------------|
| LOW    | Spaced-out piano, root-note bass | Head in/out, ballad sections |
| MEDIUM | Standard "Spang-a-lang", walking bass | Solos, standard swing       |
| HIGH   | Syncopated comping, walking bass with "ghosts" | Peak of solo, trading 4s    |
| FILL   | Snare/tom accents, chromatic bass lead-in | Transitions at bar 8, 16, 32 |
