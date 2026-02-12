# Phase 21 Summary: Professional-Grade Harmonic Analysis (Tonality Segmentation)

## What Was Implemented

Phase 21 refactored the harmonic analysis used for jazz standards in JazzKiller from **chord-by-chord labeling** to a **global optimization** pipeline (Waves 1–4; Wave 5 optional Live Grounding deferred).

### Wave 1–2: Tonality Segmentation

- **TonalitySegmentationEngine** (`src/core/theory/TonalitySegmentationEngine.ts`):
  - **REQ-HAT-01**: 24 key centers (12 major + 12 minor), `ChordSlot[]` (barIndex, chordSymbol).
  - **REQ-HAT-02**: `getFitCost(chordSymbol, key)` — diatonic low, secondary/borrowed medium, chromatic high; uses ChordDna + Key scale.
  - **REQ-HAT-03**: `getTransitionCost(keyFrom, keyTo)` — circle-of-fifths distance; relative major/minor bonus.
  - **REQ-HAT-04**: Viterbi algorithm: optimal key path; merge consecutive same-key slots into segments.
  - **REQ-HAT-05**: `getSegments(): KeySegment[]` (startBar, endBar, key).
- Unit tests: `TonalitySegmentationEngine.test.ts` (10 tests).

### Wave 3: Functional Labeling

- **FunctionalLabelingEngine** (`src/core/theory/FunctionalLabelingEngine.ts`):
  - **REQ-HAT-06, REQ-HAT-07**: Chord DNA + context → Roman numeral; jazz cliché rules (ii–V–I, tritone sub, iiø7, etc.).
  - **REQ-HAT-08**: Chromatic/constant-structure segments → "Key shift" / chord roots only.
- **AnalysisTypes** extended: `KeySegmentRef`, `Concept.keySegment`, `romanNumeral`, `segmentLabel`.
- Unit tests: `FunctionalLabelingEngine.test.ts` (3 tests).

### Wave 4: Pipeline and JazzKiller Integration

- **harmonicAnalysisPipeline** (`src/core/theory/harmonicAnalysisPipeline.ts`):
  - **REQ-HAT-09**: `preprocessToSlots(measures)` — measures → ChordSlot[]; no duplicate parsing.
  - **REQ-HAT-10**: `analyzeHarmony(input, options)` — Preprocessing → Segmentation → Labeling → Concept[] (backward compatible).
- **usePracticeStore.loadSong**: Calls `analyzeHarmony({ measures, key })`; uses result for `detectedPatterns` when non-empty; fallback to ConceptAnalyzer for overlay and for `generateExercises`.
- AnalysisOverlay continues to receive `Concept[]`; existing CONCEPT_COLORS and brackets unchanged.

### Wave 5: Live Harmonic Grounding (REQ-HAT-12–14)

- **liveHarmonicGrounding.ts**: `getLiveOverrides(chartChord, pitchBuffer)` — Conflict Resolver (chart dom7 vs buffer → subV7), Pedal Point Detection (bass-range dominant PC → pedal note name). Exported from theory index.
- **liveHarmonicGrounding.test.ts**: 6 tests (empty/small buffer, subV7 conflict, chart tones, pedal detection, no pedal above bass).
- Optional JazzKiller “live” mode (overlay/feedback using overrides) can be wired in a follow-up; API is ready.

## Files Created / Modified

- **Created**: `TonalitySegmentationEngine.ts`, `TonalitySegmentationEngine.test.ts`, `FunctionalLabelingEngine.ts`, `FunctionalLabelingEngine.test.ts`, `harmonicAnalysisPipeline.ts`, `liveHarmonicGrounding.ts`, `liveHarmonicGrounding.test.ts`.
- **Modified**: `AnalysisTypes.ts` (KeySegmentRef, Concept extensions), `usePracticeStore.ts` (loadSong uses analyzeHarmony), `src/core/theory/index.ts` (export getLiveOverrides, LiveOverrides, PitchBufferEntry).

## Verification

- Key set (24 keys), Fit, Transition, Viterbi, getSegments covered by unit tests.
- FunctionalLabelingEngine: ii–V–I, subV7, chromatic segment tests pass.
- Pipeline returns Concept[]; loadSong uses it for overlay; fallback to ConceptAnalyzer when pipeline returns none.
- Manual verification on Blue Bossa / ATTYA / constant-structure recommended; overlay visibility and click behavior unchanged.

## Next Steps

- Optional: Implement Wave 5 (Live Grounding) for Conflict Resolver and Pedal Point Detection.
- Run **`/gsd-complete-milestone`** for harmonic-analysis-tonality when ready to archive.
- Or proceed to next phase from ROADMAP.
