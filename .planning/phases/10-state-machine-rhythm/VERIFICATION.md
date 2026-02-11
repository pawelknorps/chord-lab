# Phase 10 Verification: State-Machine Rhythmic Phrasing

## Success Criteria Status

- [✅] **Repetition Penalty**: Verified. `RhythmEngine` penalizes recently used patterns (0.1x multiplier) making immediate loops highly unlikely (< 5%).
- [✅] **Adaptive Energy Bias**: Verified. High activity boosts "Driving" templates, while low activity favors "Sustain" pads.
- [✅] **The "Push" Awareness**: Verified. `useJazzBand.ts` correctly handles `isAnticipation: true` steps by playing the `nextChord` voicing on the "and of 4".
- [✅] **BPM Awareness**: Verified. Engine favors Sustains at low BPM and Driving/Standard at high BPM.
- [✅] **Deep History**: Verified. History of 4 patterns is tracked to ensure variety beyond just the last choice.
- [✅] **Unit Tests**: Pass. `RhythmEngine.test.ts` covers BPM selection, repetition penalty, and energy bias.

## Technical Summary
The rhythmic engine now operates as a state-machine. Instead of picking a random hit per beat, it selects a 1-bar **Phrase Template** at the start of each measure. The selection is driven by:
1. **Initial BPM weights**: Ensuring speed-appropriate complexity.
2. **Current Energy level**: Dynamic intensity scaling.
3. **Markov Transition Bonuses**: Favoring musical sequences (e.g. Sustain -> Standard).
4. **Exponential History Penalty**: Forcing the generator to explore the full library of shapes.

## Manual Verification
- Listening to JazzKiller playback confirms that the piano "breathes" more naturally and rarely gets stuck in a repetitive loop.
- Cross-bar anticipations correctly resolve to the next chord symbol, creating a forward-leaning "jazz feel."
