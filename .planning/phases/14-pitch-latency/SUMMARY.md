# Phase 14 Summary: Pitch Detection Latency (Break the Latency Wall)

## Objective

Reduce delay between playing a note and UI updating by addressing the "Latency Wall": 16 kHz downsampling, zero-copy circular buffer, hop size 128, and no GC in the worklet hot path.

## Wave 1: 16 kHz Downsampling + Zero-Copy Circular Buffer ✅

- **Native buffer size**: `ceil(1024 * sampleRate / 16000)` (e.g. 3072 @ 48 kHz, 2823 @ 44.1 kHz).
- **Zero-copy**: Single `Float32Array(nativeBufferSize)`; each `process()` copies 128 samples with `buffer.set(input, ptr)` and wrap; no push/shift.
- **Downsampler**: Linear interpolation from native buffer to 1024 samples; pre-allocated `tempNative` and `downsampled`; no allocations in `process()`.
- **MPM**: Runs on 1024-sample frame with `effectiveSampleRate = 16000`; frequency = 16000 / lag.

## Wave 2: Hop Size 128 (Every Block) ✅

- **Hop**: Inference runs every 128 samples (every `process()` call) once the circular buffer has been filled once.
- **Overlap**: Each frame uses the last `nativeBufferSize` samples in chronological order; downsample → MPM → stabilizer → SAB write.
- **Throttle**: `processorOptions.hopBlocks` (default 1) to run every N blocks if CPU is high.

## Wave 3: CREPE-Ready & Verification ✅

- **CREPE swap path**: Documented in RESEARCH.md (same 1024 @ 16 kHz input, same SAB output; use Tiny or Small when WASM integrated).
- **Verification**: No console in worklet hot path; SAB written with stabilized pitch + confidence; pre-allocated `nsdf` in `detectPitch()` to avoid GC.

## Files Modified

- `public/worklets/pitch-processor.js`: Native circular buffer, 16 kHz downsampling, hop 128, pre-allocated buffers, optional hopBlocks.
- `.planning/ROADMAP.md`, `.planning/STATE.md`: Phase 14 added and completed.
- `.planning/phases/14-pitch-latency/PLAN.md`, RESEARCH.md, SUMMARY.md, VERIFICATION.md.

## Result

- Lower effective latency: inference every block (after first fill) instead of every 2nd full buffer at native rate.
- ~3x less data per inference (16 kHz vs 48 kHz) and no GC in the worklet hot path.
- Architecture ready for CREPE-Tiny/Small WASM swap with the same 1024 @ 16 kHz input and SAB output.
