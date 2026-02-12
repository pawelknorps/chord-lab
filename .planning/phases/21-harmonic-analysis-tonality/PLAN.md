---
phase: 21
name: Professional-Grade Harmonic Analysis (Tonality Segmentation)
milestone: .planning/milestones/harmonic-analysis-tonality/
waves: 5
dependencies: [
  "ChordDna, functionalRules, ConceptAnalyzer, AnalysisTypes",
  "JazzKiller: LeadSheet, AnalysisOverlay, song load/analyze flow",
  "Phase 14.1/14.2: SwiftF0 (optional for Wave 5)"
]
principle: "Refactor harmonic overlays; extend Chord DNA and ConceptAnalyzer. No breaking changes to AnalysisOverlay UI; new pipeline behind analyze API."
files_modified: [
  "src/core/theory/ConceptAnalyzer.ts",
  "src/core/theory/AnalysisTypes.ts",
  "src/modules/JazzKiller/components/LeadSheet.tsx",
  "src/modules/JazzKiller/utils/JazzTheoryService.ts (or analyze entry)"
]
files_created: [
  "src/core/theory/TonalitySegmentationEngine.ts",
  "src/core/theory/FunctionalLabelingEngine.ts",
  "src/core/theory/harmonicAnalysisPipeline.ts"
]
---

# Phase 21 Plan: Professional-Grade Harmonic Analysis (Tonality Segmentation)

**Focus**: Refactor JazzKiller harmonic analysis from chord-by-chord labeling to **Tonality Segmentation (DP/Viterbi)** and **Functional DNA Mapping**; optional **SwiftF0 Live Harmonic Grounding**.

**Success Criteria**:
- REQ-HAT-01–05: Tonality segmentation (Fit, Transition, Viterbi, segment list API).
- REQ-HAT-06–08: Functional labeling (Chord DNA + context → Roman numeral; jazz cliché dictionary; constant-structure).
- REQ-HAT-09–11: Pipeline API and JazzKiller overlay refactor.
- REQ-HAT-12–14 (optional): Live Grounding (Conflict Resolver, Pedal Point Detection).

---

## Context (Existing Implementation – Preserved)

- **ConceptAnalyzer**: Keeps `analyze(chords, keySignature)` and concept types (MajorII-V-I, TritoneSubstitution, etc.); **extend** or **wrap** with new pipeline that produces key segments + Roman numerals.
- **AnalysisTypes**: `Concept` can gain optional `keySegment`, `romanNumeral`, `segmentLabel`; backward compatible.
- **ChordDna**: Reuse `getChordDna(symbol)` for chord structure; no change to ChordDna API.
- **JazzKiller**: LeadSheet uses `patternsToDisplay` (filtered or detected); **refactor** data source to new `analyzeHarmony()` (or equivalent) so overlay shows segment-aware Roman numerals.

---

## Wave 1: Fit and Transition Costs (REQ-HAT-01, REQ-HAT-02, REQ-HAT-03)

*Goal: Define key center set, Fit(chord, key), and Transition(key_i, key_{i+1}).*

### 21.1 – Key Center Representation (REQ-HAT-01)

- **Key set**: Define 24 key centers (12 major + 12 minor), e.g. "C", "Cm", "F", "Gm", etc. Input = array of chord symbols (or Chord DNA descriptors) with bar/beat indices.
- **Slot model**: One slot per bar or per chord change; output = key center per slot.

### 21.2 – Fit Cost (REQ-HAT-02)

- **Fit(Chord_i, Key_k)**: Cost of assigning chord i to key k. Use scale-degree membership: diatonic = low cost; secondary dominant / borrowed = medium; chromatically distant = high. Reuse ChordDna + key scale (Tonal.js Key.scale or equivalent).
- **Tunable**: Weights for diatonic vs secondary vs chromatic; optional pitch-class set distance.

### 21.3 – Transition Cost (REQ-HAT-03)

- **Transition(Key_i, Key_{i+1})**: Penalty for modulating. Circle-of-fifths distance (e.g. C→F = 1 step, C→Db = 6 steps); relative major/minor = low penalty. Tunable.

---

## Wave 2: Viterbi and Segment API (REQ-HAT-04, REQ-HAT-05)

*Goal: Implement Viterbi (or DP) to minimize J; expose segment list.*

### 21.4 – Viterbi Segmentation (REQ-HAT-04)

- **Algorithm**: Standard Viterbi: for each slot, for each key, compute best cost to reach that key; backpointer for path. Total cost J = Σ Fit + Σ Transition.
- **Output**: Per-slot key center; merge consecutive same-key slots into **segments** (startBar, endBar, key).
- **Performance**: Sub-second for 32–64 bars; run once per song/section load.

### 21.5 – Segment List API (REQ-HAT-05)

- **API**: `getSegments(): { startBar, endBar, key }[]`. Used by Functional Labeling and by overlay (e.g. "Bars 1–4: Bb Major").

---

## Wave 3: Functional Labeling (REQ-HAT-06, REQ-HAT-07, REQ-HAT-08)

*Goal: Chord DNA + key + context → Roman numeral via jazz cliché dictionary.*

### 21.6 – Jazz Cliché Dictionary (REQ-HAT-07)

