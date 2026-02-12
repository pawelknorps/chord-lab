# Professional-Grade Harmonic Analysis – Requirements

## Phase 1: Tonality Segmentation (DP/Viterbi)

### REQ-HAT-01: Key Center Representation

- **Requirement**: The engine operates over a finite set of **key centers** (e.g. 24: 12 major + 12 minor) and a sequence of **chord slots** (one per bar or per chord change, from iReal/lead sheet).
- **Input**: Array of chord symbols (or Chord DNA / pitch-class descriptors) plus optional bar boundaries.
- **Output**: For each slot, a **key center** (e.g. "C", "Cm", "F", "Gm") such that the full assignment minimizes total cost J.

### REQ-HAT-02: Fit Cost (Chord–Key)

- **Requirement**: Define **Fit(Chord_i, Key_k)** = cost of assigning chord i to key k. Lower cost = better fit (e.g. diatonic chord in key = low cost; chromatically distant = high cost).
- **Implementation**: Use scale-degree membership (diatonic, secondary dominant, borrowed, etc.) and/or pitch-class set distance; tunable weights.
- **Goal**: ii–V–I in C has very high fit (low cost) in C major; G7 in C major has high fit as V7; G7 in F major has lower fit unless treated as V/V.

### REQ-HAT-03: Transition Cost (Key–Key)

- **Requirement**: Define **Transition(Key_i, Key_{i+1})** = penalty for modulating from key i to key i+1. Closer keys (e.g. C → F, C → G) lower penalty; distant keys (e.g. C → Db) higher penalty.
- **Implementation**: Penalty by circle-of-fifths distance and/or major/minor relative; tunable.
- **Goal**: Avoid spurious key flips; favor few, coherent segments.

### REQ-HAT-04: Viterbi (or DP) Segmentation

- **Requirement**: Implement **Viterbi** (or equivalent DP) to compute the path of key centers that minimizes J = Σ Fit(Chord_i, Key_k) + Σ Transition(Key_i, Key_{i+1}) over the tune.
- **Output**: Per-slot key center; optionally merged into **segments** (consecutive bars with same key) for display and for functional labeling.
- **Performance**: Run once per song/section load; sub-second for typical 32–64 bar tune.

### REQ-HAT-05: Segment List API

- **Requirement**: Expose **segment list**: [{ startBar, endBar, key }]. Used by functional labeling and by overlay (e.g. “Bars 1–4: Bb Major”).

## Phase 2: Functional DNA Mapping (Roman Numerals)

### REQ-HAT-06: Chord DNA + Context → Roman Numeral

- **Requirement**: Given chord symbol (or Chord DNA), **current key segment**, and **context** (previous/next chord or segment), assign a **Roman numeral** (e.g. I, ii7, V7, subV7, iiø7, IVmaj7) from a dictionary of jazz clichés.
- **Chord DNA**: Reuse existing ChordDna (m7, dom7, maj7, m7b5, etc.); context rules: “m7 followed by dom7 a 4th up” → ii7; “dom7 resolving down half-step” → subV7; “maj7 target of ii–V” → Imaj7; “m7b5 in minor cadence” → iiø7.
- **Output**: Per-chord (or per-bar) Roman numeral and optional “functional label” (e.g. “Tritone Sub”) for overlay.

### REQ-HAT-07: Jazz Cliché Dictionary

- **Requirement**: Maintain a **dictionary of common jazz progressions** (ii–V–I, I–VI–ii–V, back-door, tritone sub, minor ii–V–i, iiø7–V7–i, etc.) used to assign Roman numerals from Chord DNA + key + context.
- **Implementation**: Configurable table or rules; extendable for modal interchange, secondary dominants, constant-structure handling (e.g. “chromatic shift” segment type).

### REQ-HAT-08: Constant-Structure / Chromatic Segments

- **Requirement**: When the best path indicates **chromatic key movement** (e.g. half-step or constant-structure progression), segment can be labeled as “chromatic” or “constant structure” so that functional labels do not force bogus Roman numerals; overlay can show “Key shifts” or chord roots only.
- **Goal**: So What, Inner Urge style tunes get segment labels that reflect shifting tonality, not wrong ii–V–I.

## Phase 3: Pipeline and JazzKiller Integration

### REQ-HAT-09: Preprocessing (iReal → Chord Input)

