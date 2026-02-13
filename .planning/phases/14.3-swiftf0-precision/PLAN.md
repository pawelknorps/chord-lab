---
phase: 14.3
name: SwiftF0 SOTA Precision (Flicker-Free, Semitone-Stable)
waves: 3
dependencies:
  - Phase 14.1: SwiftF0 SOTA 2026 Integration (SwiftF0Worker, CrepeStabilizer, useITMPitchStore)
  - Phase 14.2: SwiftF0 Speed Optimization
  - Phase 9: Mic Algorithm Upgrade (frequencyToNote, instrumentProfiles)
milestone: .planning/milestones/swiftf0-precision/
files_modified:
  - src/core/audio/swiftF0Inference.ts
  - src/core/audio/CrepeStabilizer.ts
  - src/core/audio/instrumentProfiles.ts
  - src/core/audio/SwiftF0Worker.ts
  - src/core/audio/frequencyToNote.ts
files_created: []
---

# Phase 14.3: SwiftF0 SOTA Precision

**Focus**: Achieve SOTA precision for SwiftF0—Local Expected Value (no argmax-only), median filter, hysteresis (60¢, 3-frame note lock), chromatic + cents, tuner bar. Eliminate flickering and semitone jitter.

**Milestone**: `.planning/milestones/swiftf0-precision/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

**Success Criteria**:
- LEV used for pitch (no argmax-only path); sub-bin (cent-level) accuracy (REQ-SF0-P01).
- Median filter 5–7 frames active; windowSize honored per profile (REQ-SF0-P02).
- Hysteresis 60¢ and 3-frame stability reference in at least one profile; CrepeStabilizer uses them (REQ-SF0-P03).
- Chromatic note + cents in frequencyToNote; consumers can read cents (REQ-SF0-P04).
- At least one tuner bar (cents) in the app (REQ-SF0-P05).
- All smoothing post-inference in SwiftF0Worker; SAB receives stabilized pitch (REQ-SF0-P06).

---

## Wave 1: Verify LEV and Temporal Stack

**Goal**: Confirm Local Expected Value and temporal smoothing (median + hysteresis) are correctly implemented and aligned with the spec. Fix any gaps.

| Task ID | Requirement | Description |
|---------|-------------|-------------|
| SF0-P01 | REQ-SF0-P01 | **LEV**: Verify `swiftF0Inference.classificationToPitch` uses 9-bin weighted average in log space: \(f = 2^{\sum p_i \log_2(f_i)}\) over window [peak−4, peak+4]; no code path returns only bin center frequency. Add unit test or comment documenting formula. |
| SF0-P02 | REQ-SF0-P02 | **Median**: Confirm CrepeStabilizer applies running median; window size from profile (windowSize 5 or 7). Verify windowSize is read in `process()` (effectiveWindow). |
| SF0-P03 | REQ-SF0-P03 | **Hysteresis**: Confirm CrepeStabilizer uses profile.hysteresisCents and profile.stabilityThreshold. Ensure at least one profile (e.g. general or voice) uses 60¢; optionally set stabilityThreshold to 3 for snappier note change per spec. |
| SF0-P04 | REQ-SF0-P06 | **Worker**: Confirm SwiftF0Worker runs CrepeStabilizer post-inference and writes stabilized pitch to SAB (pitchView[0]); no raw argmax-only pitch path when useStabilizer is true (default). |

**Deliverables**: Checklist signed off in STATE.md; any code/docs fixes applied.

---

## Wave 2: Chromatic Mapping and Cents API

**Goal**: Ensure chromatic note and cents are available to all consumers; no natural-only rounding in display path.

| Task ID | Requirement | Description |
|---------|-------------|-------------|
| SF0-P05 | REQ-SF0-P04 | **Mapping**: Verify `frequencyToNote` uses n = 12·log2(f/440)+69, note = round(n)+69 (MIDI), centsDeviation = (n − round(n))×100. Confirm chromatic note names (A, A#, B, C, C#) via Tonal.js. |
| SF0-P06 | REQ-SF0-P04 | **Consumers**: Audit useITMPitchStore (and any pitch→note display path); ensure they use frequencyToNote or equivalent and expose cents where needed. Fix any path that rounds to natural-only. |

**Deliverables**: All pitch-to-note display paths use chromatic mapping; cents available to UI.

---

## Wave 3: Tuner Bar (Cents) UI

**Goal**: Add or wire a tuner bar that shows cents offset so vibrato is visible and flicker is reduced perceptually.

| Task ID | Requirement | Description |
|---------|-------------|-------------|
| SF0-P07 | REQ-SF0-P05 | **Component**: Implement or reuse a tuner bar component: input = frequency or NoteInfo (centsDeviation); display = bar or gauge for cents (e.g. −50 to +50) from nearest chromatic note. |
| SF0-P08 | REQ-SF0-P05 | **Integration**: Wire tuner bar to at least one pitch-consuming screen (e.g. ITM HUD, JazzKiller Mixer/HUD, Innovative Exercises IntonationHeatmapPanel or shared component). |

**Deliverables**: User can see cents offset (tuner bar or numeric) where pitch is displayed; REQ-SF0-P05 satisfied.

---

## Context (Existing Assets)

- **swiftF0Inference.ts**: Already has 9-bin LEV in classificationToPitch (lines 78–92); regression head refinement. Verify formula matches spec.
- **CrepeStabilizer.ts**: Median (window 5 or 7), hysteresis (profile.hysteresisCents), stability timer (profile.stabilityThreshold). Voice profile: 60¢, 5 frames—consider 3 frames.
- **instrumentProfiles.ts**: hysteresisCents, stabilityThreshold, windowSize per profile.
- **SwiftF0Worker.ts**: useStabilizer true by default; CrepeStabilizer runs in worker; SAB receives stabilized pitch.
- **frequencyToNote.ts**: Returns NoteInfo with noteName, centsDeviation, isPerfectIntonation; uses chromatic MIDI.

## Verification

- [ ] No argmax-only pitch path in production (LEV used).
- [ ] Median filter and hysteresis active; 60¢ and 3-frame (or 5-frame) reference in at least one profile.
- [ ] Chromatic note + cents in frequencyToNote; consumers use it.
- [ ] Tuner bar (cents) visible in at least one UI.
- [ ] Milestone STATE.md and ROADMAP.md updated when complete.
