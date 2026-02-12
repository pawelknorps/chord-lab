# Phase 21 Research: Tonality Segmentation and Functional DNA Mapping

## 1. Tonality Segmentation (DP/Viterbi)

- **Goal**: Find the path of key centers that minimizes total cost J = Σ Fit(Chord_i, Key_k) + Σ Transition(Key_i, Key_{i+1}) over the tune.
- **Fit**: How well chord i belongs to key k (diatonic = low cost; secondary dominant / borrowed = medium; chromatic = high). Can use scale-degree membership (Tonal.js Key, Chord.root, scale degrees) or pitch-class set distance.
- **Transition**: Penalty for modulating. Circle-of-fifths distance (C→F = 1, C→Db = 6); relative major/minor (C↔Am) = low penalty. Prefer few, coherent segments.
- **Viterbi**: Standard dynamic programming: for each time step and each key state, compute best cost to reach that state; backpointer for path; then backtrack for optimal key sequence. Merge consecutive same-key slots into segments.
- **References**: Common in MIR (music information retrieval) for key detection and segmentation; same idea as HMM decoding (states = keys, emissions = chords).

## 2. Functional DNA Mapping (Chord DNA + Context → Roman Numeral)

- **Chord DNA**: Existing ChordDna gives root, triad core (3rd, 5th), extension (7th, alterations). Use to classify: m7, dom7, maj7, m7b5, etc.
- **Context**: Previous and next chord (or segment). Examples:
  - m7 followed by dom7 a 4th up → ii7 (in major) or i in minor (if no dom7 resolution).
  - dom7 resolving down half-step (e.g. Db7 → Cmaj7) → subV7 (tritone sub).
  - maj7 as target of ii–V → Imaj7.
  - m7b5 in minor cadence (e.g. Dm7b5–G7–Cm) → iiø7.
- **Jazz cliché dictionary**: Table or rules mapping (Chord DNA pattern, prev chord, next chord, key) → Roman numeral + optional concept type (MajorII-V-I, TritoneSubstitution, etc.). Extendable for back-door, I–VI–ii–V, modal interchange.

## 3. Constant-Structure and Chromatic Segments

- **Problem**: So What, Inner Urge style tunes have no single key; chord-by-chord Roman numerals are misleading.
- **Approach**: Let Viterbi produce "chromatic" or "key-shift" segments when the best path shows half-step or parallel movement. In Functional Labeling, for such segments do not force ii–V–I; label as "Key shift" or show chord roots only; avoid wrong functional labels.

## 4. SwiftF0 Live Harmonic Grounding

- **Conflict Resolver**: Chart says C7; student (SwiftF0) consistently plays F# and Bb (tritone sub). Compare pitch-class set from SwiftF0 over a short window (e.g. 1–2 bars) with chart chord; if dominant and pitch set matches tritone sub, set or suggest subV7 label in overlay or feedback.
- **Pedal Point Detection**: Student sustains low pitch (e.g. G) while chords change (F/G, Eb/G). Detect stable bass pitch over several chords; if chord symbols already indicate slash/pedal, confirm; else infer from SwiftF0 and mark segment as "Pedal (G)".
- **Performance**: Lightweight; no full re-segmentation in real time. Use same SwiftF0 pipeline as ITM / JazzKiller (useITMPitchStore, pitch buffer or recent notes).

## 5. Integration with Existing Code

- **ConceptAnalyzer**: Currently detects fixed patterns (ii–V–I, tritone sub, etc.) in isolation. New pipeline can **replace** the analyze call for JazzKiller overlay or **wrap** ConceptAnalyzer (e.g. run segmentation + labeling first, then merge with existing concept types for backward compatibility).
- **AnalysisTypes**: Extend `Concept` with optional `keySegment?: { startBar, endBar, key }`, `romanNumeral?: string`, `segmentLabel?: string` so overlay can show key and Roman numeral without breaking existing CONCEPT_COLORS and AnalysisBracket.
- **ChordDna, functionalRules**: Reuse as-is for chord structure and enharmonic spelling; no API change.

## 6. Tunable Parameters

- Fit weights: diatonic vs secondary dominant vs borrowed vs chromatic.
- Transition weights: circle-of-fifths step penalty; relative major/minor bonus.
- Segment merge: minimum segment length (e.g. 1 bar) to avoid flicker; optional smoothing (penalize very short key changes).
