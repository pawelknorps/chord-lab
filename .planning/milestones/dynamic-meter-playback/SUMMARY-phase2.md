# Phase 2: Transport Scheduler – Summary

## Done

- **meterTranslator.ts**
  - `scheduleMeterChanges(meterChanges, defaultMeter, onMeterChange?)` – schedules `Tone.Transport.schedule` for each change at `${change.bar - 1}:0:0`; callback calls `applyMeterToTransport(meter)` and `Tone.Draw.schedule` to run `onMeterChange(meter)` on the main thread. Returns array of event IDs.
  - `clearMeterChangeSchedules(ids)` – clears each scheduled event via `Transport.clear(id)` (DMP-05).

- **useJazzPlayback.ts**
  - When song has `meterChanges`: set initial meter from `getMeterAtBar(0, song.meterChanges, defaultMeter)` and apply; after `Transport.cancel()`, call `scheduleMeterChanges(..., (meter) => { meterSignal.value = meter; meterRef.current = parseMeter(meter); })` and store IDs in `meterScheduleIdsRef`.
  - Clear meter schedules: in effect cleanup, on end-of-tune stop (inside loop), and on user toggle stop.

- **useJazzBand.ts**
  - Same as useJazzPlayback: initial meter when song has meterChanges, schedule and store IDs, clear on effect cleanup, end-of-tune stop, and user toggle stop.

## Requirements

- DMP-04: Transport time signature scheduled at each meter-change bar ✅
- DMP-05: Scheduled callbacks cleared on unload/stop ✅
- DMP-06: Current meter state (meterSignal / meterRef) updated in callback for UI/playhead ✅

## Next

Phase 3: Playback loop uses “meter at current bar” from the time map (getMeterAtBar in the loop) so chords, beat index, and divisions-per-bar match the current bar’s meter.
