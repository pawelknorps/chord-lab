# Plan: Phase 7 – Advanced Piano Engine (Voice Leading + Chord DNA)

**Roadmap**: Phase 7 (STATE.md: Advanced Piano Engine)  
**Goal**: Stateful voice-leading engine with Taxi Cab metric, Chord DNA–driven grips, Soprano Anchor, and optional Tritone Substitution. Implementation exists in CompingEngine + ChordDna; this plan verifies coverage and locks tests/docs.

---

## Frontmatter

```yaml
phase: 7
name: Advanced Piano Engine
waves: 2
dependencies: ["Phase 11: Pro Comping Engine (Grip Dictionary, Phrase Templates, Push, Bass-Assist, Pivot Rule)"]
files_modified:
  - src/core/theory/CompingEngine.ts
  - src/core/theory/ChordDna.ts
  - src/modules/JazzKiller/hooks/useJazzBand.ts
files_created: []
files_reviewed:
  - src/core/theory/CompingEngine.test.ts
```

---

## Phase scope (from REQUIREMENTS.md)

- **REQ-APE-01**: Voice-Leading Engine — stateful selection of Type A/B voicings using Taxi Cab (Manhattan) distance.
- **REQ-APE-02**: Chord DNA Model — guide tones (3rd, 7th) and extensions/alterations for rootless voicings.
- **REQ-APE-03**: Register Management (Soprano Anchor) — penalty for voicings above a top range (e.g. G5).
- **REQ-APE-04**: Tritone Substitution — optional substitution of dominant with tritone sub when it improves voice leading.

---

## Wave 1: Verification and coverage

*Goal: Confirm REQ-APE-01 through REQ-APE-04 are satisfied by existing code and tests.*

### Task 1.1: Map requirements to implementation

- <task id="W1-T1">**REQ-APE-01**  
  Confirm `CompingEngine`: holds `lastVoicing`, generates Type A and B via `generateCandidates`, selects best via `selectBest` using `calculateTaxiCabDistance`.  
  Verification: Code review; existing test "should use taxi-cab metric to find smooth transitions" (Dm7 → G7).</task>

- <task id="W1-T2">**REQ-APE-02**  
  Confirm `ChordDna`: `getChordDna(symbol)` returns `core` (third, fifth), `extension` (hasSeventh, alterationCount), `intervals`/`intervalNames`/`noteNames`. Confirm `CompingEngine.generateCandidates` uses `getChordDna` to choose VOICING_LIBRARY row (Major, Minor, Dominant, Altered, HalfDim).  
  Verification: Code review; optional: add one test in CompingEngine.test.ts that exercises Altered or HalfDim symbol.</task>

- <task id="W1-T3">**REQ-APE-03**  
  Confirm `CompingEngine`: `RANGE_LIMIT_TOP = 80` (G5); in `selectBest`, candidate with `Math.max(...candidate) > RANGE_LIMIT_TOP` receives penalty (+50).  
  Verification: Existing test "should obey the Soprano Anchor and stay below G5".</task>

- <task id="W1-T4">**REQ-APE-04**  
  Confirm `CompingEngine.getNextVoicing`: for dominant chords, when `useTritoneSub` and primary Taxi Cab score > 15, generates tritone-sub candidates and picks sub if score is lower.  
  Verification: Existing test "should apply tritone substitution on large jumps"; optionally strengthen with explicit tritone-sub path assertion.</task>

### Task 1.2: Reset on progression change

- <task id="W1-T5">**Engine reset**  
  In `useJazzBand.ts` (or wherever progression/song changes), ensure `compingEngineRef.current.reset()` is called when the user changes progression or song so the first chord of the new context does not inherit the previous `lastVoicing`.  
  Verification: Grep for `reset()` on CompingEngine; add call at progression/song change if missing.</task>

---

## Wave 2: Tests and documentation

*Goal: Lock behavior with tests and document Phase 7 completion.*

### Task 2.1: CompingEngine tests

- <task id="W2-T1">**Altered / HalfDim coverage**  
  In `CompingEngine.test.ts`, add at least one test that requests a voicing for an altered or half-diminished symbol (e.g. `C7alt`, `Bø7`) and asserts 4-note rootless voicing and top note ≤ 80.</task>

- <task id="W2-T2">**Tritone sub path**  
  Optionally add a test that, from a known previous voicing, requests a dominant where the tritone sub is strictly closer (e.g. setup lastVoicing then G7 vs Db7alt distance), and assert the returned voicing matches the sub when `useTritoneSub: true`.</task>

### Task 2.2: Documentation and STATE

- <task id="W2-T3">**Phase 7 summary**  
  Add or update `.planning/phases/07-advanced-piano-engine/SUMMARY.md` stating that Phase 7 (Advanced Piano Engine) is complete: voice-leading (Taxi Cab), Chord DNA, Soprano Anchor, and Tritone Substitution are implemented in CompingEngine and ChordDna and verified by tests.</task>

- <task id="W2-T4">**STATE.md requirements**  
  Mark REQ-APE-01, REQ-APE-02, REQ-APE-03, REQ-APE-04 as completed in `.planning/STATE.md` once verification passes.</task>

---

## Verification (phase success criteria)

- [ ] **REQ-APE-01**: CompingEngine selects next voicing using Taxi Cab distance; tests confirm smooth ii–V transition.
- [ ] **REQ-APE-02**: Chord DNA drives grip choice (Major, Minor, Dominant, Altered, HalfDim); at least one test uses Altered or HalfDim.
- [ ] **REQ-APE-03**: Soprano Anchor penalty applied; test asserts top note ≤ G5 (80).
- [ ] **REQ-APE-04**: Tritone substitution applied when dominant and primary score > 15; test or code path confirmed.
- [ ] **Reset**: CompingEngine reset on progression/song change so first chord is not biased by previous context.
- [ ] **Docs**: SUMMARY.md and STATE.md updated; REQ-APE-01–04 marked complete.

**Phase goal**: Advanced Piano Engine is verified and documented: stateful voice leading (Taxi Cab), Chord DNA–driven grips, Soprano Anchor, and optional Tritone Substitution are implemented and tested.

---

## Plan check (phase goal and requirements)

- **Phase goal**: "Stateful voice-leading engine with Taxi Cab metric, Chord DNA, Soprano Anchor, Tritone Sub" → Wave 1 (requirement mapping + reset) and Wave 2 (tests + docs) cover it.
- **REQ-APE-01** (Voice-Leading Engine): Task 1.1; CompingEngine + existing test.
- **REQ-APE-02** (Chord DNA Model): Task 1.2; ChordDna + CompingEngine mapping; optional Altered/HalfDim test.
- **REQ-APE-03** (Register / Soprano Anchor): Task 1.3; RANGE_LIMIT_TOP + existing test.
- **REQ-APE-04** (Tritone Substitution): Task 1.4; getNextVoicing branch + existing/optional test.
- **Reset**: Task 1.5 (useJazzBand) ensures clean state on progression change.