- **Requirement**: **Preprocessing** converts the iReal/lead-sheet chord string into the format required by segmentation: array of chord symbols (or pitch-class sets / Chord DNA descriptors) with bar or beat indices. Reuse existing Functional Decomposition / ChordDna; no duplicate parsing.
- **Integration**: Same data source as current ConceptAnalyzer (e.g. measures from song.music).

### REQ-HAT-10: Analysis Pipeline API

- **Requirement**: Single entry point (e.g. `analyzeHarmony(songChords, options)`) that runs: Preprocessing → Segmentation → Functional Labeling, and returns **concepts** (or extended concept type) compatible with AnalysisOverlay: key segments + per-chord Roman numerals + optional concept type (MajorII-V-I, TritoneSubstitution, etc.).
- **Backward compatibility**: Return type can extend existing `Concept` (e.g. add `keySegment`, `romanNumeral`, `segmentLabel`) so LeadSheet and AnalysisOverlay need minimal changes.

### REQ-HAT-11: Refactor JazzKiller Overlay Data Source

- **Requirement**: JazzKiller’s analysis flow (e.g. on song load, or on “Show Analysis” toggle) uses the **new pipeline** as the data source for AnalysisOverlay instead of (or in addition to) ConceptAnalyzer. Existing overlay UI (brackets, colors, concept types) preserved; new fields (key segment, Roman numeral) can be shown in tooltip or secondary line.
- **Verification**: Same or better labeling on Blue Bossa, All the Things You Are, and a constant-structure tune; no regression in overlay visibility or click behavior.

## Phase 4 (Optional): Live Harmonic Grounding (SwiftF0)

### REQ-HAT-12: Conflict Resolver (Chart vs. Performance)

- **Requirement**: When SwiftF0 (or pitch store) is available and the **chart** says e.g. C7 but the **student** consistently plays F# and Bb (tritone sub), the engine marks this as **tritone substitution** in real time and can update overlay or feedback (“You’re playing subV7 here”).
- **Implementation**: Compare pitch-class set from SwiftF0 (over a short window) with chart chord; if dominant and pitch set matches tritone sub, set or suggest subV7 label.
- **Integration**: Optional “live” mode in JazzKiller; can annotate segment or concept without replacing offline analysis.

### REQ-HAT-13: Pedal Point Detection

- **Requirement**: When pitch detection shows the student **sustaining a low pitch** (e.g. G) while the chords change (e.g. F/G, Eb/G), the engine marks the section as a **dominant pedal** (or pedal point) and can override or annotate the standard functional analysis for that segment.
- **Implementation**: Detect stable bass pitch over several chords; if chord symbols indicate slash chords or pedal, confirm; else infer from SwiftF0 and mark segment.
- **Integration**: Optional; segment label or overlay note “Pedal (G)” for educational feedback.

### REQ-HAT-14: Live Grounding API

- **Requirement**: Expose a **Live Grounding** API that consumes (chart chord at time t, SwiftF0 stream or pitch buffer) and returns overrides or annotations (e.g. “subV7”, “pedal G”) for the current segment. Offline analysis remains the base; live layer adds or overrides when enabled.
- **Performance**: Lightweight (no full re-segmentation in real time); conflict and pedal checks on current bar or window.

## Out of Scope (v1)

- Automatic chord recognition from audio only (input remains chord symbols + optional live pitch).
- Changing playback or band logic based on harmonic analysis.
- Full re-authoring of every standard with hand-checked key segments.

## Summary: Requirement → Phase

| REQ-ID | Summary | Phase |
|--------|---------|--------|
| REQ-HAT-01 | Key center representation | 1 |
| REQ-HAT-02 | Fit cost (chord–key) | 1 |
| REQ-HAT-03 | Transition cost (key–key) | 1 |
| REQ-HAT-04 | Viterbi segmentation | 1 |
| REQ-HAT-05 | Segment list API | 1 |
| REQ-HAT-06 | Chord DNA + context → Roman numeral | 2 |
| REQ-HAT-07 | Jazz cliché dictionary | 2 |
| REQ-HAT-08 | Constant-structure segments | 2 |
| REQ-HAT-09 | Preprocessing (iReal → chord input) | 3 |
| REQ-HAT-10 | Analysis pipeline API | 3 |
| REQ-HAT-11 | Refactor JazzKiller overlay | 3 |
| REQ-HAT-12 | Conflict Resolver (chart vs. performance) | 4 (optional) |
| REQ-HAT-13 | Pedal point detection | 4 (optional) |
| REQ-HAT-14 | Live grounding API | 4 (optional) |
