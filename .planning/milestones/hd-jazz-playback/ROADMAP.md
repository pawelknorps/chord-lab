# HD Jazz Playback - Roadmap

## Overview

Refine HD jazz playback so the double bass plays **primarily quarter notes**, with rhythmic variations **rare** and **always tied to band tension intensity**.

**Timeline**: 1 main phase (+ optional polish)  
**Target**: Clear, maintainable bass rhythm rules in `useJazzBand.ts`

---

## Phase 1: Bass rhythm rules (quarter-note default, tension gate, rarity)

**Goal**: Implement and enforce quarter-note default with tension-gated, rare variations.

### Tasks
- [ ] **BASS-DEFAULT**: Set default bass rhythm pattern to `[0, 1, 2, 3]` for every bar unless variation is explicitly allowed.
- [ ] **BASS-THRESHOLD**: Define band tension intensity (from existing `currentTension` + `activityLevelSignal`) and a single threshold above which variations are allowed.
- [ ] **BASS-RARITY**: When above threshold, choose a non–quarter-note pattern with low probability (e.g. ≤ 20–30%); otherwise keep `[0, 1, 2, 3]`.
- [ ] **BASS-CONSTANTS**: Extract magic numbers into named constants (e.g. `BASS_QUARTER_PATTERN`, `BASS_TENSION_THRESHOLD`, `BASS_VARIATION_PROBABILITY`) in one place.
- [ ] **BASS-VERIFY**: Manually verify with 2–3 tunes that bass is mostly quarter notes and variations only in high-tension sections.

### Requirements Addressed
- BASS-01: Quarter-note default
- BASS-02: Tension-gated variations
- BASS-03: Variations are rare
- BASS-04: Single place for bass rhythm rules

### Success Criteria
- Default pattern is `[0, 1, 2, 3]`; variations only when band tension intensity > threshold.
- Variation probability when above threshold is low (e.g. ≤ 30%).
- One clear code location and named constants for future tuning.

---

## Phase 2: Polish and tuning (optional)

**Goal**: Listening pass and optional UX.

### Tasks
- [ ] **TUNING**: Adjust threshold and probability based on listening tests.
- [ ] **DOCS**: Short comment in `useJazzBand.ts` summarizing the rule: “Quarter notes by default; variations rare and tension-gated.”
- [ ] **(v2)** Optional: Add UI control for “bass variation frequency” (BASS-05).

### Success Criteria
- No regressions; bass feel matches “walking bass by default, color when the band burns.”

---

## State Tracking

- **Current Phase**: Phase 0 (Planning)
- **Overall Progress**: 0%
- **Next Milestone**: Phase 1 – Bass rhythm rules

---

## Dependencies

### Internal
- `useJazzBand.ts` – bass scheduling and `bassRhythmPatternRef`
- `JazzTheoryService.getNextWalkingBassNote` – unchanged
- `jazzSignals` – `activityLevelSignal`; tension from loop (e.g. `currentTension`)

### External
- Tone.js (existing)
- No new packages

---

## Success Metrics

- **Correctness**: Bass uses quarter-note pattern in ≥ ~90% of bars in normal/low-tension contexts.
- **Clarity**: One place and named constants for bass rhythm rules.
- **Listening**: Variations only when band feels clearly intense; otherwise steady walking bass.
