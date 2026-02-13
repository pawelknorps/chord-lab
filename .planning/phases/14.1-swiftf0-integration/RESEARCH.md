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

### 2. Instrument-Specific Hysteresis Profiles
To achieve SOTA for singing, trumpet, and guitar, the post-processing must be instrument-aware:

| Instrument | Hysteresis (Cents) | Stability (Frames) | Rationale |
| :--- | :--- | :--- | :--- |
| **Vocals** | 45-50 | 4-5 | Filters pitch "scoops" and heavy vibrato. |
| **Trumpet** | 25-30 | 2 | Fast response for rapid valve changes/articulation. |
| **Guitar** | 35-40 | 3 | Ignores the initial "sharp" pluck/spike. |

### 3. The Pre-Processing Pipeline (Speed)
- **Downsample to 16kHz**: Mandatory. Perform in AudioWorklet before worker ingestion.
- **Strict Frequency Slicing**: Only send STFT bins 3 to 134 (46.8Hz to 2093.7Hz) to the model.
- **Logarithmic Compression**: Apply $log(1 + 10 \cdot magnitude)$ to mimic human hearing and isolate fundamental frequencies.

### 4. Accuracy Optimization: The "Regression" Head
SwiftF0 outputs both a **Classification** (softmax bin) and a **Regression** (offset).
- **Pro Move**: Use the **Continuous Pitch Regression** output to provide sub-cent accuracy for a professional "tuner" feel.

### 5. Handling "Ghost" Notes (Atonal Gating)
- **Problem**: Trumpet "chiff" or guitar "pluck" noise.
- **Solution**: Implement an **RMS (Loudness) Gate** alongside the Confidence Gate. If confidence < 0.85 AND RMS is rising sharply (transient), hold the previous note for 20ms to bridge the noise gap.

### 6. Stability & Hysteresis
The output will be processed by the existing `CrepeStabilizer` (Median Filter + Schmitt Trigger) using the profiles defined above.

## Technical Requirements
- `onnxruntime-web` for SwiftF0 inference.
- `SharedArrayBuffer` for zero-copy PCM transfer.
- WebGPU (fallback to WASM) for maximum speed.
