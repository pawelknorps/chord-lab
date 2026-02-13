# Studio Polish – Requirements

## v1 Requirements (Must-Have)

### Parallel Compression Bus (NY Trick)

#### REQ-STUDIO-01: DryBus and WetBus Topology

- **Requirement**: Implement **DryBus** and **WetBus** in the AudioGraph. The same trio sum (piano, bass, drums) feeds both buses. DryBus passes signal with configurable gain; WetBus passes signal through a Worklet Compressor. Outputs are summed to the master chain.
- **Acceptance**: globalAudio (or equivalent) builds DryBus and WetBus; trio sources route to both; sum feeds master. Mute/solo/volume unchanged.

#### REQ-STUDIO-02: Worklet Compressor on WetBus (8:1, Fast Attack)

- **Requirement**: The **WetBus** uses a Worklet Compressor with **ratio 8:1** and **fast attack** so the wet path is heavily compressed (NY style). This bus is blended with dry to retain transients while fattening body.
- **Acceptance**: Wet path uses compressor with ratio 8:1 and fast attack (e.g. ≤5 ms); implemented in Audio Worklet or equivalent.

#### REQ-STUDIO-03: 70/30 Dry/Wet Blend

- **Requirement**: Blend **70% dry** and **30% wet** (by gain or mix) so the final sum is 70% DryBus + 30% WetBus. This yields punch from dry and weight from wet.
- **Acceptance**: Audible blend is ~70 dry / 30 wet; configurable in code or preset.

### The "Air" Band

#### REQ-STUDIO-04: High-Shelf EQ on Drum Bus (+2 dB @ 12 kHz)

- **Requirement**: Add a **high-shelf EQ** **+2 dB @ 12 kHz** to the **Drum Bus** so web-audio drums sound "expensive" (ride ping, clarity).
- **Implementation**: BiquadFilterNode or Tone high-shelf; applied to drums bus before or within the parallel sum.
- **Acceptance**: Drums bus has +2 dB @ 12 kHz; audibly more air/definition.

### Auto-Leveling (LUFS)

#### REQ-STUDIO-05: Master Limiter for -14 LUFS

- **Requirement**: Implement a **limiter on the Master Output** so the app is **consistently loud at -14 LUFS** regardless of how many notes the user plays or which stems are active.
- **Implementation**: Limiter (or compressor + limiter) with target -14 LUFS; can use integrated loudness measurement (e.g. short-term or block-based) to drive gain or threshold. Exact algorithm (e.g. lookahead limiter in Worklet) is implementation choice.
- **Acceptance**: With typical playback (trio + user), master output measures approximately -14 LUFS (or within ~1 dB); no clipping.

### Visualizer Interpolation

#### REQ-STUDIO-06: Note Waterfall 60fps Independent of Audio Ticks

- **Requirement**: The **Note Waterfall** must render at **60fps** (or 60 updates per second) **independent of audio logic**. Decouple UI ticks from audio ticks so the waterfall never stutters when the audio thread or buffer callback is under load.
- **Implementation**: Drive waterfall updates from `requestAnimationFrame` (or a fixed 60 Hz timer); consume **last-known** pitch/MIDI/note state from store or SAB. Do not block UI on audio callback or Tone.Transport tick.
- **Acceptance**: Waterfall runs at 60fps (or stable 60 updates/s) under normal and under load; no visible hitches tied to buffer size or BPM.

## v2 / Deferred

- User-adjustable dry/wet ratio or compressor amount in UI.
- Full LUFS metering display in Mixer.
- Optional "Air" amount (e.g. +1 / +2 / +3 dB) in UI.

## Out of Scope

- Changing SwiftF0 or playback engines.
- Full DAW-style mixing or per-stem EQ.

## Summary Table

| ID | Requirement | Category |
|----|-------------|----------|
| REQ-STUDIO-01 | DryBus and WetBus topology | Parallel bus |
| REQ-STUDIO-02 | Worklet Compressor 8:1, fast attack on WetBus | Parallel bus |
| REQ-STUDIO-03 | 70/30 dry/wet blend | Parallel bus |
| REQ-STUDIO-04 | Drum Bus high-shelf +2 dB @ 12 kHz | Air band |
| REQ-STUDIO-05 | Master limiter -14 LUFS | Auto-leveling |
| REQ-STUDIO-06 | Note Waterfall 60fps, decoupled from audio ticks | Visualizer |
