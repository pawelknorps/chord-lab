---
phase: 22
name: Trio Hi-Fi Mixer (WASM Compressor & Parallel Processing)
milestone: .planning/milestones/trio-hifi-mixer/
waves: 4
dependencies: [
  "Phase 3: Sonic Layer (Dynamic Mixer, masterLimiter, masterEQ)",
  "globalAudio.ts (compressor, pianoVol, bassVol, drumsVol, masterBus)",
  "JazzKiller Mixer UI"
]
principle: "Replace blunt DynamicsCompressorNode with parallel bus + WASM-style dynamics; keep perceived loudness stable with RMS-matching makeup; add Air band for drums."
files_modified: [
  "src/core/audio/globalAudio.ts",
  "src/modules/JazzKiller/components/Mixer.tsx"
]
files_created: [
  "public/worklets/wasm-compressor-processor.js (or equivalent)",
  "src/core/audio/ParallelCompressor.ts (or ParallelJazzMixer.ts)"
]
---

# Phase 22 Plan: Trio Hi-Fi Mixer (WASM Compressor & Parallel Processing)

**Focus**: Make JazzKiller trio playback **consistent and hi-fi** via a Custom WASM Compressor with Parallel (NY) Mix, Intelligent Makeup Gain, and an "Air" band for drums—so the app feels like a high-end recording session.

**Success Criteria**:
- REQ-HIFI-01..02: Parallel bus (dry + wet sum) with configurable mix ratios.
- REQ-HIFI-03..05: Wet path uses soft-knee compressor (WASM/Worklet); jazz-tuned params; trio connected to parallel mixer.
- REQ-HIFI-06..08: RMS pre/post measurement; automatic makeup gain; "Mastering" / "Pro Mix" toggle (no volume jump).
- REQ-HIFI-09: Drums high-shelf +3 dB @ 12 kHz (Air band).

---

## Context (Current Chain)

- **globalAudio.ts**: pianoVol → pianoReverb → masterLimiter; bassVol, drumsVol → compressor → masterBus → masterEQ → masterLimiter. Compressor is `Tone.Compressor` (native DynamicsCompressorNode): threshold -18, ratio 4, attack 0.03, release 0.1.
- **Limitation**: Native node is blunt—no soft knee, no lookahead; piano can sound plinky, bass can lack transparent control; no parallel option; no RMS-matching makeup.

---

## Wave 1: Bus Architecture and Parallel Dry/Wet (REQ-HIFI-01, REQ-HIFI-02)

*Goal: Introduce parallel topology: trio sum splits to dry Gain and wet path; sum dry + wet into masterBus.*

### 22.1 – Parallel Bus Topology

- **Trio sum**: Create a Tone.Gain (or Tone.Merge) that receives pianoVol, bassVol, drumsVol (and optionally reverb contributions if desired). This is the "trio sum" node.
- **Dry path**: Tone.Gain(0.4) (or configurable) fed by trio sum → into a **summing** Gain that will also receive wet.
- **Wet path**: For Wave 1, keep existing Tone.Compressor fed by trio sum; output of compressor → same summing Gain. So: dryGain(0.4) + wetCompressor → sumGain → masterBus (or masterEQ → masterLimiter).
- **Bypass**: When "Pro Mix" is off, route trio sum directly to masterBus (or current compressor only) so behaviour matches current app.
- **Files**: Refactor globalAudio.ts to build dry/wet/sum; no new worklet yet.

### 22.2 – Dry/Wet Ratios

- Expose or hardcode dry gain (e.g. 0.4) and wet gain (e.g. 1.0); verify A/B that drums keep attack and body is fattened.

**Verification Wave 1**: Playback unchanged when Pro Mix off; when on (with current compressor as wet), combined dry+wet sum is audibly parallel-style. Mute/solo/volume unchanged.

---

## Wave 2: WASM/Worklet Compressor (REQ-HIFI-03, REQ-HIFI-04, REQ-HIFI-05)

*Goal: Replace wet-path Tone.Compressor with a soft-knee compressor in an Audio Worklet.*

### 22.3 – Soft-Knee Compressor Worklet

- **Register** an Audio Worklet processor (e.g. `wasm-compressor-processor`) that implements:
  - **Soft knee**: Logarithmic or smooth gain reduction through the knee (e.g. 30 dB wide).
  - **Params**: ratio (e.g. 4), knee (e.g. 30), attack (e.g. 0.005 s), release (e.g. 0.15 s). Pass via `processorOptions`.
