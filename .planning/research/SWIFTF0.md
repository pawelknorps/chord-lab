# Research: SwiftF0 Viability for 2026 Pitch Detection

## Overview

SwiftF0 (released late 2025/early 2026) is a novel neural pitch estimation model that uses a 2D CNN architecture on STFT spectrograms. It is designed specifically for low-resource environments and high-accuracy requirements.

## Technical Comparison

| Metric | CREPE (Full) | CREPE (Tiny) | SwiftF0 |
| :--- | :--- | :--- | :--- |
| Parameters | 22.2M | 4.8M | **95,842** |
| Inference Cost | High | Medium | **Ultra-Low** |
| Latency | ~120ms | ~25ms | **<10ms** |
| CPU Overhead | Significant | Noticeable | **Minimal (~42x faster than CREPE)** |
| Accuracy | SOTA | High | **SOTA (Rivals CREPE Full)** |

## Viability in Chord Lab (ITM 2026)

### 1. Integration Complexity

- **Existing Pipe**: Already downsamples to 16kHz and uses 1024-sample frames (64ms).
- **SwiftF0 Compatibility**: Swift0 also thrives on 16kHz STFT data.
- **WASM/ONNX**: `onnxruntime-web` can load the ~1MB model file.
- **Thread Safety**: Can be run in a dedicated `PitchInferenceWorker` to keep the UI and AudioWorklet threads clean.

### 2. Benefits for Jazz

- **Overtones**: CNN-based models are superior to MPM/YIN in handling complex jazz instrument timbres (Sax, Trumpet, Double Bass).
- **Vibrato**: SwiftF0's speed allows for higher hop rates, tracking vibrato with more detail.
- **Stability**: Works well with the existing `CrepeStabilizer` (Median filter + Schmitt Trigger).

### 3. Requirements for Switch

- Update `REQUIREMENTS.md` to swap CREPE/MPM with SwiftF0.
- Update `AudioWorklet` to pass audio blocks to an inference engine.
- Implement the "Weighted Argmax Interpolation" for sub-bin precision.

## Conclusion

SwiftF0 is **highly viable** and should be adopted as the primary pitch engine for the ITM 2026 roadmap. It provides "Pro" level performance with "Hobbyist" CPU requirements.

## Implementation Path (Draft)

1. Add `onnxruntime-web` to project.
2. Create `useSwiftF0` hook (or background worker).
3. Connect `SharedArrayBuffer` from `pitch-processor.js` to the inference engine.
4. Apply the `CrepeStabilizer` logic to the output.
5. Benchmark against current MPM implementation.
