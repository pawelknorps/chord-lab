# Roadmap: Adaptive Ear Training with MIDI-Supported AI

## Phase 1: MIDI Input & Performance Logging
*Goal: IntervalsLevel and ChordQualitiesLevel accept MIDI; basic performance store records results.*

- [ ] **Step 1**: Add `useMidi` to IntervalsLevel; on MIDI note, compute interval from root, compare to correct, grade and show feedback (reuse MelodyStepsLevel pattern).
- [ ] **Step 2**: Add `useMidi` to ChordQualitiesLevel; on 3+ MIDI notes, derive chord quality (Tonal.js or existing logic), compare to correct, grade and show feedback.
- [ ] **Step 3**: Create `useEarPerformanceStore` (or extend useFunctionalEarTrainingStore): record per-level, per-interval/quality success/failure and diagnosis (errorType, distance, isCommonConfusion).
- [ ] **Step 4**: Wire IntervalsLevel and ChordQualitiesLevel to log each attempt (correct/incorrect + diagnosis when wrong) into the performance store.
- **Success Criteria**: User can play answers on keyboard in Intervals and ChordQualities; performance store accumulates session data.

## Phase 2: Adaptive Curriculum Logic
*Goal: Repeat on struggle; harder when ready.*

- [ ] **Step 5**: Implement "repeat on struggle": when N consecutive mistakes (or session mistake count for same type > threshold), prioritize repeating similar items before new ones.
- [ ] **Step 6**: Implement "harder when ready": when streak ≥ M and success rate > threshold, expand pool (e.g. add rarer intervals, harder distractors).
- [ ] **Step 7**: Add configurable thresholds (N, M, success rate) to store or config.
- [ ] **Step 8**: Integrate adaptive logic into challenge loading (loadNewChallenge) so next challenge is influenced by performance.
- **Success Criteria**: After 3 wrong in a row, next challenges repeat similar intervals; after 3 correct streak, harder variants appear.

## Phase 3: AI Focus-Area Suggestions
*Goal: Nano suggests where to focus based on error profile.*

- [ ] **Step 9**: Implement `getFocusAreaSuggestion(profile)`: aggregate profile from performance store, pass to askNano; prompt for 1–2 sentence focus suggestion.
- [ ] **Step 10**: Add "Focus area" UI (panel, toast, or HUD); show suggestion when available (e.g. after 5+ attempts, or on "Get suggestion" button).
- [ ] **Step 11**: Optional: filter or bias challenge pool toward weak areas when user opts into "Focus mode."
- **Success Criteria**: After session with many P4/tritone confusions, AI suggests "Focus on P4 vs Tritone"; displayed without blocking exercise.

## Phase 4: Extend to More Levels (Optional)
*Goal: MIDI and adaptive logic in BassLevel, HarmonicContextLevel where applicable.*

- [ ] **Step 12**: Add MIDI input to BassLevel (play root note or bass note as answer).
- [ ] **Step 13**: Add MIDI input to HarmonicContextLevel if feasible (e.g. play chord tones).
- [ ] **Step 14**: Extend performance store and adaptive logic for new level types.
- **Success Criteria**: Additional levels accept MIDI and benefit from adaptive curriculum.

## Dependencies
- Phase 7 (Ear Trainer Feedback Loop) complete: earDiagnosis, getEarHint, nanoHelpers.
- MidiContext, useMidi available app-wide.
- useFunctionalEarTrainingStore or equivalent for level state.
