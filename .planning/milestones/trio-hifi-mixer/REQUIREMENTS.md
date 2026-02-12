# Trio Hi-Fi Mixer – Requirements

## Wave 1: Bus Architecture and Parallel Dry/Wet

### REQ-HIFI-01: Parallel Bus Topology

- **Requirement**: Replace single-path compressor with a **parallel** topology: a dry path (Gain node, e.g. 0.4) and a wet path (compressor) both receive the same trio sum (or per-source sends); their outputs are summed and fed to the existing masterBus (or masterEQ → masterLimiter).
- **Input**: Piano, bass, and drums (existing pianoVol, bassVol, drumsVol outputs) are mixed to a single "trio sum" or sent to both dry and wet paths.
- **Output**: One combined signal (dry + wet) into the rest of the master chain. Mute/solo/volume behaviour unchanged.
- **Integration**: globalAudio.ts builds this graph at init; no change to Tone.Transport or useJazzBand.

### REQ-HIFI-02: Dry/Wet Mix Ratios

- **Requirement**: Dry path gain and wet path gain are configurable (e.g. dry 0.4, wet 1.0) so the mix is "Parallel NY" style: attack retained, body fattened.
- **Goal**: Audibly, drums keep punch; bass and piano get glue without squashing.

## Wave 2: WASM/Worklet Compressor (Soft-Knee, Params)

### REQ-HIFI-03: Soft-Knee Compression

- **Requirement**: The **wet path** uses a compressor with **soft knee** (logarithmic gain reduction), not the native DynamicsCompressorNode hard knee, so piano stays "wooden" and bass is transparent.
- **Implementation**: Audio Worklet (custom JS or WASM) or Essentia.js; parameters: ratio (e.g. 4), knee (e.g. 30 dB or equivalent), attack (e.g. 5 ms for bass transients), release (e.g. 150 ms or adaptive).
- **Fallback**: If WASM/worklet is not ready for v1, document a "soft-knee proxy" (e.g. expanded knee via multiple nodes) and treat full WASM as v1.1.

### REQ-HIFI-04: Compressor Parameters for Jazz Trio

- **Requirement**: Default compressor settings are tuned for jazz trio: ratio ~4, knee ~30 (soft), attack ~5 ms (catch bass transients), release ~150 ms or adaptive (faster for ride, slower for bass).
- **Adaptive release** (optional): Release varies by input frequency/content—faster for ride cymbal, slower for double bass—to reduce pumping.

### REQ-HIFI-05: Connect Trio to Parallel Mixer

- **Requirement**: Piano, bass, and drums are connected to the parallel mixer (both dry and wet paths) so that when "Pro Mix" is on, the full trio is processed. Reverb sends (piano reverb, global reverb) remain as today; they can feed the same trio sum or the dry path only (design choice).

## Wave 3: Intelligent Makeup Gain (RMS-Matching)

### REQ-HIFI-06: RMS Measurement Pre/Post Compression

- **Requirement**: Measure **input RMS** (before compression, on the same signal feeding the wet path) and **output RMS** (after dry+wet sum, before or after makeup gain). Sampling window and update rate are sufficient for stable gain (e.g. 100–300 ms window, update every 50–100 ms).
- **Implementation**: Use Tone.Meter or AnalyserNode (RMS) or custom worklet; expose or use internally for REQ-HIFI-07.

### REQ-HIFI-07: Automatic Makeup Gain

- **Requirement**: Apply **makeup gain** = InputRMS / OutputRMS (with safe bounds, e.g. 0.25–4.0) so that when the user toggles "Mastering" / "Pro Mix" on, the **perceived loudness** stays the same while the tone becomes fuller and more professional.
- **Goal**: No volume jump on toggle; student hears only the tonal improvement.

### REQ-HIFI-08: Mastering Toggle

- **Requirement**: A **Mastering** or **Pro Mix** toggle in the Mixer (or globalAudio) enables: parallel compressor in path + RMS-matching makeup gain. When off, signal path is unchanged from current behaviour (or dry-only bypass).
- **Integration**: Existing Mixer UI or a new control; signal controls whether parallel chain + makeup are active.

## Wave 4: Air Band (High-Shelf for Drums)

### REQ-HIFI-09: Drums Air Band

- **Requirement**: Add a **high-shelf boost** (+3 dB at 12 kHz) applied to the **drums** bus (or the drums send into the parallel sum) so the ride cymbal has more "ping" and the app feels like a high-end recording.
- **Implementation**: Tone.EQ3 (high band) or BiquadFilter high-shelf; optionally bypassable or tied to "Pro Mix."
- **Goal**: Audibly more definition on ride cymbal without harshness.

### REQ-HIFI-10: WebGPU EQ (Optional / Future)

- **Requirement**: If by 2026 WebGPU is used for high-fidelity EQ elsewhere, the Air band can be implemented with WebGPU for consistency; otherwise Tone/BiquadFilter is sufficient for v1.
- **Status**: Deferred unless already in stack.

## Out of Scope (v1)

- Per-instrument compressor (single bus only).
- User-editable compressor ratio/knee/attack/release in UI (preset only).
- True peak limiting in worklet (can be v1.1).

## Summary Table

| ID | Requirement | Wave |
|----|-------------|------|
| REQ-HIFI-01 | Parallel bus topology (dry + wet sum) | 1 |
| REQ-HIFI-02 | Dry/wet mix ratios (e.g. 0.4 dry, 1.0 wet) | 1 |
| REQ-HIFI-03 | Soft-knee compression (WASM/worklet) | 2 |
| REQ-HIFI-04 | Jazz trio default params (ratio, knee, attack, release) | 2 |
| REQ-HIFI-05 | Connect trio to parallel mixer | 2 |
| REQ-HIFI-06 | RMS measurement pre/post compression | 3 |
| REQ-HIFI-07 | Automatic makeup gain (InputRMS/OutputRMS) | 3 |
| REQ-HIFI-08 | Mastering / Pro Mix toggle | 3 |
| REQ-HIFI-09 | Drums Air band (+3 dB @ 12 kHz) | 4 |
| REQ-HIFI-10 | WebGPU EQ (optional/future) | 4 |