- **Dictionary**: Table or rules: ii–V–I, I–VI–ii–V, back-door, tritone sub (m7 → dom7 resolving down half-step), minor ii–V–i, iiø7–V7–i, etc. Each entry: (Chord DNA pattern, prev/next context, key) → Roman numeral + optional concept type.
- **Chord DNA**: Reuse getChordDna: m7, dom7, maj7, m7b5, etc.; context = "followed by dom7 a 4th up" → ii7; "resolving down half-step" → subV7; "target of ii–V" → Imaj7; "part of minor cadence" → iiø7.

### 21.7 – Functional Labeling Engine (REQ-HAT-06)

- **FunctionalLabelingEngine**: Input = chord sequence + segments; for each chord, determine key from segment, get Chord DNA, check context (prev/next chord); lookup Roman numeral and optional concept type (MajorII-V-I, TritoneSubstitution, etc.).
- **Output**: Per-chord Roman numeral + optional concept type for overlay.

### 21.8 – Constant-Structure Handling (REQ-HAT-08)

- **Chromatic segments**: When segment key is "chromatic" or constant-structure (e.g. half-step shift), do not force ii–V–I; label as "Key shift" or show chord roots only; avoid bogus Roman numerals.

---

## Wave 4: Pipeline and JazzKiller Integration (REQ-HAT-09, REQ-HAT-10, REQ-HAT-11)

*Goal: Single analyze entry point; refactor JazzKiller overlay data source.*

### 21.9 – Preprocessing (REQ-HAT-09)

- **Preprocessing**: Convert song measures (iReal chord strings) to array of chord symbols with bar indices; reuse existing ChordDna / parsing; no duplicate logic.
- **Input**: Same as current ConceptAnalyzer (e.g. measures from song.music).

### 21.10 – Analysis Pipeline API (REQ-HAT-10)

- **analyzeHarmony(songChords, options)**: Runs Preprocessing → TonalitySegmentationEngine → FunctionalLabelingEngine; returns **concepts** (extended Concept type) with keySegment, romanNumeral, segmentLabel; backward compatible with AnalysisOverlay (existing type, concept type, startIndex, endIndex, metadata).
- **harmonicAnalysisPipeline.ts**: Orchestrates segmentation + labeling; exports analyzeHarmony.

### 21.11 – JazzKiller Overlay Refactor (REQ-HAT-11)

- **LeadSheet / analyze flow**: When song loads and "Show Analysis" is on, call new pipeline (e.g. analyzeHarmony) instead of (or in addition to) ConceptAnalyzer.analyze; pass result as patternsToDisplay. Overlay UI unchanged; tooltip or secondary line can show key segment and Roman numeral.
- **Verification**: Blue Bossa (Cm7 = i in Cm), All the Things You Are (key segments and ii–V–I), one constant-structure tune (segment labels, no wrong Roman numerals); no regression in overlay visibility or click.

---

## Wave 5 (Optional): Live Harmonic Grounding (REQ-HAT-12, REQ-HAT-13, REQ-HAT-14)

*Goal: Conflict Resolver (chart vs. SwiftF0) and Pedal Point Detection; optional Live Grounding API.*

### 21.12 – Conflict Resolver (REQ-HAT-12)

- **Logic**: If chart says C7 but SwiftF0 (over short window) shows student consistently playing F# and Bb (tritone sub), set or suggest subV7 label for overlay or feedback ("You're playing subV7 here").
- **Integration**: Optional "live" mode in JazzKiller; can annotate current segment/concept without replacing offline analysis.

### 21.13 – Pedal Point Detection (REQ-HAT-13)

- **Logic**: If pitch detection shows sustained low pitch (e.g. G) while chords change (F/G, Eb/G), mark section as dominant pedal; override or annotate segment label ("Pedal (G)").
- **Integration**: Optional; segment or overlay note for educational feedback.

### 21.14 – Live Grounding API (REQ-HAT-14)

- **API**: `getLiveOverrides(chartChord, pitchBuffer): { romanNumeral?, pedal? }` (or equivalent). Consumes chart chord at time t and SwiftF0 stream/buffer; returns overrides or annotations for current segment. Lightweight; no full re-segmentation in real time.

---

## Verification (Phase Goal)

- **Segmentation**: Key segments and Roman numerals reflect context (Blue Bossa Cm7 = i; tritone sub labeled when segment supports it).
- **Constant-structure**: Chromatic/key-shift segments labeled without wrong functional labels.
- **Overlay**: JazzKiller AnalysisOverlay shows new analysis; no regression in UI or click.
- **Live (optional)**: With mic on, tritone sub playing → overlay/feedback shows subV7; pedal hold → pedal section annotation.

---

## Next Steps

1. Execute Wave 1 (Fit, Transition, key representation).
2. Execute Wave 2 (Viterbi, segment API).
3. Execute Wave 3 (cliché dictionary, FunctionalLabelingEngine, constant-structure).
4. Execute Wave 4 (pipeline API, JazzKiller refactor).
5. Optionally execute Wave 5 (Live Grounding).
6. Update `.planning/milestones/harmonic-analysis-tonality/STATE.md` and VERIFICATION.md.

Recommend running **`/gsd-execute-phase 21`** (or `/gsd-plan-phase 21` for more task breakdown) to start implementation (Wave 1).
