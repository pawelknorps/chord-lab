# Professional-Grade Harmonic Analysis – State

## Status: Phase 21 Complete (Waves 1–4)

- **Milestone**: `.planning/milestones/harmonic-analysis-tonality/`
- **Phase**: 21 (see `.planning/phases/21-harmonic-analysis-tonality/`)

## Completed

- **Wave 1–2**: TonalitySegmentationEngine (key set, Fit, Transition, Viterbi, getSegments); unit tests.
- **Wave 3**: FunctionalLabelingEngine (jazz cliché dictionary, Chord DNA + context → Roman numeral, constant-structure); AnalysisTypes extended; unit tests.
- **Wave 4**: harmonicAnalysisPipeline (preprocessToSlots, analyzeHarmony); usePracticeStore.loadSong uses pipeline for overlay; fallback to ConceptAnalyzer.
- SUMMARY.md, VERIFICATION.md updated; ROADMAP.md and main STATE.md updated.

## In Progress

- None.

## Deferred

- **Wave 5**: Live Harmonic Grounding (Conflict Resolver, Pedal Point Detection, getLiveOverrides) — optional; can be implemented later.

## Next Actions

1. Manual verification: Blue Bossa, All the Things You Are, constant-structure tune (overlay labels and no regression).
2. Optionally implement Wave 5 (Live Grounding).
3. Run `/gsd-complete-milestone` for harmonic-analysis-tonality when ready to archive.
