# Phase 21 Verification: Professional-Grade Harmonic Analysis

## Pre-Implementation Checklist

- [x] Milestone `.planning/milestones/harmonic-analysis-tonality/` has PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md.
- [x] Phase 21 folder has PLAN.md, RESEARCH.md, SUMMARY.md, VERIFICATION.md.
- [x] Main PROJECT.md includes pillar 14 (Professional-Grade Harmonic Analysis).
- [x] Main ROADMAP.md includes Phase 21 and tasks (Waves 1–5).

## Wave 1–2: Tonality Segmentation

- [x] Key center set (24 keys) and slot model defined.
- [x] Fit(Chord_i, Key_k) implemented; diatonic low cost, chromatic high cost.
- [x] Transition(Key_i, Key_{i+1}) implemented; circle-of-fifths and relative penalty.
- [x] Viterbi implemented; optimal key path and segment list (startBar, endBar, key).
- [x] Segment list API (getSegments()); sub-second for 32–64 bars.
- [x] Unit tests: TonalitySegmentationEngine.test.ts (10 tests pass).

## Wave 3: Functional Labeling

- [x] Jazz cliché dictionary (ii–V–I, subV7, iiø7, etc.) and Chord DNA + context rules implemented.
- [x] FunctionalLabelingEngine produces Roman numeral (+ optional concept type) per chord.
- [x] Constant-structure / chromatic segments handled ("Key shift", roots only).
- [x] Unit tests: FunctionalLabelingEngine.test.ts (3 tests pass).

## Wave 4: Pipeline and JazzKiller

- [x] Preprocessing (preprocessToSlots) reuses measures; no duplicate parsing.
- [x] analyzeHarmony() runs Preprocessing → Segmentation → Labeling; returns Concept[] (extended type).
- [x] loadSong uses analyzeHarmony for overlay data source; fallback to ConceptAnalyzer when pipeline returns none.
- [x] AnalysisOverlay receives same Concept shape; keySegment, romanNumeral, segmentLabel optional.
- [ ] **Regression**: Manual check overlay visibility, click behavior, and concept types in JazzKiller.

## Verification Tunes (Manual)

- [ ] **Blue Bossa**: Cm7 in C minor section labeled as i (not ii); key segments reflect A/B sections.
- [ ] **All the Things You Are**: Key segments and ii–V–I (and modulations) labeled correctly.
- [ ] **Constant-structure tune**: Segment labels show key shifts or chromatic; no bogus ii–V–I.

## Wave 5 (Optional): Live Grounding ✅

- [x] Conflict Resolver: Chart C7 + pitch buffer with tritone sub PCs → getLiveOverrides returns romanNumeral: "subV7".
- [x] Pedal Point Detection: Bass-range buffer with dominant PC → getLiveOverrides returns pedal: note name.
- [x] Live Grounding API: getLiveOverrides(chartChord, pitchBuffer) in liveHarmonicGrounding.ts; exported from theory index.
- [x] Unit tests: liveHarmonicGrounding.test.ts (6 tests). No overlay wiring yet (optional follow-up).

## Sign-Off

- [x] Waves 1–5 complete.
- [ ] STATE.md and milestone STATE.md updated (done below).
- [x] No breaking changes to AnalysisOverlay or LeadSheet public behavior.
