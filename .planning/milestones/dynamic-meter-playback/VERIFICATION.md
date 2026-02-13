# Dynamic Meter Playback – Verification

## Phase 1: Time Map & Meter-for-Bar ✅

| Requirement | Verification |
|-------------|--------------|
| DMP-01 | `MeterChange` type and optional `meterChanges` on JazzStandard and on getSongAsIRealFormat return value. |
| DMP-02 | `getMeterAtBar(barIndex, undefined, defaultMeter)` and `getMeterAtBar(barIndex, [], defaultMeter)` return defaultMeter. |
| DMP-03 | `getMeterAtBar(16, [{ bar: 1, top: 4, bottom: 4 }, { bar: 17, top: 3, bottom: 4 }], '4/4')` returns `'3/4'`. |
| DMP-13 | No change to playback when song has no meterChanges; existing meterSignal/TimeSignature path unchanged. |

**Tests**: `src/modules/JazzKiller/utils/meterTranslator.test.ts` – 6 tests passing (default, empty, first bar, boundary, unsorted, getParsedMeterAtBar).

## Phase 2: Transport Scheduler ✅

| Requirement | Verification |
|-------------|--------------|
| DMP-04 | When a song with meterChanges is loaded, scheduleMeterChanges() runs for each change at `${bar-1}:0:0`; callback calls applyMeterToTransport(meter). |
| DMP-05 | clearMeterChangeSchedules(ids) used in effect cleanup and on Transport.stop() (toggle stop + end-of-tune stop) in both useJazzPlayback and useJazzBand. |
| DMP-06 | onMeterChange callback sets meterSignal and meterRef so UI/playhead see current meter. |

**Implementation**: meterTranslator.ts – scheduleMeterChanges(), clearMeterChangeSchedules(); useJazzPlayback.ts and useJazzBand.ts – schedule on song load with meterChanges, clear on cleanup and stop.

## Phase 3: Playback Loop Uses Meter-for-Bar ✅

| Requirement | Verification |
|-------------|--------------|
| DMP-06, DMP-12 | In loop callback: bar from position string; when song.meterChanges?.length, m = getParsedMeterAtBar(barFromPosition, s.meterChanges, defaultMeter); else m = meterRef.current; state = positionToPlaybackState(positionString, m). |
| DMP-13 | When meterChanges absent, loop uses meterRef.current (unchanged single-meter behavior). |

**Implementation**: useJazzPlayback.ts and useJazzBand.ts – loop uses getParsedMeterAtBar(barFromPosition, s.meterChanges, defaultMeter) when song has meterChanges; otherwise meterRef.current.

## Phase 4: Bass & Drums Adaptation ✅

| Requirement | Verification |
|-------------|--------------|
| DMP-07 | When beatsPerBar === 3 in useJazzBand, bass uses JazzTheoryService.generateWaltzWalkingLine (Root, 5th/3rd, 5th) and BassRhythmVariator.applyVariations with 3-note line; no push in 3/4. |
| DMP-08 | LinearDrummingEngine has WALTZ_GRID (1, 2, 3); generatePhrase(barIndex, intensity, divisionsPerBar) uses waltz ride and hi-hat on 2 & 3 when divisionsPerBar === 3; DrumEngine.generateBar(..., divisionsPerBar); useJazzBand passes beatsPerBar. |
| DMP-12 | Comping and piano pattern already use state from positionToPlaybackState(meter-for-bar); no extra change. |

**Implementation**: JazzTheoryService.generateWaltzWalkingLine; BassRhythmVariator line.length support; useJazzBand 3/4 bass branch; DrumEngine/LinearDrummingEngine waltz grid and divisionsPerBar.

## Phase 5: Lead Sheet Visuals ✅

| Requirement | Verification |
|-------------|--------------|
| DMP-09 | LeadSheet: rows of 4 measures; each measure width = (divisionsPerBar / rowWeight)*100% via getParsedMeterAtBar(index, song.meterChanges, defaultMeter). 3/4 bar ≈ 75% of 4/4 in same row. |
| DMP-10 | When song.meterChanges has entry with bar === index+1, show meter label (e.g. "3/4") at top-right of that measure. |
| DMP-11 | Playhead left = (curBeat / parsed.divisionsPerBar)*100% for the active measure’s parsed meter (3 pulses in 3/4). |

**Implementation**: LeadSheet.tsx – getMeterAtBar, getParsedMeterAtBar; variable-width rows; meter marker; playhead by divisionsPerBar. Non-destructive: no meterChanges → equal 25% width, no markers, playhead still curBeat/4.
