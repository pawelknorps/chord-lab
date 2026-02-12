# Professional-Grade Harmonic Analysis – Roadmap

## Phase 1: Tonality Segmentation (Waves 1–2)

- **Wave 1**: Key representation, Fit cost, Transition cost (REQ-HAT-01, REQ-HAT-02, REQ-HAT-03).
- **Wave 2**: Viterbi implementation, segment list API (REQ-HAT-04, REQ-HAT-05).
- **Deliverable**: `TonalitySegmentationEngine` (or equivalent) that takes chord sequence and returns key-per-slot and segment list.

## Phase 2: Functional DNA Mapping (Wave 3)

- **Wave 3**: Jazz cliché dictionary, Chord DNA + context → Roman numeral, constant-structure handling (REQ-HAT-06, REQ-HAT-07, REQ-HAT-08).
- **Deliverable**: `FunctionalLabelingEngine` that takes chord sequence + segments and returns Roman numerals (and optional concept types) per chord.

## Phase 3: Pipeline and JazzKiller Integration (Wave 4)

- **Wave 4**: Preprocessing reuse, `analyzeHarmony()` API, refactor JazzKiller overlay data source (REQ-HAT-09, REQ-HAT-10, REQ-HAT-11).
- **Deliverable**: Single analysis entry point; LeadSheet/AnalysisOverlay consume new pipeline; verification on Blue Bossa, ATTYA, one constant-structure tune.

## Phase 4 (Optional): Live Harmonic Grounding (Wave 5)

- **Wave 5**: Conflict Resolver, Pedal Point Detection, Live Grounding API (REQ-HAT-12, REQ-HAT-13, REQ-HAT-14).
- **Deliverable**: Optional live layer that annotates or overrides analysis using SwiftF0 stream; UI toggle or feedback text.

## Dependencies

- **ChordDna**, **functionalRules**, **ConceptAnalyzer** (existing).
- **JazzKiller**: LeadSheet, AnalysisOverlay, song load/analyze flow.
- **SwiftF0 / useITMPitchStore** (for Phase 4 only).

## Success Criteria (Milestone)

- Key center segments and Roman numerals reflect context (e.g. Blue Bossa Cm7 = i in Cm).
- Tritone subs and back-door progressions labeled correctly when segment supports it.
- Constant-structure tunes get segment labels (chromatic/key shift) without wrong functional labels.
- JazzKiller overlay shows new analysis without regression; optional live grounding when enabled.
