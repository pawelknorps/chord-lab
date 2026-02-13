# Research: Phase 7 – Advanced Piano Engine (Voice Leading + Chord DNA)

## What do we need to know to PLAN this phase well?

### 1. Voice-Leading Engine (REQ-APE-01)

- **Stateful selection**: The engine must remember the *last* voicing and choose the *next* voicing (Type A or B) to minimize movement.
- **Taxi Cab (Manhattan) distance**: Score = sum over voices of `|current[i] - next[i]|` after sorting both voicings by pitch. Lower score = smoother transition.
- **Location**: `CompingEngine` in `src/core/theory/CompingEngine.ts` already implements `lastVoicing`, `generateCandidates` (Type A/B), `selectBest` using `calculateTaxiCabDistance`.
- **Integration**: `useJazzBand.ts` holds a `compingEngineRef` and calls `getNextVoicing(targetChord, { addRoot })` on each chord/anticipation hit.

### 2. Chord DNA Model (REQ-APE-02)

- **Requirement**: Parse chord symbols into guide tones (3rd, 7th) and extensions/alterations (9, 13, b9, #9, b13) suitable for rootless jazz voicings.
- **Location**: `ChordDna.ts` exposes `getChordDna(symbol)` → `ChordDnaResult` with `core` (third, fifth), `extension` (hasSeventh, alterationCount), `intervals`, `intervalNames`, `noteNames`. `getChordDnaIntervals` and `getChordToneLabelMap` support voicing engines and UI.
- **Guide tones**: 3rd and 7th are implied by `core.third` and presence of 7 in `intervalNames`; extensions (9, 11, 13, alt) are in the interval set. VOICING_LIBRARY grips are defined as semitone offsets from root (3, 7, 9, 13, etc.) and mapped via Chord DNA quality (Major, Minor, Dominant, Altered, HalfDim).

### 3. Register Management / Soprano Anchor (REQ-APE-03)

- **Requirement**: Penalize voicings whose top note exceeds a defined ceiling (e.g. G5) to prevent octaves drifting up over time.
- **Location**: `CompingEngine` uses `RANGE_LIMIT_TOP = 80` (G5). In `selectBest`, if `Math.max(...candidate) > RANGE_LIMIT_TOP`, add a penalty (e.g. +50) to the Taxi Cab score. `normalizeOctave` keeps voicings in the "pocket" (POCKET_MIN=48, POCKET_MAX=60) for initial placement; the anchor prevents winning candidates from creeping above G5.

### 4. Tritone Substitution (REQ-APE-04)

- **Requirement**: Optionally substitute a dominant chord with its tritone substitute (e.g. G7 → Db7) when it yields smoother voice leading.
- **Location**: In `getNextVoicing`, when the chord is dominant and `useTritoneSub` is true and primary Taxi Cab score > 15, the engine generates candidates for the tritone sub (root + 6 semitones, e.g. G7 → Db7alt), scores them with Taxi Cab, and picks the sub if its score is lower than the primary. `addRoot` then prepends (subRoot - 12) when bass-assist is on.

### 5. Dependencies and Call Sites

- **CompingEngine** depends on `@tonaljs/note`, `@tonaljs/chord`, and `getChordDna` from `ChordDna.ts`.
- **useJazzBand**: Creates `new CompingEngine()`, calls `getNextVoicing(targetChord, { addRoot: bassMutedSignal.value })`; resets engine when appropriate (e.g. on progression change) if needed.
- **ChordDna** is used by JazzTheoryService, Note Waterfall, Chord Lab detection, and scan scripts; any change to DNA shape must remain backward compatible.

### 6. Tests and Verification

- **CompingEngine.test.ts**: Covers major voicing shape, taxi-cab transition (Dm7 → G7), tritone-sub handling (Dbmaj7 → G7), bass-assist (addRoot), and Soprano Anchor (topNote ≤ 80).
- **ChordDna**: Covered indirectly via CompingEngine and by `scanIrealChords.ts` / chord detection tests. No dedicated ChordDna.test.ts in the initial scan; optional to add for edge symbols.

### 7. Optional Refinements (post-verification)

- **Configurable Soprano Anchor**: Expose `RANGE_LIMIT_TOP` (e.g. G5) as an option or constant in one place for tuning.
- **ChordDna edge cases**: Ensure symbols like C7#9, C7b9, C7alt, Cø, Cm7b5, Cdim7 all map to the correct VOICING_LIBRARY row (Altered, HalfDim, etc.); document or test any missing iReal symbols.
- **Reset on progression change**: Confirm `compingEngineRef.current.reset()` is called when the user changes the progression so the first chord of the new progression does not inherit the previous `lastVoicing`.

---

## Summary

- **Voice leading**: CompingEngine already uses stateful Type A/B selection and Taxi Cab distance.
- **Chord DNA**: ChordDna provides core + extension; CompingEngine maps DNA to VOICING_LIBRARY (Major, Minor, Dominant, Altered, HalfDim).
- **Soprano Anchor**: RANGE_LIMIT_TOP = 80 with penalty in selectBest; normalizeOctave keeps pocket C3–C4.
- **Tritone Sub**: Implemented for dominants when primary score > 15; optional `useTritoneSub` flag.
- **Phase 7 plan** should verify REQ-APE-01–04 against this implementation, lock tests/docs, and optionally add config or ChordDna coverage.
