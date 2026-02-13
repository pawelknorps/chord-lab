# Phase 11: Advanced Rhythm Engine

This phase upgrades the piano comping rhythm to be BPM-aware and stylistically dynamic.

## Objectives
- Implement rhythmic density control based on BPM zones.
- Implement dynamic articulation (staccato at high speeds, legato at low speeds).
- Add specific jazz rhythm patterns: Charleston, RedGarland, Pedal, Anticipation, SparseStab.
- Bias rhythmic selection based on the "Energy" parameter.

## Requirements
- REQ-ARE-01: BPM-Aware Pattern Selection
- REQ-ARE-02: Dynamic Articulation Control
- REQ-ARE-03: Energy-Driven Rhythmic Bias
- REQ-ARE-04: Implementation Architecture

## Proposed Implementation Plan

### Step 1: Core Engine Implementation
- Create `src/core/theory/RhythmEngine.ts`.
- Implement `patterns` record with offsets for each type.
- Implement `getWeightsByBPM` and `applyEnergyBias`.
- Implement `calculateArticulation`.
- Implement `weightedRandom` for selection.

### Step 2: Integration with JazzKiller
- Update `useJazzBand.ts` to use `RhythmEngine`.
- Maintain state (selected pattern per measure or phrase) via the engine.
- Replace the current hardcoded measure patterns with the dynamic `RhythmEngine` selection.

### Step 3: Verification
- Verify that at >180 BPM, the engine selects sparse patterns and 16n articulation.
- Verify that at <110 BPM, the engine selects sustained "Pedal" or busier patterns.
- Verify energy biasing (High energy = more anticipation).
