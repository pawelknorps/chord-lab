# Phase 21 Summary: Professional-Grade Harmonic Analysis (Tonality Segmentation)

## What Was Planned

Phase 21 refactors the harmonic analysis used for jazz standards in JazzKiller from **chord-by-chord labeling** to a **global optimization** system:

1. **Tonality Segmentation (DP/Viterbi)**: Minimize J = Σ Fit(Chord_i, Key_k) + Σ Transition(Key_i, Key_{i+1}) to get key center segments (e.g. "Bars 1–4: Bb Major", "Bars 5–8: G Minor"). Fit = how well chord belongs to key; Transition = modulation penalty (e.g. C→Db higher than C→F).

2. **Functional DNA Mapping**: Once segments are known, map Chord DNA (m7, dom7, maj7, m7b5, etc.) + context (prev/next chord) to Roman numerals via a jazz cliché dictionary (ii–V–I, subV7, iiø7, etc.). Contextual awareness: e.g. Cm7 in Blue Bossa = i, not ii.

3. **Pipeline and JazzKiller Integration**: Preprocessing (iReal → chord array, reuse ChordDna); single entry point `analyzeHarmony()`; refactor LeadSheet/analyze flow so AnalysisOverlay consumes new pipeline. Overlay UI unchanged; optional key segment and Roman numeral in tooltip or secondary line.

4. **Optional Live Harmonic Grounding (SwiftF0)**: Conflict Resolver (chart C7 vs. student F#/Bb → subV7); Pedal Point Detection (sustained low pitch while chords change → mark pedal). Lightweight; no full re-segmentation in real time.

## Deliverables (Planned)

- **TonalitySegmentationEngine**: Fit cost, Transition cost, Viterbi, segment list API.
- **FunctionalLabelingEngine**: Jazz cliché dictionary, Chord DNA + context → Roman numeral; constant-structure handling.
- **harmonicAnalysisPipeline.ts**: analyzeHarmony(); orchestrates segmentation + labeling.
- **JazzKiller**: Refactor analyze data source to new pipeline; AnalysisOverlay shows segment-aware Roman numerals.
- **Optional**: Live Grounding API (Conflict Resolver, Pedal Point Detection).

## Dependencies

- ChordDna, functionalRules, ConceptAnalyzer, AnalysisTypes.
- JazzKiller: LeadSheet, AnalysisOverlay, song load/analyze flow.
- SwiftF0 / useITMPitchStore (for Wave 5 only).

## Success Criteria

- Key segments and Roman numerals reflect context (Blue Bossa Cm7 = i; tritone sub when segment supports it).
- Constant-structure tunes get segment labels (chromatic/key shift) without wrong functional labels.
- JazzKiller overlay displays new analysis without regression.
- Optional: Live grounding shows subV7 when student plays tritone sub; pedal section annotated when student holds pedal.

## Next Step

Run **`/gsd-plan-phase 21`** for more task breakdown, or **`/gsd-execute-phase 21`** to start implementation (Wave 1: Fit and Transition costs).
