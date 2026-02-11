---
phase: 14
name: Pitch Detection Latency (Break the Latency Wall)
waves: 3
dependencies: ["Phase 9: Mic Algorithm Upgrade", "Phase 6: High-Performance Ear"]
files_modified: [
  "public/worklets/pitch-processor.js",
  "src/modules/ITM/state/useITMPitchStore.ts",
  ".planning/ROADMAP.md",
  ".planning/STATE.md"
]
---

# Phase 14 Plan: Pitch Detection Latency (Break the Latency Wall)

Focus: Reduce delay between playing a note and UI updating by addressing the "Latency Wall" of standard neural/autocorrelation processing. Target: ~15–25 ms end-to-end (CREPE-Tiny equivalent) with current MPM; architecture ready for CREPE-Tiny/Small WASM swap.

**Success Criteria**:
- Hop size 128 samples (match Web Audio block); inference every block once buffer is full.
- 16 kHz effective input: downsample mic inside the worklet so MPM (and future CREPE) runs on 16 kHz → ~3x faster inference.
- Zero-copy circular buffer: TypedArray + pointer; no push/shift; no GC pressure in the worklet.
- Optional: CREPE-Tiny or CREPE-Small WASM when available; document model swap path.
- No non-essential logging in the worklet.

---

## Problem Statement

Real-time jazz feedback feels sluggish because:
1. **Model/hop latency**: Running inference every 2nd full buffer (1024 samples) at native rate yields ~46 ms at 44.1 kHz between "hear" and "see."
2. **Sample rate mismatch**: CREPE (and efficient MPM) expect 16 kHz; processing at 48 kHz wastes ~66% of work.
3. **GC and copy cost**: Moving 128-sample blocks with push/shift or repeated allocations triggers GC and adds jitter.

---

## Wave 1: 16 kHz Downsampling + Zero-Copy Circular Buffer

- **Native buffer size**: `ceil(1024 * sampleRate / 16000)` (e.g. 3072 @ 48 kHz, 2823 @ 44.1 kHz).
- **Zero-copy**: Single `Float32Array(nativeBufferSize)`; each `process()` copy 128 samples with `buffer.set(input, ptr)` and wrap; no push/shift.
- **Downsampler**: Linear interpolation from native buffer to 1024 samples at 16 kHz effective; pre-allocated `tempNative` and `downsampled` buffers; no allocations in `process()`.
- **MPM**: Run on 1024-sample frame with `effectiveSampleRate = 16000` so frequency = 16000 / lag.

---

## Wave 2: Hop Size 128 (Every Block)

- **Hop**: Run inference every 128 samples (every `process()` call) once the circular buffer has been filled at least once.
- **Overlap**: Each frame uses the *last* `nativeBufferSize` samples in chronological order from the circular buffer; downsample → MPM → write to SAB.
- **Throttle (optional)**: `processorOptions.hopBlocks` (e.g. 2) to run every N blocks if CPU is high; default 1 for minimum latency.

---

## Wave 3: CREPE-Ready & Verification

- **CREPE-Tiny/Small**: Document in RESEARCH.md how to swap MPM for CREPE-WASM (same 1024 @ 16 kHz input, same SAB output); when integrated, use Tiny or Small model for ~10x speed vs Full.
- **Verification**: Measure latency (play note → UI update); confirm no console.log in worklet hot path; confirm SAB still written with stabilized pitch + confidence.

---

## Implementation Notes

- **Downsample formula**: `out[j] = linearInterp(nativeChronological, j * (nativeBufferSize / 1024))`.
- **Chronological order from circular buffer**: For `i in 0..nativeBufferSize-1`, `temp[i] = buffer[(ptr + i) % nativeBufferSize]` (ptr = oldest after we just wrote).
- **Stabilization**: Keep existing CrepeStabilizer logic in the worklet; run after MPM, write stabilized pitch + confidence to SAB.
