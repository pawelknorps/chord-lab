# Jazz Band Comping Evolution – Requirements

## Phase 1: Markov Pattern Engine and Tagging

### REQ-JBCE-01: Pattern Type and Tagging

- **Requirement**: Every pattern in the library (or those used by the Smart Pattern Engine) is tagged with a **pattern type** and optional metadata.
- **Types**: At least `LOW_ENERGY` | `MEDIUM_ENERGY` | `HIGH_ENERGY` | `FILL`.
- **Metadata**: Optional Energy Level (1–5), Connectivity Score, or category for future matrix tuning.
- **Integration**: Pattern selection (e.g. `getPatternForBar()`) filters by type; engines receive the selected pattern and its type.

### REQ-JBCE-02: Markov Transition Matrix

- **Requirement**: Implement a **Markov Pattern Engine** that, given the current pattern type, returns the next pattern type according to a probability matrix.
- **Matrix**: Row = current type; Column = next type. Example: LOW → [0.70, 0.20, 0.05, 0.05]; FILL → [0.40, 0.40, 0.20, 0.00] (no FILL→FILL).
- **Invocation**: Called every 4 or 8 bars (or at beat 0 of a bar) to decide the next vibe; computation &lt;1ms so it does not block Transport.
- **Output**: Next `PatternType`; then select a concrete pattern from the library for that type (random within type to avoid exact repetition).

### REQ-JBCE-03: Pattern Selection API

- **Requirement**: The engine exposes `getNextPatternType()` and `getPatternForBar()` (or equivalent) so useJazzBand (or band loop) can request the next pattern for the upcoming bar(s).
- **Behavior**: `getNextPatternType()` uses the Markov matrix; `getPatternForBar()` returns a specific pattern (MIDI/data) from the library for that type, with optional random choice among same-type patterns.
- **State**: Engine holds `currentType` and optionally recent history (e.g. last 4 types) for repetition penalty or future tuning.

## Phase 2: Stochastic Humanization

### REQ-JBCE-04: Bass Micro-Timing Offsets

- **Requirement**: Apply a **micro-timing offset** to each bass note in the pattern so that notes are not perfectly on the grid.
- **Range**: Per-note random offset in a range such as −5ms to +2ms (slightly “behind” the beat for weight).
- **Application**: Applied at schedule time (e.g. when converting pattern to Tone.Transport events); does not change the stored pattern.

### REQ-JBCE-05: Piano Velocity Humanization

- **Requirement**: Apply a **velocity variation** to comping chord hits so that no two hits are identical.
- **Method**: Gaussian blur or ±10% variation around the pattern’s base velocity; applied at schedule time.
- **Goal**: Velocity fluctuates naturally within a small range; no robotic “same force every time.”

### REQ-JBCE-06: Ghost-Note Probability Gate

- **Requirement**: For snare/hi-hat ghost notes (or equivalent), apply a **probability gate**: play the note only with a configurable probability (e.g. 60%).
- **Application**: At schedule time, for events tagged or identified as “ghost,” roll random; skip event if below threshold.
- **Goal**: Loop “breathes”; ghost notes are not every bar identically.

## Phase 3: Procedural Lead-Ins

### REQ-JBCE-07: Last Eighth Procedural Note

- **Requirement**: The **last eighth note** of any bar is **procedural**, not from the pattern: compute a chromatic or dominant approach to the **next chord’s root**.
- **Logic**: Reuse Functional Decomposition / WalkingBassEngine approach logic (chromatic from below/above, 5th-of-destination, etc.).
- **Input**: Current chord, next chord (from chart/playback), current meter; output: one note (pitch + timing) for the last eighth.
- **Integration**: When scheduling the bar, override (or replace) the last eighth of the pattern with this procedural note for bass (and optionally other instruments if specified).

### REQ-JBCE-08: Lead-In Harmony Awareness

- **Requirement**: Procedural lead-in uses the **actual next chord** from the lead sheet/playback plan so the line always connects to the harmony.
- **Integration**: useJazzBand (or band loop) provides `currentChord` and `nextChord` at bar boundary; procedural lead-in module uses these.

## Phase 4: Rhythmic Density Tracker and Markov Bridge (Optional / Soloist-Responsive)

### REQ-JBCE-09: RhythmicDensityTracker

- **Requirement**: Implement a **RhythmicDensityTracker** that, given real-time SwiftF0 (or pitch store) output, maintains a sliding window of **onsets** and exposes a **density** value (0–1).
- **Onset logic**: Register a “hit” when confidence &gt; threshold and (pitch jump &gt; 20Hz or RMS spike above threshold).
- **Window**: e.g. 4 seconds; drop onsets older than window.
- **Output**: `getDensity()` returns a value derived from onset count in window (e.g. notes-per-second–style, normalized so 0 = no activity, 1 = “shredding”).
- **Integration**: Called from the same place that feeds useITMPitchStore / SwiftF0 (e.g. Audio Worklet or pitch pipeline); does not replace pitch logic, only adds onset counting.

### REQ-JBCE-10: MarkovBridge (Density → Matrix Bias)

- **Requirement**: A **MarkovBridge** (or equivalent) updates the Markov engine’s effective behavior based on **soloist density** from RhythmicDensityTracker.
- **Behavior**: If density &gt; 0.75 → bias transition matrix toward HIGH_ENERGY; if density &lt; 0.3 → bias toward LOW_ENERGY; else MEDIUM. Do not flip instantly; adjust **probabilities** so transitions remain smooth.
- **Integration**: When soloist-responsive mode is on, useJazzBand (or band loop) calls `updateBandVibe(tracker, engine)` (or equivalent) with current density; engine uses biased matrix for next `getNextPatternType()`.
- **Optional**: Can be the same “soloist activity” used by Phase 19 (Soloist-Responsive Playback), with density as an alternative or complement to activity level.

## Phase 5 (Future): Meter Independence

### REQ-JBCE-11: Rhythmic Fragments (Atoms) [Deferred]

- **Requirement**: Store patterns as **rhythmic fragments** (e.g. 1-beat atoms) rather than full bars so that recombination can produce any meter (5/4, 7/8, etc.).
- **Recombination rule**: e.g. 5/4 = three “Normal” atoms + two “Syncopated”; 7/8 = three “Normal” + one “Shortened” (eighth-note).
- **Out of scope for v1**: Document as future requirement; implement when dynamic meter and pattern atomization are prioritized.

## Out of Scope (v1)

- Full re-authoring of all patterns from scratch.
- Changing tempo or meter based on soloist (density/energy only in this milestone).
- New stem sets or mixer changes beyond humanization and selection.
- REQ-JBCE-11 (meter independence) is deferred.

## Summary Table: Pattern Categories

| State   | Feel                          | Best For                    |
|--------|-------------------------------|-----------------------------|
| LOW    | Spaced-out piano, root-note bass | Head in/out, ballad sections |
| MEDIUM | Standard “Spang-a-lang”, walking bass | Solos, standard swing       |
| HIGH   | Syncopated comping, walking bass with “ghosts” | Peak of solo, trading 4s    |
| FILL   | Snare/tom accents, chromatic bass lead-in | Transitions at bar 8, 16, 32 |
