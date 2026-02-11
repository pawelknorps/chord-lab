# Phase 14 Research: Pitch Detection Latency

## CREPE model sizes (when WASM is integrated)

| Model  | Latency (approx) | Accuracy | Use case           |
|--------|-------------------|----------|--------------------|
| Full   | ~120 ms           | Best     | Offline            |
| Medium | ~60 ms            | High     | —                  |
| Small  | ~25 ms            | Great    | Real-time (option) |
| Tiny   | ~15 ms            | Good     | Real-time jazz     |

- For real-time jazz feedback, use **CREPE-Tiny** or **CREPE-Small**; stabilizer (median + hysteresis) compensates for small accuracy drop.
- CREPE expects **16 kHz** input; 1024 samples = 64 ms of audio at 16 kHz.
- **Hop 128** (match Web Audio block): run inference every 128 samples at native rate; after downsampling, each frame is the last 64 ms at 16 kHz, with overlap for smooth updates.

## Zero-copy and GC

- In Audio Worklet, avoid: `array.push()`, `array.shift()`, `new Float32Array()` inside `process()`.
- Use: one pre-allocated circular buffer, `buffer.set(input, ptr)`, and `ptr = (ptr + 128) % size`; pre-allocated temp and downsampled buffers for the 16 kHz frame.

## Overlap and batching (future)

- With multi-threaded WASM, "previous" frame can run while "current" frame is still filling, masking compute latency behind collection latency. Not required for Phase 14; document for a later phase.
