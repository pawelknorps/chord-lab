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

## Context: Current Implementation to Preserve (Incorporate Fully)

- **ConceptAnalyzer**: Keep `analyze(chords, keySignature)` and all concept types (MajorII-V-I, MinorII-V-i, SecondaryDominant, TritoneSubstitution, ColtraneChanges). **Extend** or **wrap** with new pipeline; do not remove existing pattern detection—merge or delegate so overlay continues to receive compatible concepts.
- **AnalysisTypes**: Extend `Concept` with optional `keySegment`, `romanNumeral`, `segmentLabel` only; keep existing `type`, `startIndex`, `endIndex`, `metadata`; backward compatible.
- **ChordDna**: Reuse `getChordDna(symbol)` and ChordDnaResult as-is; no API change. Use for Fit cost and Functional Labeling; no duplicate chord parsing.
- **JazzKiller**: LeadSheet, AnalysisOverlay, AnalysisToolbar, `loadSong`/analyze flow stay; **refactor** only the **data source** for overlay (call new pipeline instead of or in addition to ConceptAnalyzer); CONCEPT_COLORS and AnalysisBracket UI unchanged.
- **functionalRules, JazzTheoryService**: Reuse for enharmonic spelling and theory helpers; no breaking changes.

---

## Wave 1: Fit and Transition Costs (REQ-HAT-01, REQ-HAT-02, REQ-HAT-03)

*Goal: Define key center set, Fit(chord, key), and Transition(key_i, key_{i+1}).*

### 21.1 – Key Center Representation (REQ-HAT-01)

- <task id="W1-T1">**Key set and slot model**  
  Define 24 key centers (12 major + 12 minor), e.g. "C", "Cm", "F", "Gm". Input = array of chord symbols (or Chord DNA descriptors) with bar/beat indices. One slot per bar or per chord change; output = key center per slot. Place in TonalitySegmentationEngine or shared types.</task>

### 21.2 – Fit Cost (REQ-HAT-02)

- <task id="W1-T2">**Fit(Chord_i, Key_k)**  
  Implement cost of assigning chord i to key k: scale-degree membership (diatonic = low; secondary dominant / borrowed = medium; chromatic = high). Reuse ChordDna + Tonal.js Key/scale. Tunable weights; optional pitch-class set distance.</task>

### 21.3 – Transition Cost (REQ-HAT-03)

- <task id="W1-T3">**Transition(Key_i, Key_{i+1})**  
  Implement modulation penalty: circle-of-fifths distance (C→F = 1, C→Db = 6); relative major/minor = low penalty. Tunable.</task>

**Verification Wave 1**: Key set (24 keys) and slot model defined; Fit(chord, key) returns lower cost for diatonic; Transition(key_i, key_{i+1}) returns higher penalty for distant keys (e.g. C→Db). Unit test Fit and Transition with known chord/key pairs.

---

## Wave 2: Viterbi and Segment API (REQ-HAT-04, REQ-HAT-05)

*Goal: Implement Viterbi (or DP) to minimize J; expose segment list.*

### 21.4 – Viterbi Segmentation (REQ-HAT-04)

- <task id="W2-T1">**Viterbi algorithm**  
  In TonalitySegmentationEngine: for each slot and each key, compute best cost to reach that key; backpointer for path. Total cost J = Σ Fit + Σ Transition. Backtrack for optimal key sequence; merge consecutive same-key slots into segments (startBar, endBar, key). Sub-second for 32–64 bars.</task>

### 21.5 – Segment List API (REQ-HAT-05)

- <task id="W2-T2">**getSegments()**  
  Expose `getSegments(): { startBar, endBar, key }[]` from TonalitySegmentationEngine. Used by Functional Labeling and overlay (e.g. "Bars 1–4: Bb Major").</task>

**Verification Wave 2**: Viterbi returns optimal key path for a short chord sequence; getSegments() returns merged segments; sub-second for 32 bars. Unit test with known progression (e.g. C major ii–V–I → one segment).

---

## Wave 3: Functional Labeling (REQ-HAT-06, REQ-HAT-07, REQ-HAT-08)

*Goal: Chord DNA + key + context → Roman numeral via jazz cliché dictionary.*

### 21.6 – Jazz Cliché Dictionary (REQ-HAT-07)

- <task id="W3-T1">**Jazz cliché dictionary**  
  Create table or rules: ii–V–I, I–VI–ii–V, back-door, tritone sub, minor ii–V–i, iiø7–V7–i. Each entry: (Chord DNA pattern, prev/next context, key) → Roman numeral + optional ConceptType. Reuse getChordDna (m7, dom7, maj7, m7b5); context rules: "m7 followed by dom7 a 4th up" → ii7; "dom7 resolving down half-step" → subV7; "maj7 target of ii–V" → Imaj7; "m7b5 in minor cadence" → iiø7. Place in FunctionalLabelingEngine or shared module.</task>

