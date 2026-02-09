# Roadmap: Advanced Ear Training

## Milestone 1: Theory Foundations & Secondary Dominants

Goal: Establish the theory engine corrections and implement the first advanced level.

### Phase 1: Theory Engine & Spelling [✓ Complete]

- Goal: Fix enharmonic spelling logic and prepare background theory utils.
- Completed: 2026-02-09
- Requirements: THEORY-04, INTEG-01
- Success Criteria:
  - Centralized enharmonic utility returns correct spelling for all keys.
  - New level slots visible in the UI (placeholder state).

### Phase 1.5: Theory Harmonization [✓ Complete]

- Goal: Make the unified theory engine the base rule for all modules.
- Completed: 2026-02-09
- Requirements: THEORY-04
- Success Criteria:
  - `src/core/theory/index.ts` refactored to use `theoryEngine.ts`.
  - All modules using `midiToNoteName` or similar now follow the unified jazz rules.

### Phase 2: Secondary Dominants [✓ Complete]

- Goal: Implement full ear training loop for secondary dominants.
- Completed: 2026-02-09
- Requirements: THEORY-01, UI-01, UI-04
- Success Criteria:
  - User can hear a progression and identify the secondary dominant.
  - MIDI keyboard input correctly identifies the chord.

## Milestone 2: Modal Interchange & USTs

Goal: Complete the set of advanced functional exercises.

### Phase 3: Modal Interchange [✓ Complete]

- Goal: Identify chords borrowed from parallel modes.
- Completed: 2026-02-09
- Requirements: THEORY-02, UI-02
- Success Criteria:
  - Recognition of iv, bVI, bVII, etc., in a functional context.

### Phase 4: Upper Structure Triads

- Goal: Advanced identification of compound structures.
- Requirements: THEORY-03, UI-03
- Success Criteria:
  - Identification of USTs (e.g., II/I dominant) by ear.

---

## State

- **Current Phase**: 4
- **Overall Progress**: 90%
