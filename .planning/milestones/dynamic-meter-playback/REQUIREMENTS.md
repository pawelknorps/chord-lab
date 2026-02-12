# Dynamic Meter Playback – Requirements

## v1 Requirements (Must-Have)

### Data & Time Map

- **DMP-01**: Song / chart data may include an optional `meterChanges` array. Each entry has `bar` (1-based), `top` (numerator), `bottom` (denominator). Example: `[{ bar: 1, top: 4, bottom: 4 }, { bar: 17, top: 3, bottom: 4 }]`.
- **DMP-02**: If `meterChanges` is absent or empty, behavior is unchanged: use a single default meter (e.g. `TimeSignature` or `meterSignal`) for the whole tune.
- **DMP-03**: A helper (e.g. `getMeterAtBar(barIndex, meterChanges, defaultMeter)`) returns the effective time signature for a given 0-based or 1-based bar index.

### Transport & Scheduler

- **DMP-04**: When a song with `meterChanges` is loaded and playback is started, schedule `Tone.Transport.timeSignature` at each change: for each `{ bar, top, bottom }`, schedule at `${bar - 1}:0:0` (start of that bar).
- **DMP-05**: Scheduled meter changes are cleared when the song is unloaded or playback is stopped (no leak of callbacks).
- **DMP-06**: Current meter for the active bar is available to the playback loop and to the UI (e.g. store or derive from time map + current bar so playhead and beat highlight use it).

### Bass & Drums Adaptation

- **DMP-07**: Walking bass (or equivalent) uses the **current bar’s meter**: in 4/4 use existing pattern (e.g. Root, 5th, Approach, Lead-in); in 3/4 use a waltz-appropriate pattern (e.g. Root on 1, then two notes or Root–5th–5th).
- **DMP-08**: Drums (ride pattern): in 4/4 use existing spang-a-lang; in 3/4 use a waltz ride (e.g. 1, 2, 3+). Comping density/pattern can be scaled by divisions per bar (existing meter translator already supports 3/4).

### Lead Sheet & UI

- **DMP-09**: Lead sheet can display bars with **variable width** by meter (e.g. 3/4 bar ≈ 75% of 4/4 width) so rhythmic “spatial awareness” is preserved.
- **DMP-10**: A **meter marker** (e.g. “3/4”) is shown at the beginning of a bar where the meter changes.
- **DMP-11**: **Current beat** highlight (and any beat-based UI) uses the meter for the **current bar** (e.g. 3 pulses per measure in 3/4), not a global meter.

### Integration

- **DMP-12**: `meterTranslator` (or equivalent) is used for all “position + meter → playback state” logic; the only change is that “meter” for a given tick is resolved from the time map by current bar, not from a single global signal for the whole song.
- **DMP-13**: No regression: songs without `meterChanges` behave exactly as today (single meter, existing playback and UI).

## v2 / Deferred

- **DMP-14**: UI to add/edit/remove meter changes (e.g. “Add meter change at bar N”).
- **DMP-15**: Import or infer `meterChanges` from iReal or other formats if supported.
- **DMP-16**: BPM changes mid-song (separate feature).

## Out of Scope

- Changing core clock (Tone.Transport) to anything other than a single BPM for the whole tune in v1.
- Full notation-style time signature display (beyond a simple meter marker at change bars).
