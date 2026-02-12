---
phase: 12.1-bass-variation
name: Bass Rhythm Variation
waves:
  - 1: Variator Implementation
  - 2: Audio Engine Refactor
  - 3: Verification
dependencies:
  - Phase 12 (Walking Bass Engine)
must_haves:
  artifacts:
    - path: src/core/theory/BassRhythmVariator.ts
      provides: BassRhythmVariator class
    - path: src/core/theory/WalkingBassEngine.ts
      provides: Integrated variation logic
    - path: src/modules/JazzKiller/hooks/useJazzBand.ts
      provides: Refactored bass playback
---

# Phase 12.1: Bass Rhythm Variation Plan

Organic bass variations (Skips, Rakes) to avoid robotic 4-note loops.

## Wave 1: Variator Implementation

<task type="execute" id="1.1">
Implement `src/core/theory/BassRhythmVariator.ts`.
Use the logic provided by the user:
- `applyVariations(line, barIndex)`
- Variations: "The Skip" (15%), "The Rake" (5%).
- Returns `BassEvent[]`.
</task>

<task type="execute" id="1.2">
Update `src/core/theory/WalkingBassEngine.ts`.
Add `generateVariedLine(currentChord, nextChord, barIndex)` that uses `BassRhythmVariator`.
Or just expose `BassRhythmVariator` and have the consumer use it.
The user's code for `BassRhythmVariator` takes a `line: number[]`, which is exactly what `WalkingBassEngine.generateWalkingLine` returns.
</task>

<task type="execute" id="1.3">
Update `src/core/theory/index.ts` to export `BassRhythmVariator` and any new types.
</task>

## Wave 2: Audio Engine Refactor

<task type="execute" id="2.1">
Update `src/modules/JazzKiller/hooks/useJazzBand.ts`.
Refactor the bass loop to handle `BassEvent[]`.
- Instead of playing a single note on every beat, schedule the events returned by `BassRhythmVariator`.
- Implement \"Sample Switch\" logic: if `isGhost`, use a very short release (0.05s) on the sampler.
- Handle timing for sub-beat variations (e.g., \"0:1:2\" for triplet-grid or \"and\" of 2).
</task>

## Wave 3: Verification

<task type="tdd" id="3.1">
Update `src/core/theory/WalkingBassEngine.test.ts` or create `src/core/theory/BassRhythmVariator.test.ts`.
Verify that variations are generated correctly and MIDI ranges are respected.
</task>

<task type="execute" id="3.2">
Verify in UI that the bass line has occasional rhythmic variation.
Success Criteria: Every bar has a small chance (15-25%) to mutate from standard walking to a rhythmic variation.
</task>
