# SwiftF0 SOTA Precision – Roadmap

## Phase 1: Verify LEV and Temporal Stack

**Goal**: Confirm Local Expected Value and temporal smoothing (median + hysteresis) are correctly implemented and aligned with the spec.

- **Tasks**:
  - [ ] **LEV**: Verify swiftF0Inference.classificationToPitch uses 9-bin weighted average in log space; no argmax-only path (REQ-SF0-P01).
  - [ ] **Median**: Confirm CrepeStabilizer median window (5 or 7) and that windowSize is honored per profile (REQ-SF0-P02).
  - [ ] **Hysteresis**: Confirm hysteresisCents (e.g. 60 for voice/general) and stabilityThreshold (e.g. 3) in instrumentProfiles; CrepeStabilizer uses them (REQ-SF0-P03).
  - [ ] **Worker**: Confirm all smoothing runs in SwiftF0Worker post-inference; SAB receives stabilized pitch (REQ-SF0-P06).
- **Success**: Checklist signed off; any gaps documented and fixed.

## Phase 2: Chromatic Mapping and Cents API

**Goal**: Ensure chromatic note and cents are available to all consumers.

- **Tasks**:
  - [ ] **Mapping**: Verify frequencyToNote uses n = 12·log2(f/440)+69 and exposes centsDeviation (REQ-SF0-P04).
  - [ ] **Consumers**: Ensure useITMPitchStore (or equivalent) exposes note + cents where needed; no natural-only rounding in display path.
- **Success**: All pitch-to-note display paths use chromatic mapping and can read cents.

## Phase 3: Tuner Bar (Cents) UI

**Goal**: Add or wire a tuner bar that shows cents offset so vibrato is visible and flicker is reduced perceptually.

- **Tasks**:
  - [ ] **Component**: Implement or reuse a tuner bar component that shows cents (e.g. −50 to +50) from the nearest chromatic note (REQ-SF0-P05).
  - [ ] **Integration**: Wire to at least one pitch-consuming screen (ITM, JazzKiller, Innovative Exercises, or shared HUD).
- **Success**: User can see cents offset (tuner bar or numeric) where pitch is displayed.

## Dependencies

- SwiftF0Worker, swiftF0Inference, CrepeStabilizer, instrumentProfiles, frequencyToNote, useITMPitchStore (Phases 14.1, 14.2, 9).

## Verification

- [ ] No argmax-only pitch path in production.
- [ ] Median filter and hysteresis active; 60¢ / 3-frame reference in at least one profile.
- [ ] Chromatic note + cents in frequencyToNote; tuner bar visible in at least one UI.
