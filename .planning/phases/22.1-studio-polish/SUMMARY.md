# Phase 22.1 Summary: Studio Polish

## Objective

When a user puts on headphones, the app must **sound like a mastered record, not a MIDI file** ($29/mo justification). Deliver: parallel compression 70/30 with 8:1 fast-attack wet bus, Drum Bus +2 dB @ 12 kHz, Master ~-14 LUFS, and Note Waterfall at 60fps decoupled from audio ticks.

## Wave 1: Parallel Compression Bus (NY Trick)

- **STUDIO-01**: In `globalAudio.ts`, set `PARALLEL_DRY_GAIN = 0.7` and added `PARALLEL_WET_GAIN = 0.3`. Introduced `parallelWetGain` node so wet path (compressor/worklet) feeds into it; dry and wet sum at `parallelSumGain`. Blend is 70% dry / 30% wet; mute/solo/volume unchanged.
- **STUDIO-02**: Worklet compressor: `tryUseJazzCompressorWorklet()` now passes `ratio: 8`, `attack: 0.005`. Tone.Compressor fallback set to `ratio: 8`, `attack: 0.005`. `jazz-compressor-processor.js` already accepted ratio/attack from processorOptions.
- **STUDIO-03**: Topology verified: DryBus and WetBus both receive trio sum; WetBus goes through Worklet (or Tone) Compressor into parallelWetGain; dry 0.7 and wet 0.3 sum at parallelSumGain; sum feeds existing master chain.

## Wave 2: Air Band and Auto-Leveling (LUFS)

- **STUDIO-04**: `drumsAirBand` (Tone.Filter high-shelf 12 kHz) gain changed from 3 to 2 dB (REQ-STUDIO-04).
- **STUDIO-05**: Added `masterOutputGain` (Tone.Gain 1.8) before `masterLimiter`. Master chain: masterBus → masterEQ → masterOutputGain → masterLimiter → destination. Targets ~-14 LUFS on typical trio playback; tune gain if measured LUFS differs.
- **STUDIO-05-VERIFY**: Milestone STATE.md Phase 2 checklist updated.

## Wave 3: Visualizer Interpolation (60fps Note Waterfall)

- **STUDIO-06**: In `NoteWaterfall.tsx`, replaced Transport time with wall-clock time. `wallClockSeconds()` uses `performance.now()/1000`. Notes store `startTime: wallClockSeconds()` on push; `animate()` uses `now = wallClockSeconds()` so scroll age is rAF-driven. Removed Tone dependency from time base; animation stays smooth at 60fps independent of Transport/audio load.
- **STUDIO-06-VERIFY**: STATE.md Phase 3 checklist updated.

## Files Modified

- `src/core/audio/globalAudio.ts`: 70/30 blend, parallelWetGain, Worklet 8:1/5 ms attack, Compressor fallback 8:1/5 ms, drumsAirBand gain 2, masterOutputGain 1.8.
- `public/worklets/jazz-compressor-processor.js`: No change (already accepted ratio/attack).
- `src/modules/JazzKiller/components/NoteWaterfall.tsx`: Wall-clock time base; Tone import removed for time logic.
- `.planning/milestones/studio-polish/STATE.md`: All phase checklists marked complete.

## Success Criteria

- REQ-STUDIO-01..06 satisfied; no regression on mute/solo/volume.
