# Root cause: Audio glitch when mic pitch is on (same as CREPE WASM)

## Why it glitches the same way

**AudioWorklet `process()` runs on the audio rendering thread.**  
MDN: *"The method is called synchronously from the audio rendering thread."*  
If `process()` does too much work, the browser can’t fill playback buffers in time → dropouts/clicks.

- **CREPE WASM**: Heavy inference (WASM/WebGPU) was either on the **main thread** (blocking Tone’s scheduler) or in a **worklet** (blocking the same audio thread). Either way, the thread that also drives playback was busy → same glitches.
- **Current pipeline**: Heavy **MPM (autocorrelation/NSDF)** runs inside the pitch **Audio Worklet**’s `process()` / `runInference()`. That worklet runs on the **audio rendering thread**. In many browsers, that thread is shared across the process (or at least shared with playback). So when the worklet spends time in `detectPitch()` (O(n²)-style over 1024 samples), it blocks the audio thread → Tone’s buffers are processed late → **same glitches**.

So the issue is **not** “pitch context vs Tone context” (they are separate). The issue is **heavy work on the audio thread** (worklet) or main thread (if CREPE was there). Same symptom, same underlying cause: **CPU-heavy pitch work on a thread that must stay real-time for playback**.

## Fix

Move **pitch inference (MPM)** off the audio thread:

1. **Worklet**: Only copy input → circular buffer, downsample, write to `pcmSab`, and write RMS/onset to SAB. **Do not** run `detectPitch()` or stabilization in the worklet.
2. **MPM Worker**: New Web Worker that reads from `pcmSab`, runs MPM (autocorrelation + stabilization), writes frequency/clarity to the same SAB. Runs on a separate thread → no audio-thread blocking.
3. **SwiftF0**: Already in a Worker; unchanged. When enabled, `getLatestPitch` can keep favoring neural result over MPM.

Result: audio thread stays light (copy + downsample + SAB writes only); MPM and CREPE/SwiftF0 run in Workers → playback should stop glitching.
