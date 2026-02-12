# Research: SwiftF0 Implementation Strategy (SOTA 2026)

## Model Overview
SwiftF0 is a lightweight CNN-based pitch estimator optimized for WASM/WebGPU.
- **Input**: 1024 samples @ 16,000 Hz.
- **Output**: 360-bin probabilities (or direct pitch + clarity).
- **Size**: ~1MB ONNX model.

## Implementation Path

### 1. The Worker Pattern
To avoid blocking the AudioWorklet (which must remain ultra-lean) or the Main Thread (UI), we will use an `InferenceWorker`.
- **AudioWorklet**: Downsamples and writes raw PCM to a `SharedArrayBuffer` (RingBuffer).
- **InferenceWorker**: Polls the RingBuffer, runs SwiftF0 via `onnxruntime-web`, and writes the resulting pitch/confidence to the `ITMPitchSAB`.

### 2. Weighted Argmax Interpolation
SwiftF0 outputs a probability distribution. To achieve "Pro" resolution for jazz vibrato:
1. Find the peak bin ($i$).
2. Take a window of 9 bins around the peak.
3. Compute the expected value (weighted average) of the frequencies.
$$ \hat{f} = \frac{\sum w_i \cdot f_i}{\sum w_i} $$
This allows us to detect subtle pitch drifts between the model's 20-cent bins.

### 3. Stability & Hysteresis
The output will be processed by the existing `CrepeStabilizer` (Median Filter + Schmitt Trigger) to ensure the UI remains rock-solid for the student.

## Technical Requirements
- `onnxruntime-web` for SwiftF0 inference.
- `SharedArrayBuffer` for zero-copy PCM transfer.
- WebGPU (fallback to WASM) for maximum speed.
