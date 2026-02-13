# Data Flow & Technical Spec – Audio Glitches Architecture

## Thread Isolation (Four-Way)

| Thread / Context | Role | Must NOT do |
|------------------|------|-------------|
| **Main** | React UI, Zustand state, Tone.Transport scheduling, rAF/poll SAB for pitch | Long-running inference; blocking await on LLM in real-time path |
| **Audio Worklet** | Copy mic → circular buffer; downsample to 16 kHz; write to pcmSab; write RMS/onset to pitch SAB | MPM, SwiftF0, CREPE, FFT, any autocorrelation or inference |
| **Worker A (Analysis)** | MpmWorker: read pcmSab → MPM (NSDF) → write frequency/clarity to pitch SAB. SwiftF0Worker: read pcmSab → neural inference → write frequency/clarity to pitch SAB | N/A (this is where inference lives) |
| **Worker B (AI)** | Gemini Nano: receive prompt (postMessage), run inference, postMessage result back | Block main thread; run on audio thread |

## SAB Layout and Ownership

### Pitch result SAB (main pitch memory)

- **Created by**: Main (PitchMemory.createPitchMemory).
- **Written by**: Audio Worklet (RMS, onset in slots 2, 3; capture timestamp in slot 4 when frame is ready); MpmWorker or SwiftF0Worker (frequency, confidence in slots 0, 1; lastUpdated and latencyScore in slots 4, 5). Workers write after inference; worklet writes every block (light).
- **Read by**: Main (useITMPitchStore, useHighPerformancePitch, usePitchTracker) via Float32Array view; typically in rAF or poll.
- **Layout**: `[0: frequency, 1: confidence (clarity), 2: rms, 3: onset, 4: lastUpdated (performance.now()), 5: latencyScore (ms)]` — 6 × Float32 (REQ-AG-05 latency monitoring).

### PCM SAB (downsampled 16 kHz frame)

- **Created by**: Main (createPcmMemory).
- **Written by**: Audio Worklet only (once per full frame: copy from circular buffer, downsample, write 1024 samples).
- **Read by**: MpmWorker and SwiftF0Worker (read 1024 samples; run inference; write result to pitch SAB).
- **Layout**: 1024 Float32 samples (16 kHz, one frame).

## Message Boundaries

- **Main → Worker A (MPM)**: Worker created by main; receives pcmSab + pitch SAB references at init; no ongoing postMessage for per-frame data (SAB is shared).
- **Main → Worker A (SwiftF0)**: Same; optional postMessage for config (e.g. instrument profile, timing on/off).
- **Main → Worker B (Gemini)**: postMessage with prompt payload; Worker B runs inference, then postMessage with result. Main must not await in a way that blocks Transport or pitch polling.

## Latency Budget (<10 ms)

- **Path**: Mic → Worklet (copy + downsample + write pcmSab) → Worker A (inference) → write pitch SAB → Main (read in rAF/poll) → React.
- **Design**: Worklet and Worker A must complete within a few ms per frame; main thread only reads (no heavy work). LLM is outside this path (post-phrase).

## Asynchronous Feedback

- **Real-time (algorithmic)**: Pitch, intonation, timing, onset—from existing pipeline (SAB, useITMPitchStore, scoring logic). Target <10 ms.
- **AI (pedagogical)**: Gemini Nano critique after phrase/segment; UI shows “Analyzing…” and updates when result arrives. No blocking of real-time path.

## Reference: Root Cause

See `../audio-glitch-diagnosis/ROOT_CAUSE.md`: glitches occurred when heavy pitch work (MPM or CREPE) ran on the **audio rendering thread**. Fix: worklet does copy + downsample + SAB write only; MPM in MpmWorker; SwiftF0 in SwiftF0Worker. This document formalizes that and extends to AI (Worker B) and main-thread rules.
