# Summary: Phase 14.4 – Temporal Alignment (Time-Travel) & BPM Heatmap

Phase 14.4 adds the **Time-Travel** solution for the Incredible Teaching Machine: the app no longer judges the student's notes as "late" purely due to system latency. It also adds the **BPM Heatmap** (Stability vs Speed) UI.

## Delivered

1. **LatencyEngine** (`src/core/audio/LatencyEngine.ts`)
   - `getSystemLatency(ctx)`: outputLatency + inputLag (20 ms) + inferenceLag (16 ms).
   - `getAdjustedNote(history, targetTime, lag)`: returns the pitch-history entry at `targetTime - lag` (within 10 ms).
   - `getAdjustedNoteClosest(history, targetTime, lag, maxDelta)`: robust lookup when history is sparse.

2. **Pitch history** (`src/core/audio/pitchHistory.ts`)
   - Ring buffer of `{ timestamp, midi }` filled by polling `getLatestPitch()` at ~60 Hz.
   - `startPitchHistory(readPitch, pollMs)`, `stopPitchHistory()`, `getPitchHistory()` / `getSwiftF0History()`.
   - `initPitchHistory({ capacity, getNowSeconds })` for Tone.now() integration.

3. **useDrillWithLatency** (`src/modules/ITM/hooks/useDrillWithLatency.ts`)
   - Starts/stops pitch history when `active` and store is ready.
   - `registerPass(targetMidi)`: uses `getSystemLatency`, `getPitchHistory`, and `getAdjustedNote` (or `getAdjustedNoteClosest`); calls `onSuccess` / `onFailure` accordingly.
   - Returns `registerPass`, `getPitchHistory`, `getSystemLatency` for integration into bass-note drills or guided practice.

4. **BpmHeatmap** (`src/modules/ITM/components/BpmHeatmap.tsx`)
   - Props: `data: { bpm, accuracy, timestamp }[]`.
   - SVG grid: X = BPM (normalized to 300), Y = accuracy (inverted); green points for accuracy > 0.9, red otherwise; trend path.
   - "Stability vs. Speed" heading; reusable in drill reports or Standards Exercises.

## Not in this phase

- **Round-trip calibration wizard** (2 s bip → mic → measured lag): left as optional / Pro for a follow-up phase.

## Integration notes

- Any drill that checks "did the student play targetMidi on this beat?" can use `useDrillWithLatency` and call `registerPass(targetMidi)` at beat time instead of comparing `getLatestPitch()` directly.
- BpmHeatmap can be wired to drill session data (e.g. aggregate by BPM and accuracy per attempt) wherever that data is collected.
