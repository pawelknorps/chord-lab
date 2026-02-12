# Dynamic Meter Playback – Roadmap

## Overview

Implement mid-song meter changes: time map in song data, Transport scheduling, band adaptation (bass/drums), and lead sheet visuals. Phases are ordered so that data and scheduler are in place before band and UI depend on them.

## Phase 1: Time Map & Meter-for-Bar

**Goal**: Song data and code support a `meterChanges` array; playback and UI can resolve “meter at bar N.”

| Task | Requirement | Notes |
|------|--------------|--------|
| Define `MeterChange` type and extend song/chart type with optional `meterChanges` | DMP-01 | e.g. `{ bar: number, top: number, bottom: number }[]` |
| Implement `getMeterAtBar(barIndex, meterChanges, defaultMeter)` (or equivalent) | DMP-02, DMP-03 | Return numerator/denominator or "4/4" string for a given bar |
| Ensure default behavior when `meterChanges` absent | DMP-02, DMP-13 | No change to existing single-meter flow |

**Success**: Any caller can ask “what is the meter at bar 17?” and get the correct signature from the time map or default.

---

## Phase 2: Transport Scheduler

**Goal**: Tone.Transport time signature is updated at the start of each bar where a meter change is defined.

| Task | Requirement | Notes |
|------|--------------|--------|
| When song loads (with `meterChanges`), schedule `Tone.Transport.schedule` for each change at `${bar-1}:0:0` | DMP-04 | Set `Tone.Transport.timeSignature = [top, bottom]` (or equivalent) in callback |
| Update “current meter” state (e.g. for UI) inside the same scheduled callback | DMP-06 | e.g. set store/signal so playhead and beat use it |
| Clear scheduled meter-change callbacks on unload/stop | DMP-05 | e.g. Transport.cancel or store schedule IDs and clear |

**Success**: Playing a tune with `meterChanges` causes Transport (and optional UI state) to switch meter at the correct bar.

---

## Phase 3: Playback Loop Uses Meter-for-Bar

**Goal**: The main playback loop (useJazzPlayback / useJazzBand) uses “meter at current bar” from the time map instead of a single global meter for the whole song.

| Task | Requirement | Notes |
|------|--------------|--------|
| In the loop callback, resolve current bar from Transport position, then get meter via `getMeterAtBar(bar, song.meterChanges, defaultMeter)` | DMP-06, DMP-12 | Feed that meter into existing meterTranslator (positionToPlaybackState etc.) |
| Keep single-meter behavior when `meterChanges` is absent | DMP-13 | Use existing meterSignal or song.TimeSignature as default |

**Success**: Chords, beat index, and divisions-per-bar in the loop match the time map for the current bar.

---

## Phase 4: Bass & Drums Adaptation

**Goal**: Bass and drums switch pattern when the meter changes (e.g. 4/4 → 3/4).

| Task | Requirement | Notes |
|------|--------------|--------|
| Walking bass: when current bar meter is 3/4, use waltz pattern (e.g. Root, filler, filler or Root–5th–5th) | DMP-07 | Extend or branch existing bass note/rhythm logic by divisionsPerBar / meter |
| Drums: when current bar meter is 3/4, use waltz ride (1, 2, 3+) instead of spang-a-lang | DMP-08 | Same: branch on current meter / divisionsPerBar in drum loop |
| Comping: already uses meter translator; ensure it receives meter-for-bar from Phase 3 | DMP-12 | Likely no extra change if loop already passes meter-for-bar |

**Success**: In a 4/4 → 3/4 tune, from the change bar onward, bass and drums clearly switch feel (waltz).

---

## Phase 5: Lead Sheet Visuals

**Goal**: Lead sheet reflects meter changes in layout and feedback.

| Task | Requirement | Notes |
|------|--------------|--------|
| Bar width by meter (e.g. 3/4 bar ≈ 75% of 4/4 width) | DMP-09 | Compute width per measure from current meter |
| Meter marker at change bars (e.g. “3/4” at start of bar 17) | DMP-10 | Render when measure index matches a meter change bar |
| Current beat highlight uses meter for current bar (3 pulses in 3/4) | DMP-11 | Use same getMeterAtBar + meterTranslator so highlight count matches |

**Success**: Visual bar widths, meter labels, and beat highlight all stay in sync with the time map and playback.

---

## Dependency Summary

- Phase 1 → Phase 2, 3, 5 (all need “meter at bar”).
- Phase 2 → Phase 3 (loop should see Transport + optional state already switching).
- Phase 3 → Phase 4 (bass/drums use the same meter-for-bar from the loop).
- Phase 3 → Phase 5 (UI can use same getMeterAtBar + current bar for width and highlight).

Recommended order: **1 → 2 → 3 → 4 → 5**.
