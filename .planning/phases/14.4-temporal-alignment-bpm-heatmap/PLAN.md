---
phase: "14.4"
name: Temporal Alignment (Time-Travel) & BPM Heatmap
waves: 4
dependencies: ["Phase 14.3: SwiftF0 SOTA Precision", "Phase 1: Feedback Engine"]
files_modified: [
  "src/modules/ITM/state/useITMPitchStore.ts",
  "src/core/audio/globalAudio.ts"
]
files_created: [
  "src/core/audio/LatencyEngine.ts",
  "src/core/audio/pitchHistory.ts",
  "src/modules/ITM/components/BpmHeatmap.tsx",
  "src/modules/ITM/hooks/useDrillWithLatency.ts"
]
---

# Phase 14.4 Plan: Temporal Alignment (Time-Travel) & BPM Heatmap

**Focus**: Solve the "Time-Travel Problem" so the app does not judge the student's notes as "late" due to system latency. Add BPM Heatmap (Stability vs Speed) and optional round-trip calibration.

**Success Criteria**:
- **REQ-TA-01**: Total system lag (output + input + inference) computed and used to "look back" in pitch history when evaluating a beat.
- **REQ-TA-02**: Drill/beat checks use latency-adjusted note (what the student played at the moment of the beat), not the current pitch.
- **REQ-TA-03**: BPM Heatmap component: Tempo (X) vs Accuracy (Y), thermal trail (green/red), trend line.
- **REQ-TA-04** (optional): Round-trip calibration wizard (bip → mic → measured lag) for device-specific offset.

---

## Problem: Three-Headed Latency Dragon

- **Output Latency**: Click reaches student's ears (~20–100 ms).
- **Input Latency**: Instrument → mic → Worklet (~10–20 ms).
- **Inference Latency**: SwiftF0 processing (~16 ms).

Without compensation, the app judges notes as "late" purely due to physics.

---

## Wave 1: Latency Engine & Temporal Alignment Logic

- **LatencyEngine.ts**: `getSystemLatency(ctx)` = outputLatency + inputLag (0.020) + inferenceLag (0.016). `getAdjustedNote(history, targetTime, lag)` returns the pitch-history entry closest to `targetTime - lag` (within 10 ms).
- **Pitch history**: Ring buffer of `{ timestamp, midi }` filled by polling `getLatestPitch()` at ~60–120 Hz, with timestamp = Tone.now() (or equivalent). Expose `getPitchHistory()` / `getSwiftF0History()`.

## Wave 2: Pitch History & Store Integration

- **pitchHistory.ts**: Maintain a bounded history (e.g. last 2 s) of `{ timestamp: number, midi: number }`; feed from store's `getLatestPitch()` + frequencyToNote → midi. Start/stop collection when drill or scoring is active.
- **useITMPitchStore** (or dedicated hook): Optionally start history collection when high-performance pitch is active; expose `getPitchHistory()` for drill logic.

## Wave 3: Latency-Aware Drill Check & BPM Heatmap UI

- **useDrillWithLatency**: Hook or store that provides `registerPass(targetMidi: number)`: uses `getSystemLatency(ctx)`, `getPitchHistory()`, `getAdjustedNote(history, Tone.now(), lag)`; on match → success, else failure. Integrate with existing drill flows (e.g. bass-note game, guided practice) where a "beat" triggers a check.
- **BpmHeatmap.tsx**: High-density SVG grid; X = BPM (normalized to 300), Y = accuracy (inverted so high accuracy = top); points as motion.circle (green >0.9, red otherwise); optional trend path. Props: `data: { bpm: number, accuracy: number, timestamp: number }[]`.

## Wave 4: Verification & Optional Round-Trip Calibration

- **Verification**: At beat time, latency-adjusted lookup returns the note that was actually sounding at (beatTime - L_total). BPM Heatmap renders without errors and shows thermal trail.
- **Optional (Pro)**: 2 s calibration phase: play short "bip", detect attack via SwiftF0, compute round-trip latency, save to session and use as inputLag override.

---

## Implementation Notes

- Use `ctx.outputLatency` (Web Audio API 2026) when available; fallback 0.
- `getAdjustedNote` tolerance 0.01 s (10 ms) is configurable.
- BpmHeatmap can be wired to drill session results (aggregate by BPM and accuracy per attempt).
