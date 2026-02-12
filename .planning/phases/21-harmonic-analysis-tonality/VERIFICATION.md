# Phase 21 Verification: Professional-Grade Harmonic Analysis

## Pre-Implementation Checklist

- [ ] Milestone `.planning/milestones/harmonic-analysis-tonality/` has PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md.
- [ ] Phase 21 folder has PLAN.md, RESEARCH.md, SUMMARY.md, VERIFICATION.md.
- [ ] Main PROJECT.md includes pillar 14 (Professional-Grade Harmonic Analysis).
- [ ] Main ROADMAP.md includes Phase 21 and tasks (Waves 1–5).

## Wave 1–2: Tonality Segmentation

- [ ] Key center set (e.g. 24 keys) and slot model defined.
- [ ] Fit(Chord_i, Key_k) implemented; diatonic low cost, chromatic high cost.
- [ ] Transition(Key_i, Key_{i+1}) implemented; circle-of-fifths or relative penalty.
- [ ] Viterbi (or DP) implemented; optimal key path and segment list (startBar, endBar, key).
- [ ] Segment list API exposed; sub-second for 32–64 bars.

## Wave 3: Functional Labeling

- [ ] Jazz cliché dictionary (ii–V–I, subV7, iiø7, etc.) and Chord DNA + context rules implemented.
- [ ] FunctionalLabelingEngine produces Roman numeral (+ optional concept type) per chord.
- [ ] Constant-structure / chromatic segments handled (no wrong Roman numerals).

## Wave 4: Pipeline and JazzKiller

- [ ] Preprocessing reuses ChordDna / song measures; no duplicate parsing.
- [ ] analyzeHarmony() runs Preprocessing → Segmentation → Labeling; returns concepts (extended type).
- [ ] LeadSheet / analyze flow uses new pipeline for overlay data source.
- [ ] AnalysisOverlay displays new analysis; optional key segment and Roman numeral visible (tooltip or secondary line).
- [ ] **Regression**: Overlay visibility, click behavior, and existing concept types still work.

## Verification Tunes

- [ ] **Blue Bossa**: Cm7 in C minor section labeled as i (not ii); key segments reflect A/B sections.
- [ ] **All the Things You Are**: Key segments and ii–V–I (and modulations) labeled correctly.
- [ ] **Constant-structure tune** (e.g. So What or Inner Urge): Segment labels show key shifts or chromatic movement; no bogus ii–V–I where inappropriate.

## Wave 5 (Optional): Live Grounding

- [ ] Conflict Resolver: Chart C7 + student F#/Bb (SwiftF0) → overlay or feedback shows subV7.
- [ ] Pedal Point Detection: Sustained low pitch while chords change → segment or overlay shows "Pedal (X)".
- [ ] Live Grounding API: getLiveOverrides(chartChord, pitchBuffer) returns overrides/annotations; no full re-segmentation in real time.
- [ ] No regression when live grounding is off.

## Sign-Off

- [ ] All planned waves (1–4; 5 if implemented) complete.
- [ ] STATE.md and milestone STATE.md updated.
- [ ] No breaking changes to AnalysisOverlay or LeadSheet public behavior.
