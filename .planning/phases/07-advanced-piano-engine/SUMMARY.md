# Phase 7 Summary: Advanced Piano Engine

**Status**: Planned (implementation exists; verification and docs in progress).

## Scope (from REQUIREMENTS.md)

- **REQ-APE-01**: Voice-Leading Engine — stateful Type A/B selection using Taxi Cab (Manhattan) distance.
- **REQ-APE-02**: Chord DNA Model — guide tones (3rd, 7th) and extensions/alterations for rootless voicings.
- **REQ-APE-03**: Register Management (Soprano Anchor) — penalty for voicings above G5.
- **REQ-APE-04**: Tritone Substitution — optional dominant substitution when it improves voice leading.

## Implementation

- **CompingEngine** (`src/core/theory/CompingEngine.ts`): `lastVoicing`, Type A/B candidates, Taxi Cab in `selectBest`, Soprano Anchor penalty (RANGE_LIMIT_TOP = 80), Tritone Sub when dominant and primary score > 15, Bass-Assist (addRoot).
- **ChordDna** (`src/core/theory/ChordDna.ts`): `getChordDna`, `getChordDnaIntervals`, `getChordToneLabelMap`; CompingEngine maps DNA to VOICING_LIBRARY (Major, Minor, Dominant, Altered, HalfDim).
- **useJazzBand**: Uses `compingEngineRef.current.getNextVoicing(targetChord, { addRoot })`; reset on progression/song change to be verified/added per PLAN.md.

## Verification (when complete)

- CompingEngine tests: major voicing, taxi-cab transition (Dm7 → G7), tritone sub handling, bass-assist, Soprano Anchor (topNote ≤ 80).
- Optional: Altered/HalfDim test; explicit tritone-sub path test; CompingEngine reset on progression change.
