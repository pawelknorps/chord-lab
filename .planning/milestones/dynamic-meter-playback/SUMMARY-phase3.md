# Phase 3: Playback Loop Uses Meter-for-Bar – Summary

## Done

- **useJazzPlayback.ts** and **useJazzBand.ts**
  - In the playback loop callback: parse bar from `Tone.Transport.position.toString()` (first segment).
  - When `s.meterChanges?.length`: `m = getParsedMeterAtBar(barFromPosition, s.meterChanges, defaultMeter)` with `defaultMeter = s.TimeSignature ?? meterSignal.value ?? '4/4'`.
  - When no meterChanges: `m = meterRef.current` (unchanged single-meter behavior, DMP-13).
  - `state = positionToPlaybackState(positionString, m)` so chords, beat index, and divisions-per-bar match the time map for the current bar (DMP-06, DMP-12).

## Requirements

- DMP-06, DMP-12: Loop uses meter-for-bar from time map ✅
- DMP-13: No regression when meterChanges absent ✅

## Next

Phase 4: Bass and drums adapt to current bar meter (e.g. 3/4 waltz pattern).
