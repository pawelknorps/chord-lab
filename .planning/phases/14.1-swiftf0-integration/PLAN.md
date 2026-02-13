---
phase: 14.1
name: SwiftF0 SOTA 2026 Integration
waves:
  - name: Infrastructure & Worker Setup
    description: Initial onnxruntime-web integration and InferenceWorker.
  - name: SwiftF0 Inference Engine
    description: Running the model and implementing Weighted Argmax.
  - name: Integration & Stabilization
    description: Connecting to existing pitch stores and applying Hysteresis.
---

# Phase 14.1: SwiftF0 SOTA 2026 Integration

Focus: Replace MPM with the high-performance SwiftF0 neural model to achieve <10ms pitch detection with professional-grade accuracy for jazz instruments.

## Wave 1: Infrastructure & Worker Setup

<task id="SF0-ORT-SETUP" status="todo">
Install `onnxruntime-web` and configure Vite to serve WASM/WebGPU binaries.
- Ensure `cross-origin-isolation` is active for SharedArrayBuffer.
</task>

<task id="SF0-WORKER-INIT" status="todo">
Create `src/core/audio/SwiftF0Worker.ts`.
- Initialize `onnxruntime-web` session with SwiftF0 model.
- Setup a message handler to receive the PCM RingBuffer SAB.
</task>

## Wave 2: SwiftF0 Inference Engine

<task id="SF0-INFERENCE-LOOP" status="todo">
Implement the high-speed inference loop in the worker.
- Read PCM from RingBuffer at 16,000 Hz.
- Apply logarithmic compression: $log(1 + 10 \cdot magnitude)$ to the spectrogram.
- Run `session.run()` every 128 samples (hop) using bins 3-134.
</task>

<task id="SF0-REGRESSION-HEAD" status="todo">
Implement Continuous Pitch Regression.
- Extract the regression offset from the SwiftF0 output.
- Combine with the classification peak for sub-cent accuracy.
</task>

## Wave 3: Integration & Stabilization

<task id="SF0-ATONAL-GATE" status="todo">
Implement RMS (Loudness) Gating.
- Combine Pitch Confidence (< 0.85) with RMS transient detection.
- Bridge "chiff" noise by holding the previous note for 20ms.
</task>

<task id="SF0-PROFILE-SWITCHER" status="todo">
Implement Instrument-Specific Hysteresis Profiles.
- Create `InstrumentProfileStore` (Vocals, Trumpet, Guitar).
- Dynamically adjust Hysteresis (25-50 cents) and Stability (2-5 frames) based on selection.
</task>

<task id="SF0-UI-WIRE" status="todo">
Update `useITMPitchStore` to favor SwiftF0 and throttle UI.
- Throttle React state updates to 60Hz.
- fallback to MPM if the user's browser doesn't support WebGPU/WASM.
</task>

## Verification
- [ ] SwiftF0 model loads and executes in <5ms per frame.
- [ ] Pitch detection is accurate to within 5 cents compared to a reference tuner.
- [ ] Hysteresis prevents UI flicker during intentional jazz vibrato.
- [ ] System falls back gracefully to MPM if model loading fails.
