# Research: Phase 10 – State-Machine Rhythmic Phrasing

## Objectives
- Transitioning from simple random selection to a state-aware "Director" for rhythm.
- Eliminating "robotic" repetition by penalizing consecutive identical patterns.
- Supporting "Anticipation" which requires cross-measure state and next-chord awareness.

## State Machine Concepts
1. **Markov Chain for Patterns**: Some patterns are better suited to follow others.
   - Example: `Charleston` -> `RedGarland` (Excellent).
   - Example: `Pedal` -> `SparseStab` (Jarring).
2. **Repetition Penalty**:
   - Current: 0.2x multiplier for direct repetition.
   - Proposed: Exponential decay for 3+ repetitions.
3. **Phrasal State**:
   - Comping often follows a 2-bar or 4-bar logic.
   - Need to track `measuresInCurrentPhrase`.
4. **Next-Chord Anticipation (The "Push")**:
   - If a pattern is "Anticipated," the engine must be able to "Peek" at the next chord in the sequence.
   - This requires `getRhythmPattern` to take `nextChord` as an argument.

## Musical Logic (Jazz Comping)
- **Pedal (Hold)**: Creates space. Good for starting a chorus or bridge.
- **RedGarland/Anticipation**: High energy. Good for the end of a phrase.
- **Charleston**: The bread and butter. Very stable.
- **SparseStab**: Good for very fast tempos or breaks.

## Implementation Details
- `RhythmEngine` needs to store a history of patterns (last 2 or 3).
- `getRhythmPattern` should return not just a pattern but a `RhythmDecision` object that includes if it's anticipating the next chord.
- `useJazzBand` needs to handle the "Push" by playing the voicing for `nextChord` if the pattern dictates it.
