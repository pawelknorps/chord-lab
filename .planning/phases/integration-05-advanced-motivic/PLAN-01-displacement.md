---
wave: 1
dependencies: [integration-04-rhythm-gamification]
files_to_modify:
  - src/modules/RhythmArchitect/components/MotivicDisplacement.tsx
  - src/modules/RhythmArchitect/components/RhythmExercises.tsx
estimated_time: 4-6 hours
---

# Plan: Advanced Motivic & Harmonic Tools (MOT-01, MOT-02)

## Context

The basic rhythm tools are now gamified and redesigned. We need to tackle "Higher Order" rhythmic concepts like Motivic Displacement and Integration with Harmony.

## Goal

Modernize the Motivic Displacement tool and integrate it with the interactive piano for "Melodic Displacement".

## Tasks

### Task 1: Motivic Displacement Refactor (MOT-01)

Update MotivicDisplacement.tsx to use the Swiss design system and support melodic motives.

**Steps:**

1. Apply `var(--bg-panel)` and `var(--border-subtle)` to the container.
2. Implement "Melodic Mode":
   * Allow users to assign a pitch to each active step via the `InteractivePiano`.
   * Store pattern as `Array<{ active: boolean, pitch: string | null }>`.
3. Add Displacement controls:
   * Shift by steps (current index rotation).
   * Shift by duration (if we decide to support 8ths vs 16ths grid later, but 16ths is good for now).
4. Add "Permutation" logic:
   * Reverse (Retrograde).
   * Invert (if melodic).

**Verification:**

* [x] Patterns can be shifted without audio glitching.
* [x] UI matches SyncopationBuilder/PolyrhythmGenerator aesthetic.

### Task 2: Rhythm Arena (Exercises) Refresh (MOT-02)

Polish RhythmExercises.tsx to ensure it doesn't feel redundant and uses the new engines.

**Steps:**

1. Update `RhythmExercises.tsx` UI to uses the new glass-morphism style and consistent padding/border tokens.
2. Ensure it uses the `PyramidEngine` for subdivision questions if appropriate (or just unify the engines).
3. Add a "Mastery" streak visual effect.

**Verification:**

* [x] No breakage in XP/Streak tracking.
* [x] UI is responsive and premium.

## Success Criteria

* [x] Motivic Displacement supports melodic motives.
* [x] Rhythm Section components have 100% design consistency.
