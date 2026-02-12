# Creative Jazz Trio Playback – Requirements

## Phase 1: Place-in-Cycle and Style Tag

### REQ-TRIO-01: Place-in-Cycle Resolver

- **Requirement**: Implement a resolver that, given current playback state (loopCount, playback plan index, measure index within section, section labels), returns a **place-in-cycle** role.
- **Roles**: At least `intro` | `head` | `solo` | `out head` | `ending`. Optional: `first chorus`, `last chorus` for finer control.
- **Input**: useJazzBand (or shared playback state) provides: total loops, current loop index, current measure index in playback plan, section label for current measure (e.g. from JazzSection.Label), and optionally “is first measure of section” / “is ending.”
- **Output**: Single role per bar (or per beat 0) so RhythmEngine, DrumEngine, and bass logic can read it.
- **Integration**: Expose via a signal or ref (e.g. `placeInCycleSignal` or `getPlaceInCycle()`) consumed in the band loop.

### REQ-TRIO-02: Song-Style Tag

- **Requirement**: Derive a **style tag** from song metadata (Rhythm, CompStyle, Tempo) and optionally section.
- **Tags**: At least `Ballad`, `Medium Swing`, `Up-tempo`, `Latin`, `Bossa`, `Waltz`. Default `Medium Swing` when unknown.
- **Mapping**: Use existing `song.style` (Rhythm), `song.compStyle` (CompStyle), and `song.Tempo` (or current BPM) to select tag; e.g. Ballad if style/compStyle contains “ballad” or tempo &lt; 90; Latin if “Latin”/“Bossa”/“Samba”; Waltz if 3/4.
- **Integration**: Style tag available in useJazzBand loop (e.g. `songStyleSignal` or passed with song context) so all engines can read it.

## Phase 2: Song-Style Matrix and Engine Rules

### REQ-TRIO-03: Style-Driven Comping (RhythmEngine)

- **Requirement**: RhythmEngine (or ReactiveCompingEngine) selects pattern density and character based on **style tag** and **place-in-cycle**.
- **Behavior**: Ballad → favor sustain, sparse hits; Medium Swing → standard comping; Up-tempo → lighter, more anticipations; Latin/Bossa → appropriate pattern set (e.g. clave-aware or bossa comping); Waltz → 3-beat patterns.
- **Goal**: Audibly distinct comping between Ballad and Medium Swing; Latin/Waltz feel when applicable.

### REQ-TRIO-04: Style-Driven Bass (WalkingBassEngine / BassRhythmVariator)

- **Requirement**: Bass feel and variation probability depend on **style tag** and **place-in-cycle**.
- **Behavior**: Ballad → half-time walk or pedal option, very low variation probability; Medium → standard walking, moderate variation; Up-tempo → walking with possible “skip”/“rake” when activity high; Latin/Bossa → appropriate pattern (e.g. two-feel or bossa pattern); Waltz → 3-note per bar.
- **Goal**: Bass clearly “fits” the style (ballad vs medium vs Latin).

### REQ-TRIO-05: Style-Driven Drums (DrumEngine)

- **Requirement**: DrumEngine selects density and character (ride vs brushes, kick/snare pattern) based on **style tag** and **place-in-cycle**.
- **Behavior**: Ballad → brushes or light ride, sparse kick/snare; Medium → standard ride, 2 and 4; Up-tempo → busier ride, optional simplification when piano dense; Latin/Bossa → appropriate groove (e.g. bossa pattern); Waltz → 3/4 time feel.
- **Goal**: Drums match the song style and do not overpower ballads.

## Phase 3: Soloist Space and Interaction

### REQ-TRIO-06: Soloist-Space Policy

- **Requirement**: When **place-in-cycle** is `solo` and/or **style tag** is `Ballad`, apply a “soloist space” policy: cap comping density, bias toward sustain patterns, reduce bass variation probability, optionally half-time or pedal bass.
- **Behavior**: Comping density upper bound (e.g. max 0.5 in ballad/solo); RhythmEngine bias toward Sustain/Pedal; BassRhythmVariator variation probability reduced or zero in ballad/solo; existing “ballad first cycle” half-time walk can extend to “solo” place or full ballad.
- **Goal**: In ballads and during solo choruses, the band leaves clear space; no “wall of comping.”

### REQ-TRIO-07: Cross-Instrument Interaction (Refinement)

- **Requirement**: Ensure piano, bass, and drums react to each other in a coherent way using **place-in-cycle**, **style**, and existing **activity** / **tension** signals.
- **Behavior**: (1) Piano density high → drums simplify (existing); (2) Comping sparse (soloist space) → bass can use more color/variation only when style allows; (3) Place “solo” → all three reduce density together; (4) Activity high + place “out head” or “last chorus” → band can build.
- **Goal**: Trio feels like a single unit responding to form and energy, not three independent loops.

### REQ-TRIO-08: Band Loop Integration

- **Requirement**: useJazzBand (and any shared playback hook) computes **place-in-cycle** and **style tag** once per bar (or at beat 0) and passes them into RhythmEngine, DrumEngine, WalkingBassEngine, BassRhythmVariator, and ReactiveCompingEngine; all engines use these inputs in addition to existing activity/tension/BPM.
- **Goal**: Single source of truth for “where we are” and “what kind of tune” so behaviour is consistent and testable.

## Out of Scope (v1)

- User-editable “band personality” or “space level” sliders.
- AI soloist that the band follows.
- New stem sets per style (reuse existing mixer and samples).

## Summary Table

| ID | Requirement | Phase |
|----|-------------|--------|
| REQ-TRIO-01 | Place-in-cycle resolver | 1 |
| REQ-TRIO-02 | Song-style tag | 1 |
| REQ-TRIO-03 | Style-driven comping | 2 |
| REQ-TRIO-04 | Style-driven bass | 2 |
| REQ-TRIO-05 | Style-driven drums | 2 |
| REQ-TRIO-06 | Soloist-space policy | 3 |
| REQ-TRIO-07 | Cross-instrument interaction | 3 |
| REQ-TRIO-08 | Band loop integration | 3 |
