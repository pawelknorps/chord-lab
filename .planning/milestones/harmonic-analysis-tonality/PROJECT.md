# Professional-Grade Harmonic Analysis (Tonality Segmentation) – Project Vision

## Vision Statement

Refactor the harmonic analysis used for jazz standards in JazzKiller from **chord-by-chord labeling** to a **global optimization** system that identifies **Key Center Segments (Tonality Segmentation)** and assigns Roman numerals via **Functional DNA Mapping**. Integrate **SwiftF0 Live Harmonic Grounding** so theoretical analysis can be verified and overridden by the student’s actual performance (e.g. tritone substitution, pedal points).

## Problem Statement

Today, ConceptAnalyzer and AnalysisOverlay detect fixed patterns (ii–V–I, tritone sub, etc.) in isolation. A G7 is often treated as V7 regardless of context; in Blue Bossa, Cm7 is the i chord, not ii. Constant-structure tunes (So What, Inner Urge) have no single key, so chord-by-chord functional labels are misleading. The goal is to treat the tune as a **global optimization problem**: find the path of least cost through key centers, then map Chord DNA to Roman numerals within each segment, and optionally ground analysis against SwiftF0 (conflict resolution, pedal detection).

## Core Value Proposition

1. **Tonality Segmentation (DP/Viterbi)**: Minimize total cost J = Σ Fit(Chord_i, Key_k) + Σ Transition(Key_i, Key_{i+1}). Fit = how well the chord belongs to the current key; Transition = penalty for modulating (e.g. C→Db higher than C→F).
2. **Functional DNA Mapping**: Once key segments are known, map Chord DNA (m7, dom7, maj7, m7b5, etc.) plus context (preceded by X, followed by Y) to Roman numerals (ii7, V7, Imaj7, subV7, iiø7, etc.) using a dictionary of jazz clichés.
3. **Live Harmonic Grounding (SwiftF0)**: Conflict Resolver—if chart says C7 but student plays F#/Bb consistently, label as tritone sub in real time; Pedal Point Detection—if student holds low G while chords change (F/G, Eb/G), mark section as dominant pedal and override standard functional analysis.
4. **Analysis Pipeline**: Preprocessing (iReal → pitch-class sets via existing decomposition) → Segmentation (Viterbi key centers) → Functional Labeling (cliché dictionary) → Verification (optional SwiftF0 comparison).

## Target Audience

- **Jazz students** who want accurate, context-aware Roman numeral overlays on lead sheets (e.g. “You played #11 here, which fits the Lydian function of this IV chord”).
- **JazzKiller module**: Refactor AnalysisOverlay and concept data source to consume the new engine; preserve existing UI (brackets, colors) while improving labels.
- **Developers** extending theory (ChordDna, functionalRules, ConceptAnalyzer) with segmentation and live grounding.

## Core Functionality (The ONE Thing)

**The system does not label every chord in isolation. It finds key center segments for the whole tune (or section), then assigns Roman numerals from Chord DNA + context within each segment, and can reconcile with live pitch (SwiftF0) for conflict resolution and pedal detection.**

Users must be able to:

- See **key center segments** (e.g. “Bars 1–4: Bb Major”, “Bars 5–8: G Minor”) and **Roman numerals** that respect context (e.g. Cm7 in Blue Bossa = i, not ii).
- Handle **modular/constant-structure** progressions by recognizing chromatic key shifts rather than forcing non-existent functional relationships.
- (Optional) Get **live grounding**: chart vs. performance conflicts (e.g. tritone sub) and pedal sections inferred from SwiftF0 and reflected in overlays or feedback.

## Key Requirements (High-Level)

- **Segmentation Engine**: Viterbi (or DP) over candidate key centers per bar/beat; Fit(chord, key) and Transition(key_i, key_{i+1}); output = key center segments (bar ranges + key).
- **Functional Labeling**: Input = chord symbol + key segment; dictionary of jazz clichés (ii–V–I, I–VI–ii–V, back-door, subV7, iiø7, etc.); output = Roman numeral (+ optional Chord DNA slot) for overlay.
- **Preprocessing**: Reuse ChordDna / functional decomposition to get pitch-class sets or chord descriptors from iReal string; no duplicate parsing.
- **JazzKiller Integration**: New (or refactored) analysis pipeline feeds AnalysisOverlay; concepts include key segment + Roman numerals; optional “live” layer when SwiftF0 is available.
- **Live Grounding (v1 or v2)**: Conflict Resolver (chart C7 vs. student F#/Bb → subV7); Pedal Point Detection (sustained bass pitch while chords change → mark pedal); both can override or annotate segment labels.

## Technical Constraints

- **Reuse ChordDna, functionalRules, ConceptAnalyzer types**: Extend, don’t replace; AnalysisTypes (Concept, ConceptType) can gain optional keySegment and romanNumeral fields.
- **Performance**: Segmentation run once per song load (or per section); Live Grounding runs in real time on SwiftF0 stream (same pipeline as ITM / JazzKiller).
- **No breaking changes**: Existing AnalysisOverlay and LeadSheet integration keep working; new engine can sit behind a refactored “analyze” API.

## Out of Scope (v1)

- Full re-authoring of all standards with hand-checked key segments (engine infers segments).
- Automatic chord recognition from audio (input remains chord symbols + optional live pitch).
- Changing playback or band logic based on harmonic analysis (overlay/feedback only).

## Success Metrics

- Same tune (e.g. Blue Bossa): Cm7 in the minor section labeled as i, not ii; key segments reflect A section (Cm) and B section (Eb) etc.
- Tritone sub (Abm7–Db7–Cbmaj7): Db7 labeled subV7 when segment/key supports it.
- Constant-structure: Segments show key “shifts” (e.g. chromatic) rather than wrong functional labels.
- With Live Grounding: When student consistently plays tritone sub notes over a dominant, overlay or feedback shows subV7; pedal section marked when bass pitch is stable.

## Key Decisions

| Decision | Rationale |
|----------|------------|
| **Global optimization** | Single-chord labeling is ambiguous; key segments disambiguate (e.g. m7 = i vs ii). |
| **Chord DNA + context** | Existing ChordDna gives structure; context (prev/next chord, key) gives function (ii7, subV7, etc.). |
| **Viterbi/DP** | Standard approach for optimal segmentation; Fit + Transition costs are tunable. |
| **SwiftF0 for grounding** | Already in pipeline; low latency allows real-time conflict and pedal detection. |
| **Refactor overlays** | Keep JazzKiller AnalysisOverlay UI; swap data source to new pipeline. |

## Integration Points

- **JazzKiller**: LeadSheet, AnalysisOverlay, AnalysisToolbar; `loadSong` / analyze flow; concept list from new segmentation + functional labeling.
- **Theory**: ChordDna, functionalRules, ConceptAnalyzer (extend or wrap); AnalysisTypes (Concept type extended).
- **Pitch**: useITMPitchStore / SwiftF0 → optional Live Grounding (Conflict Resolver, Pedal Point Detection).

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation waves (ROADMAP.md, STATE.md).
3. Implement segmentation (Fit, Transition, Viterbi).
4. Implement functional labeling (cliché dictionary, Chord DNA → Roman numeral).
5. Wire into JazzKiller (refactor analyze, overlay).
6. Optional: Live Grounding (conflict + pedal).
