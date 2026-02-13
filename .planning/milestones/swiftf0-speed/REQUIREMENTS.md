# SwiftF0 Speed Optimization – Requirements

## v1 Requirements (Must-Have)

### REQ-SF0-S01: Measure Baseline Inference Time

- **Requirement**: Add optional, dev-only timing around SwiftF0 inference (e.g. before/after `session.run()`) so baseline per-frame time is measurable.
- **Acceptance**: On a representative device, baseline inference time (ms) is logged or exposed; no impact on production behavior when timing is disabled.

### REQ-SF0-S02: Zero Allocations in Inference Hot Path

- **Requirement**: Avoid creating new ONNX tensors or large arrays inside the inference loop; reuse pre-allocated input/output buffers where the API allows.
- **Acceptance**: No `new ort.Tensor(...)` (or equivalent) per frame; input buffer reuse is already in place; output handling uses reused or minimal allocations.

### REQ-SF0-S03: Preprocessing Cost Reduction

- **Requirement**: Reduce cost of log compression (or equivalent) applied to PCM before inference—e.g. optimize the loop, avoid redundant work, or move fixed work out of the hot path.
- **Acceptance**: Preprocessing time is reduced or unchanged; pitch output and accuracy unchanged (smoke check).

### REQ-SF0-S04: Align Poll Interval with Inference

- **Requirement**: Make the worker poll/sleep interval consistent with actual inference duration (e.g. avoid fixed 8 ms if inference is often faster or slower); keep latency and CPU usage balanced.
- **Acceptance**: Polling strategy is documented and tuned so that analysis runs “a little bit faster” or uses CPU more efficiently without increasing missed frames.

### REQ-SF0-S05: No Regression in Accuracy or Behavior

- **Requirement**: All optimizations must not regress pitch accuracy, sub-cent regression head behavior, or instrument hysteresis (CrepeStabilizer / profiles).
- **Acceptance**: Manual or smoke test: same input produces equivalent pitch/confidence; instrument profiles and stabilizer still behave as before.

## v2 / Deferred (from RESEARCH.md)

- **ORT session tuning**: `numThreads: 4`, SIMD build, proxy execution; see RESEARCH.md for session options.
- **Hop 256 / 16 ms update rate**: Frame 1024, hop 256 for 16 ms update rate; circular buffer in worklet.
- **STFT bins 3–134 only**: Compute only bins 3–134 (46.875 Hz – 2093.75 Hz); discard rest to save memory bandwidth (e.g. fft.js or equivalent).
- **Note Filter in worker**: Confidence threshold (e.g. 0.9); emit “Note On” only if pitch stable within 50 cents for 3 consecutive frames (~48 ms).
- **Local Expected Value for pitch**: Use \(f_{\text{Hz}} = f_{\min} \cdot 2^{\Delta \cdot \sum(i \cdot p_i) / \sum p_i}\) for cents-level precision instead of plain argmax; see RESEARCH.md.
- **Automatic source recognition & adaptive adjustment** (see RESEARCH.md §5): Profile Controller in Web Worker; **dynamic confidence threshold** (voice ≈ 0.85, guitar/sax ≈ 0.70); **frequency range masking** per source (Voice 80–1100 Hz, Guitar 82–1000 Hz, Sax/Trumpet 140–1500 Hz); **RMS / ZCR / Spectral Flux** → auto-detect source and set smoothing (e.g. high ZCR + low RMS → skip inference; low ZCR + stable RMS → heavy smoothing; high Spectral Flux → light smoothing, median \(W=3\) for guitar, \(W=5\) for wind).
- **Quantized model (INT8)** if/when supported by onnxruntime-web and model export.
- **WebGPU-specific optimizations** (e.g. batch size, shader tuning) if profiling shows GPU-bound bottleneck.
- **Moving preprocessing to Audio Worklet** (only if measurement shows it as the dominant cost and worklet budget allows).

## Out of Scope

- Replacing SwiftF0 with another model.
- Changing input sample rate or frame size (1024 @ 16 kHz).
- Adding inference inside the Audio Worklet.
- Full APM or production metrics pipeline.

## Summary

| ID | Requirement | Category |
|----|-------------|----------|
| REQ-SF0-S01 | Measure baseline inference time | Observability |
| REQ-SF0-S02 | Zero allocations in hot path | Performance |
| REQ-SF0-S03 | Preprocessing cost reduction | Performance |
| REQ-SF0-S04 | Align poll interval with inference | Scheduling |
| REQ-SF0-S05 | No regression in accuracy/behavior | Quality |
