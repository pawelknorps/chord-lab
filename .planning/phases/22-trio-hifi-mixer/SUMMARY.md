# Phase 22: Trio Hi-Fi Mixer – Summary

**Focus**: Make JazzKiller trio playback consistent and hi-fi via parallel (NY) bus, soft-knee compressor, RMS-matching makeup gain, and drums Air band.

## Delivered

- **Wave 1 (REQ-HIFI-01, REQ-HIFI-02, REQ-HIFI-08)**: Parallel bus in `globalAudio.ts`: trio sum → dry Gain(0.4) + wet compressor → parallelSumGain → masterBus. Pro Mix toggle in Mixer; when off, dry gain 0 (compressor-only).
- **Wave 2 (REQ-HIFI-03–05)**: Soft-knee compressor worklet `jazz-compressor-processor.js` (ratio 4, knee 30 dB, attack 5 ms, release 150 ms). Wet path uses worklet when loaded; fallback Tone.Compressor. Trio (piano, bass, drums) feeds both dry and wet.
- **Wave 3 (REQ-HIFI-06–08)**: Input/output RMS via Tone.Meter (normalRange); makeup gain node between parallelSumGain and masterBus; makeup = inputRms/outputRms (clamp 0.25–4), update every 100 ms when Pro Mix on; when off, makeup = 1.
- **Wave 4 (REQ-HIFI-09)**: Drums Air band: Tone.Filter highshelf +3 dB @ 12 kHz; drumsVol → drumsAirBand → trioSum.

## Commits

- feat(phase-22): Wave 1 – parallel bus and Pro Mix toggle
- feat(phase-22): Wave 2 – soft-knee compressor worklet
- feat(phase-22): Wave 3 – RMS-matching makeup gain
- feat(phase-22): Wave 4 – drums Air band (in same tree as Wave 3)

## Next

- Optional: user-editable compressor params (preset-only for v1); true peak / lookahead in worklet (v1.1).
- Recommend `/gsd-complete-milestone` for trio-hifi-mixer or proceed to next phase.
