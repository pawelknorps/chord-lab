---
wave: 1
dependencies: [integration-03-rhythm-section]
files_to_modify:
  - src/modules/RhythmArchitect/components/SyncopationBuilder.tsx
  - src/modules/RhythmArchitect/components/PolyrhythmGenerator.tsx
  - src/modules/RhythmArchitect/components/SubdivisionLab.tsx
estimated_time: 6-8 hours
---

# Plan: Rhythm Section Gamification (SYNC-02, SYNC-03, POLY-02) [✓ Complete]

## Context

The Rhythm Section has been redesigned and stabilized. Now we need to add educational/training value by implementing interactive challenges.

## Goal

Implement "Groove Dictation" for Syncopation and "Tap Challenge" for Polyrhythm.

## Tasks

### Task 1: Syncopation "Groove Dictation" (SYNC-02, SYNC-03)

<task>
<description>
Create an interactive mode where users hear a pattern and must recreate it on the grid.
</description>

<steps>

1. Update `SyncopationBuilder.tsx` to support `Build` and `Dictation` modes.
2. Implement Difficulty Tiers:
   * **Easy**: 4 steps (1 beat), only Accents and Rests.
   * **Medium**: 8 steps (2 beats), includes Ghost notes.
   * **Hard**: 16 steps (4 beats), full pattern.
3. Game Flow:
   * Generate `targetPattern`.
   * Add a "Hear Target" button that plays `targetPattern` using `MetronomeEngine`.
   * Add a "Check Answer" button that compares `pattern` with `targetPattern`.
   * Provide visual feedback (green/red highlights) on completion.
4. Standardize UI with the Swiss design (HUD for score/streak).

</steps>

<verification>

* [x] User can hear a random target pattern.
* [x] User can toggle difficulty.
* [x] Correct answer awards points (mock global XP).

</verification>
</task>

### Task 2: Polyrhythm "Tap Challenge" (POLY-02)

<task>
<description>
Add an interactive mode where the user must tap the "Inner" or "Outer" rhythm against the engine.
</description>

<steps>

1. Modify `PolyrhythmGenerator.tsx`.
2. Add a "Tap Zone" or listen to keydown (e.g., Space/J/K).
3. Calculate Tap Accuracy:
   * Measure distance between tap time and closest engine hit time.
   * Calculate a score (Perfect/Good/Miss).
4. Update visualizer to show "Current Tap Performance" (e.g., flash the orbit).

</steps>

<verification>

* [x] User can tap along.
* [x] Feedback is displayed in real-time.

</verification>
</task>

### Task 3: Interactive Subdivision Pyramid (SUB-01)

<task>
<description>
Make the subdivision pyramid clickable to toggle audibility of specific layers.
</description>

<steps>

1. Refactor `SubdivisionLab.tsx` (if it exists, otherwise create it as per roadmap).
2. Ensure each row (2, 3, 4, 5, 6...) can be muted/unmuted individually.
3. Maintain perfect synchronization across all layers.

</steps>

<verification>

* [x] Clicked rows toggle sound.
* [x] Visual indicator matches mute state.

</verification>
</task>

## Success Criteria

* [x] Both Syncopation and Polyrhythm have functional "Challenge" modes.
* [x] Difficulty tiers are implemented for Syncopation.
* [x] Subdivision Lab is interactive.
