---
phase: 10
name: State-Machine Rhythmic Phrasing
waves: 3
dependencies: ["Phase 8: Advanced Rhythm Engine"]
files_modified: [
  "src/core/theory/RhythmEngine.ts",
  "src/modules/JazzKiller/hooks/useJazzBand.ts"
]
files_created: [
  "src/core/theory/RhythmEngine.test.ts"
]
---

# Phase 10 Plan: State-Machine Rhythmic Phrasing

Focus: Turn the rhythmic generator into a "state machine" that phrases like a musician by avoiding loops, favoring smooth transitions, and anticipating chord changes (the "Push").

## Success Criteria
- **Repetition Penalty**: Successfully reduces consecutive same-pattern probability to near-zero.
- **Markov Transitions**: Patterns follow a logical flow (e.g., Sustain -> Rhythmical -> Anticipated).
- **The "Push"**: Anticipated patterns (on the "and of 4") play the *next* bar's chord early.
- **Verification**: Unit tests confirm weights are modified correctly based on engine state.

---

## Wave 1: Pattern History & Transition Weights

*Goal: Make the engine aware of its recent past to drive varied phrasing.*

- <task id="W1-T1">**Extend Pattern History**  
  Update `RhythmEngine` to store `history: RhythmType[]` (last 4 patterns) instead of just `lastRhythmType`.  
  Add a `transitionMatrix` that defines bonus Weights for desirable sequences (e.g., `Charleston` -> `RedGarland` +20%).</task>

- <task id="W1-T2">**Exponential Repetition Penalty**  
  Modify `applyRepetitionPenalty` to check the full history.  
  - 1 repeat: 0.2x penalty.
  - 2+ repeats: 0.05x penalty (force a change).
  - Special case: `Pedal` is allowed up to 2 times (0.8x penalty for first repeat).</task>

- <task id="W1-T3">**Markov Selection Logic**  
  Implement `applyTransitionBonuses(weights, lastType)` to boost types that create good musical flow based on the `transitionMatrix`.</task>

---

## Wave 2: Next-Chord Awareness (The "Push")

*Goal: Implement the "and of 4" anticipation where the engine plays the next chord early.*

- <task id="W2-T1">**Update RhythmEngine API**  
  Update `getRhythmPattern(bpm, energy, currentChord, nextChord)`:  
  - Return an object `{ pattern: RhythmPattern, shouldAnticipate: boolean }`.
  - If type is `Anticipation`, set `shouldAnticipate: true`.</task>

- <task id="W2-T2">**Wire "Push" Logic into useJazzBand**  
  In the `Tone.Loop` (at `beat === 0`):
  - Pass the current and next chords to `getRhythmEngine.getRhythmPattern`.
  - Store `nextChordVoicing` if `shouldAnticipate` is true.
  - When the anticipation offset triggers (e.g., `beat === 3` and pulse is 2), play the *next* chord's voicing instead of the current one.</task>

---

## Wave 3: Testing & Verification

*Goal: Ensure the engine behaves musically and correctly.*

- <task id="W3-T1">**RhythmEngine Unit Tests**  
  Create `src/core/theory/RhythmEngine.test.ts`:
  - Verify that `lastRhythmType` is penalized.
  - Verify that `Pedal` is less penalized.
  - Verify that `Anticipation` returns the `shouldAnticipate` flag.</task>

- <task id="W3-T2">**Human-in-the-loop Audit**  
  Listen to the `JazzKiller` playback and verify that patterns feel varied and the "Push" happens on bar lines when an anticipation pattern is selected.</task>

---

## Verification Plan

- [ ] `RhythmEngine` tests pass (Vitest).
- [ ] `lastRhythmType` is correctly updated after each selection.
- [ ] "And of 4" hits play the next chord's voicing in `JazzKiller`.
- [ ] Repetition of a non-pedal pattern happens < 5% of the time in a 32-bar sequence.