- **Implementation**: Start with JS in the worklet (gain reduction from level detection + smooth curve); optional later: compile to WASM or use Essentia.js for lookahead/true peak.
- **Connection**: In globalAudio, create `AudioWorkletNode(context, 'wasm-compressor-processor', { processorOptions: { ratio: 4, knee: 30, attack: 0.005, release: 0.15 } })` and use as wet path instead of Tone.Compressor for the parallel chain.

### 22.4 – Jazz Trio Defaults and Adaptive Release (Optional)

- Defaults: ratio 4, knee 30, attack 5 ms, release 150 ms. Optional: adaptive release (e.g. faster for high-frequency content, slower for low) in a follow-up task.
- **REQ-HIFI-05**: Ensure piano, bass, drums (and any reverb) feed the trio sum that feeds both dry and wet; no routing regressions.

**Verification Wave 2**: Wet path uses worklet; piano doesn’t plink; bass sits; trio still connected correctly. Fallback: if worklet not ready, keep Tone.Compressor as wet path and document WASM for v1.1.

---

## Wave 3: RMS-Matching Makeup Gain (REQ-HIFI-06, REQ-HIFI-07, REQ-HIFI-08)

*Goal: "Mastering" toggle improves tone without volume jump.*

### 22.5 – RMS Measurement

- **Input RMS**: Measure RMS of the trio sum (or the signal feeding the wet path) over a window (e.g. 100–300 ms). Use Tone.Meter or AnalyserNode (getFloatFrequencyData not required; use getByteTimeDomainData or Tone.Waveform for RMS approximation) or a small meter worklet.
- **Output RMS**: Measure RMS of the summed dry+wet signal (after makeup gain node, or before for comparison). Same window and update rate (e.g. every 50–100 ms).

### 22.6 – Automatic Makeup Gain

- Insert a **Tone.Gain** (makeup gain) after the dry+wet sum. Set gain = InputRMS / OutputRMS, clamped to [0.25, 4.0]. Update periodically (e.g. every 100 ms) with smoothing to avoid zipper noise.
- Only active when "Pro Mix" is on.

### 22.7 – Mastering / Pro Mix Toggle

- **Signal or state**: Add a signal/ref (e.g. `proMixEnabledSignal`) that controls whether (1) parallel path + makeup are in the chain, or (2) dry-only / previous chain is used.
- **Mixer UI**: Add a "Pro Mix" or "Mastering" toggle in the JazzKiller Mixer; bind to the signal. When toggled on, enable parallel compressor + RMS makeup; when off, bypass (same loudness as before feature).

**Verification Wave 3**: Toggle on → fuller tone, same perceived level. Toggle off → current behaviour. No jumps on toggle.

---

## Wave 4: Air Band for Drums (REQ-HIFI-09)

*Goal: +3 dB at 12 kHz on drums for ride "ping."*

### 22.8 – Drums High-Shelf EQ

- In globalAudio, on the **drums** path (drumsVol output), insert a **high-shelf** filter: +3 dB at 12 kHz. Use Tone.EQ3 (high band) or Tone.Filter (type: highshelf, frequency 12000, gain 3). Connect: drumsVol → airBandEQ → (rest of chain into trio sum or compressor).
- Optional: Only enable when "Pro Mix" is on, or always on as a subtle enhancement.
- **REQ-HIFI-10**: WebGPU EQ deferred.

**Verification Wave 4**: Drums have more ride definition; no harshness. A/B with/without Air band.

---

## Verification (Phase Goal)

- **Parallel**: Dry + wet sum; when Pro Mix on, attack retained, body fattened.
- **Soft knee**: Piano and bass sound natural; no plinky transients.
- **Makeup**: Toggling Pro Mix does not change perceived volume.
- **Air**: Ride cymbal has more "ping."
- **Regression**: Mute, solo, volume, reverb unchanged; Pro Mix off = previous behaviour.

---

## Next Steps

1. Execute Wave 1 (parallel bus in globalAudio).
2. Execute Wave 2 (worklet compressor, jazz params).
3. Execute Wave 3 (RMS metering, makeup gain, Mixer toggle).
4. Execute Wave 4 (drums Air band).
5. Update `.planning/milestones/trio-hifi-mixer/STATE.md` and add VERIFICATION.md.

Recommend running **`/gsd-execute-phase 22`** to start implementation (Wave 1).
