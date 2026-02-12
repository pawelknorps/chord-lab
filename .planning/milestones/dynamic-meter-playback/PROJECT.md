# Dynamic Meter Change Playback – Project Vision

## Vision Statement

Upgrade the JazzKiller player so that **meter can change mid-song** (e.g. 4/4 → 3/4 at a specific bar), moving beyond the "static loop" limitation of a single `TimeSignature` per tune. The global clock stays continuous; bar logic and band patterns adapt to a **time map** of meter changes.

## Problem Statement

- Songs currently have a single `TimeSignature` (e.g. `"4/4"` or `"3/4"`) per tune.
- Playback and lead sheet assume one meter for the entire song.
- Real charts (e.g. "Jazz Waltz Experiment") may switch from 4/4 to 3/4 at bar 17; the app cannot represent or play that today.

## Core Value Proposition

**"One clock, many meters."**

1. **Time map**: Song data supports `meterChanges` (bar → signature) so each bar can have the correct time signature.
2. **Transport scheduling**: Tone.Transport time signature is updated at the start of the bar where the change occurs, so metronome and swing stay accurate.
3. **Band adaptation**: Walking bass, drums (ride pattern), and comping recalculate rhythmic patterns when the meter changes (e.g. 4/4 spang-a-lang → 3/4 waltz ride).
4. **Visual flow**: Lead sheet shows variable bar width (e.g. 3/4 bar ≈ 75% width of 4/4), meter markers at change points, and beat highlight in sync with the current meter.

## Target Audience

- **Jazz students** practicing tunes with mixed meters.
- **Teachers** using realistic charts that include meter changes.
- **Developers** maintaining a single, decoupled design: global clock vs bar/meter logic.

## Core Functionality (The ONE Thing)

**Playback and UI respect a per-bar meter map: at bar N the correct time signature is applied and all band parts and visuals use it.**

Students must be able to:
- Load a song that defines meter changes (e.g. `meterChanges: [{ bar: 1, top: 4, bottom: 4 }, { bar: 17, top: 3, bottom: 4 }]`).
- Hear and see the switch (e.g. 4/4 → 3/4) at the right bar without glitches.
- See the lead sheet reflect different bar widths and beat counts per meter.

## Key Requirements (High-Level)

- **Song DNA**: Support a `meterChanges` array (bar number → top/bottom) alongside or instead of single `TimeSignature`; default to one global meter when absent.
- **Transport logic**: Schedule `Tone.Transport.timeSignature` at the start of each bar where a change is defined; update UI/state (e.g. current meter) at that time.
- **Bass adaptation**: 4/4 → Root, 5th, Approach, Lead-in; 3/4 → Jazz waltz (e.g. Root on 1, two filler notes or Root–5th–5th).
- **Drums adaptation**: 4/4 → spang-a-lang (1, 2+, 3, 4+); 3/4 → waltz ride (1, 2, 3+).
- **Lead sheet**: Dynamic bar width by meter; meter marker at change bars; current-beat highlight synced to current meter (e.g. 3 pulses per measure in 3/4).

## Technical Constraints

- Reuse existing `meterTranslator.ts` and playback hooks (`useJazzPlayback`, `useJazzBand`); extend with a **meter-for-bar** lookup from the time map.
- Tone.Transport remains the single clock; schedule signature changes with `Tone.Transport.schedule()` at `${bar-1}:0:0`.
- iReal-derived data (e.g. `standards.json`) has only `TimeSignature` today; `meterChanges` can be optional and editor/import can add it later.

## Out of Scope (v1)

- Editing meter changes in the UI (can be v2: e.g. "Add meter change at bar N").
- Importing meter changes from iReal (format may not support it); manual or script-generated time maps first.
- Changing BPM mid-song (separate future upgrade).

## Success Metrics

- A tune with `meterChanges` (e.g. 4/4 for bars 1–16, 3/4 from bar 17) plays without drift; Transport and bar index stay aligned.
- Bass and drums switch pattern at the change bar (e.g. waltz feel from bar 17).
- Lead sheet shows correct bar widths and meter markers; playhead and beat highlight match the active meter.

## Key Decisions

| Decision | Rationale | Status |
|----------|-----------|--------|
| Time map as array of { bar, top, bottom } | Simple, sortable, one entry per change; bar 1 = first bar. | [Proposed] |
| Schedule signature at bar start | Tone.Transport.schedule at `${change.bar - 1}:0:0` keeps downbeat accurate. | [Proposed] |
| Decouple "meter for current bar" from global signal | Playback loop derives meter from time map + current bar; UI can show current meter from same source. | [Proposed] |
