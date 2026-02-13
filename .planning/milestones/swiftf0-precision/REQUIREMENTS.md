# SwiftF0 SOTA Precision – Requirements

## v1 Requirements (Must-Have)

### REQ-SF0-P01: Local Expected Value (No Argmax-Only Pitch)

- **Requirement**: Final pitch must **not** be the raw argmax bin frequency. Use a **9-bin window** centered on the peak: weighted average in **log-frequency space**: \(f_{final} = 2^{\sum p'_i \cdot \log_2(f_i)}\) where \(p'_i\) are normalized probabilities in the window.
- **Acceptance**: swiftF0Inference.classificationToPitch uses this formula (or equivalent); no code path returns only bin center frequency for the peak bin. Sub-bin (cent-level) accuracy is achieved.

### REQ-SF0-P02: Median Filter (5–7 Frames)

- **Requirement**: Apply a **running median** over the last 5–7 frequency estimates (after LEV). Single-frame spikes and octave jumps that last one frame are removed.
- **Acceptance**: CrepeStabilizer (or equivalent) applies median over configurable window (e.g. 5 or 7); window size is configurable per profile (windowSize). No regression when window is 5 (sweet spot for latency vs. stability).

### REQ-SF0-P03: Hysteresis (Note Lock)

- **Requirement**: **Sticky note** logic: change the reported **note label** only if (1) the new frequency is more than **60 cents** away from the current note, and (2) the new pitch remains **stable for at least 3 consecutive frames** (~48 ms).
- **Acceptance**: CrepeStabilizer (or equivalent) uses hysteresisCents and stabilityThreshold; at least one profile (e.g. general/voice) uses 60¢ and 3 frames as reference. Prevents C ↔ C# flicker.

### REQ-SF0-P04: Chromatic Note and Cents

- **Requirement**: Map frequency to **chromatic** note (not natural-only). Use \(n = 12 \cdot \log_2(f/440) + 69\); note number = round(n); cents offset = (n − round(n)) × 100.
- **Acceptance**: frequencyToNote (or equivalent) is used for all pitch-to-note display; cents deviation is exposed. Semitones (A, A#, B, C, C#) are correctly represented.

### REQ-SF0-P05: Tuner Bar (Cents Display)

- **Requirement**: Where pitch is shown to the user, expose a **tuner bar** (or equivalent) that shows **cents offset** from the nearest chromatic note, so small variation reads as vibrato rather than flicker.
- **Acceptance**: At least one UI that consumes pitch (e.g. ITM, JazzKiller, Innovative Exercises, or shared tuner component) displays cents (e.g. −30 to +30 cents bar or numeric).

### REQ-SF0-P06: Post-Inference in Worker

- **Requirement**: LEV, median, and hysteresis run **post-inference** in the Web Worker (or equivalent) so the main thread and Audio Worklet receive already-smoothed values.
- **Acceptance**: SwiftF0Worker output (to SAB or postMessage) is stabilized; no raw argmax-only pitch is written. CrepeStabilizer (or equivalent) runs in the worker.

## v2 / Deferred

- **Configurable 60¢ / 3-frame** via UI (e.g. "Strict note lock" toggle).
- **Per-instrument tuning** of LEV window size (e.g. 7 bins for voice, 5 for guitar).
- **Vibrato visualization** (cents over time) in analytics.

## Out of Scope

- Changing SwiftF0 ONNX model or bin layout.
- Moving inference into the Audio Worklet.
- Replacing Tonal.js for note names.

## Summary

| ID | Requirement | Category |
|----|-------------|----------|
| REQ-SF0-P01 | Local Expected Value (no argmax-only) | Decoding |
| REQ-SF0-P02 | Median filter 5–7 frames | Temporal |
| REQ-SF0-P03 | Hysteresis 60¢, 3-frame stability | Temporal |
| REQ-SF0-P04 | Chromatic note + cents mapping | Mapping |
| REQ-SF0-P05 | Tuner bar (cents display) | UI |
| REQ-SF0-P06 | Post-inference in Worker | Architecture |
