# Verification: Phase 14.4 – Temporal Alignment & BPM Heatmap

## Success criteria

- [x] **REQ-TA-01**: Total system lag computed via `getSystemLatency(ctx)` and used to look back in pitch history.
- [x] **REQ-TA-02**: Drill check uses latency-adjusted note via `useDrillWithLatency` → `registerPass(targetMidi)`.
- [x] **REQ-TA-03**: BPM Heatmap component renders Tempo (X) vs Accuracy (Y) with thermal trail and trend line.
- [ ] **REQ-TA-04** (optional): Round-trip calibration wizard — deferred.

## Files

- [x] `src/core/audio/LatencyEngine.ts` — getSystemLatency, getAdjustedNote, getAdjustedNoteClosest.
- [x] `src/core/audio/pitchHistory.ts` — ring buffer, start/stop, getPitchHistory / getSwiftF0History.
- [x] `src/modules/ITM/hooks/useDrillWithLatency.ts` — hook with registerPass and history lifecycle.
- [x] `src/modules/ITM/components/BpmHeatmap.tsx` — SVG heatmap and trend path.

## Manual checks

1. **LatencyEngine**: Unit test or manual: `getSystemLatency(ctx)` returns a positive number; `getAdjustedNote([{ timestamp: 1, midi: 60 }], 1.02, 0.02)` returns the entry (within 10 ms).
2. **Pitch history**: With mic and SwiftF0 active, start a drill that uses `useDrillWithLatency`; `getPitchHistory()` should fill with recent entries.
3. **BpmHeatmap**: Render with `data={[{ bpm: 120, accuracy: 0.95, timestamp: 1 }, ...]}`; green dot at top-left area, trend line visible when multiple points.

## Phase status

Phase 14.4 implementation is **complete** for Waves 1–3. Wave 4 (round-trip calibration) is optional and not implemented.
