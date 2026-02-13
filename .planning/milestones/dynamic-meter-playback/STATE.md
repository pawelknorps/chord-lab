# Dynamic Meter Playback – State

## Milestone Status

| Phase | Status | Notes |
|-------|--------|--------|
| 1. Time Map & Meter-for-Bar | Done | SUMMARY-phase1.md, VERIFICATION.md |
| 2. Transport Scheduler | Done | SUMMARY-phase2.md |
| 3. Playback Loop Uses Meter-for-Bar | Done | SUMMARY-phase3.md |
| 4. Bass & Drums Adaptation | Done | SUMMARY-phase4.md |
| 5. Lead Sheet Visuals | Done | SUMMARY-phase5.md |

## Current Focus

- **Next**: Milestone complete; optional Phase 5 polish or /gsd-complete-milestone.

## Done

- Milestone created; PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md in place.
- **Phase 1**: MeterChange type, getMeterAtBar/getParsedMeterAtBar in meterTranslator; JazzStandard.meterChanges; getSongAsIRealFormat passes TimeSignature and meterChanges; meterTranslator.test.ts (6 tests).
- **Phase 2**: scheduleMeterChanges/clearMeterChangeSchedules in meterTranslator; useJazzPlayback and useJazzBand schedule meter changes on load, set initial meter and meterSignal in callback, clear on effect cleanup and on stop (DMP-04, DMP-05, DMP-06).
- **Phase 3**: In playback loop, resolve bar from Transport position, then get meter via getParsedMeterAtBar(bar, song.meterChanges, defaultMeter) when song has meterChanges; else use meterRef.current (DMP-06, DMP-12, DMP-13).
- **Phase 4**: Bass: generateWaltzWalkingLine + applyVariations(3-note line) when beatsPerBar === 3 in useJazzBand; BassRhythmVariator supports line.length 3 or 4. Drums: LinearDrummingEngine WALTZ_GRID and generatePhrase(barIndex, intensity, divisionsPerBar); DrumEngine.generateBar(..., divisionsPerBar); useJazzBand passes beatsPerBar. Comping already uses meter-for-bar from Phase 3 (DMP-07, DMP-08, DMP-12).
- **Phase 5**: LeadSheet: bar width by meter (rows of 4, width % = divisionsPerBar/rowWeight); meter marker at change bars (DMP-10); playhead left = (curBeat/divisionsPerBar)*100% (DMP-11). getMeterAtBar/getParsedMeterAtBar from meterTranslator; non-destructive when no meterChanges (equal 25% width, no markers).

## Non-destructive invariant

- **No meterChanges**: No scheduler; loop uses `meterRef.current`; bass/drums use existing 4/4 paths.
- **meterChanges present but current bar is 4/4**: Transport may switch at change bars; loop uses time map; bass/drums still use 4/4 pattern for 4/4 bars.
- **3/4 only when resolved**: Waltz bass and waltz drums run only when `beatsPerBar === 3` / `divisionsPerBar === 3`.

## Blockers

- None.
