# Phase 22: Trio Hi-Fi Mixer – Research

## Why DynamicsCompressorNode is the "Old Way"

- **Single knee type**: Hard knee is the default; soft knee is not natively exposed in a way that gives the "wooden" piano and transparent bass needed for jazz.
- **No lookahead**: True peak limiting and smooth attack require lookahead, which the native node does not provide.
- **One-size-fits-all**: Same curve for all material; no adaptive release (e.g. faster for ride, slower for bass).

## 2026 SOTA: WASM-Powered Dynamics

- **Essentia.js (WASM)**: Used in pro web audio for analysis and dynamics; can implement lookahead and true peak limiting.
- **Custom Rust-compiled Audio Worklet**: Zero-latency, transparent compression; requires Rust → WASM build pipeline.
- **Soft-knee in JS Worklet**: Feasible in pure JS inside an Audio Worklet: level detection (e.g. RMS or peak in small buffer) → gain reduction curve (logarithmic through knee) → apply gain. No WASM required for v1 if performance is acceptable.

## Parallel (NY) Compression

- **Concept**: Blend 100% wet (heavy compression) with ~40% dry. Result: attack from dry, body and glue from wet.
- **Jazz use**: Retains drum attack; fatten bass and piano without squashing.

## Adaptive Release

- **Idea**: Release time varies by input frequency or transient content—faster for ride cymbal, slower for double bass—to reduce pumping.
- **Implementation**: Optional; can use a simple low/high split or envelope follower; defer to v1.1 if needed.

## RMS-Matching Makeup Gain

- **Formula**: Gain = InputRMS / OutputRMS (with clamp). Ensures that when compression is applied, the output level matches the input level (perceived loudness stable).
- **Update rate**: 50–100 ms with smoothing to avoid zipper noise.
- **Tone.js**: Tone.Meter provides getLevel() (RMS); can be used for input and output if two meters are placed correctly.

## Air Band (High-Shelf)

- **Target**: +3 dB at 12 kHz on drums bus.
- **Tone.EQ3**: highFrequency, high band gain; or Tone.Filter type "highshelf", frequency 12000, gain +3 dB.
- **WebGPU**: By 2026, WebGPU-based EQ may be used for other modules; not required for this phase.

## References

- Web Audio API: DynamicsCompressorNode (MDN).
- Tone.js: Compressor, EQ3, Meter, Gain.
- Essentia.js: https://mtg.github.io/essentia.js/ (if adopting WASM analysis/dynamics).
- Parallel compression: Standard mixing technique (NY compression).