### 21.7 – Functional Labeling Engine (REQ-HAT-06)

- <task id="W3-T2">**FunctionalLabelingEngine**  
  Input = chord sequence + segments. For each chord: determine key from segment, get Chord DNA (getChordDna), check context (prev/next chord); lookup Roman numeral and optional concept type (MajorII-V-I, TritoneSubstitution, etc.). Output = per-chord Roman numeral + concept type for overlay.</task>

### 21.8 – Constant-Structure Handling (REQ-HAT-08)

- <task id="W3-T3">**Chromatic / constant-structure segments**  
  When segment key is "chromatic" or constant-structure (half-step shift), do not force ii–V–I; label as "Key shift" or chord roots only; avoid bogus Roman numerals in FunctionalLabelingEngine.</task>

**Verification Wave 3**: FunctionalLabelingEngine returns Roman numerals for Dm7–G7–Cmaj7 (ii–V–I in C); Db7→Cmaj7 → subV7; chromatic segment → "Key shift" or roots only. Unit test with known progressions.

---

## Wave 4: Pipeline and JazzKiller Integration (REQ-HAT-09, REQ-HAT-10, REQ-HAT-11)

*Goal: Single analyze entry point; refactor JazzKiller overlay data source.*

### 21.9 – Preprocessing (REQ-HAT-09)

- <task id="W4-T1">**Preprocessing**  
  Convert song measures (iReal chord strings) to array of chord symbols with bar indices; reuse ChordDna/parsing; no duplicate logic. Same input shape as ConceptAnalyzer (e.g. measures from song.music).</task>

### 21.10 – Analysis Pipeline API (REQ-HAT-10)

- <task id="W4-T2">**analyzeHarmony() and harmonicAnalysisPipeline.ts**  
  Create harmonicAnalysisPipeline.ts: Preprocessing → TonalitySegmentationEngine → FunctionalLabelingEngine. Export `analyzeHarmony(songChords, options)` returning concepts (extended Concept: keySegment, romanNumeral, segmentLabel); backward compatible with AnalysisOverlay (type, startIndex, endIndex, metadata).</task>

### 21.11 – JazzKiller Overlay Refactor (REQ-HAT-11)

- <task id="W4-T3">**LeadSheet / analyze flow**  
  When song loads and "Show Analysis" is on, call analyzeHarmony (instead of or in addition to ConceptAnalyzer.analyze); pass result as patternsToDisplay. Overlay UI unchanged; optional tooltip or secondary line for key segment and Roman numeral. Verify: Blue Bossa (Cm7 = i), ATTYA (key segments + ii–V–I), one constant-structure tune; no regression in overlay visibility or click.</task>

**Verification Wave 4**: analyzeHarmony() returns Concept[] compatible with AnalysisOverlay; LeadSheet uses new pipeline when analysis on; Blue Bossa shows Cm7 = i; ATTYA shows key segments and ii–V–I; overlay brackets/colors/click unchanged.

---

## Wave 5 (Optional): Live Harmonic Grounding (REQ-HAT-12, REQ-HAT-13, REQ-HAT-14)

*Goal: Conflict Resolver (chart vs. SwiftF0) and Pedal Point Detection; optional Live Grounding API.*

### 21.12 – Conflict Resolver (REQ-HAT-12)

- <task id="W5-T1">**Conflict Resolver**  
  If chart says C7 but SwiftF0 (short window) shows student consistently playing F# and Bb (tritone sub), set or suggest subV7 label for overlay/feedback. Optional "live" mode in JazzKiller; annotate current segment/concept without replacing offline analysis.</task>

### 21.13 – Pedal Point Detection (REQ-HAT-13)

- <task id="W5-T2">**Pedal Point Detection**  
  If pitch detection shows sustained low pitch (e.g. G) while chords change (F/G, Eb/G), mark section as dominant pedal; override or annotate segment label ("Pedal (G)"). Optional; segment or overlay note for feedback.</task>

### 21.14 – Live Grounding API (REQ-HAT-14)

- <task id="W5-T3">**getLiveOverrides()**  
  API: `getLiveOverrides(chartChord, pitchBuffer): { romanNumeral?, pedal? }`. Consumes chart chord at time t and SwiftF0 stream/buffer; returns overrides for current segment. Lightweight; no full re-segmentation in real time.</task>

**Verification Wave 5**: With mic on, playing tritone sub over C7 → overlay or feedback shows subV7; sustained low G over changing chords → "Pedal (G)"; getLiveOverrides returns overrides; no regression when live grounding off.

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
