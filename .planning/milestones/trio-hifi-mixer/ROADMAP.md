# Trio Hi-Fi Mixer – Roadmap

## Phase 1 (Wave 1): Bus Architecture and Parallel Dry/Wet

**Focus**: Introduce parallel topology without changing compressor yet.

- **Success Criteria**: globalAudio builds a dry path (Gain) and a wet path (existing or placeholder compressor); their outputs are summed into masterBus. Trio (piano, bass, drums) feeds both paths. No regression in mute/solo/volume.
- **Tasks**:
  - [x] **REQ-HIFI-01**: Implement parallel bus: trio sum → dry Gain (e.g. 0.4) and wet path; dry + wet → masterBus (or current master chain).
  - [x] **REQ-HIFI-02**: Make dry/wet gains configurable (constants or signals); verify "Parallel NY" balance (attack + body).
- **Deliverables**: globalAudio.ts refactor; optional Mixer toggle to bypass parallel (fallback to current path) for safe rollout. ✅ Done.

## Phase 2 (Wave 2): WASM/Worklet Compressor

**Focus**: Replace wet-path compressor with soft-knee, jazz-tuned processing.

- **Success Criteria**: Wet path uses a compressor with soft knee and jazz-trio default params; piano doesn’t plink, bass sits. Trio is connected to the parallel mixer (REQ-HIFI-05).
- **Tasks**:
  - [x] **REQ-HIFI-03**: Implement soft-knee compression in an Audio Worklet (custom or Essentia.js); or document fallback and implement in follow-up.
  - [x] **REQ-HIFI-04**: Set default ratio ~4, knee ~30, attack ~5 ms, release ~150 ms (or adaptive).
  - [x] **REQ-HIFI-05**: Ensure piano, bass, drums (and reverb sends if desired) feed the parallel mixer correctly.
- **Deliverables**: `jazz-compressor-processor` worklet registered; globalAudio wet path uses it when loaded; parameter struct in processorOptions. ✅ Done.

## Phase 3 (Wave 3): RMS-Matching Makeup Gain

**Focus**: "Mastering" improves tone without volume jump.

- **Success Criteria**: Input RMS and output RMS are measured; makeup gain = InputRMS/OutputRMS (clamped); when "Mastering" is toggled on, perceived loudness is stable.
- **Tasks**:
  - [x] **REQ-HIFI-06**: Add RMS measurement (pre-compression input and post-sum output); 100–300 ms window, periodic update.
  - [x] **REQ-HIFI-07**: Apply automatic makeup gain node (Gain = InputRMS/OutputRMS, bounds 0.25–4.0).
  - [x] **REQ-HIFI-08**: Add "Mastering" / "Pro Mix" toggle in Mixer (or globalAudio); when on, parallel path + makeup are active; when off, dry-only or previous chain.
- **Deliverables**: RMS metering + makeup gain in chain; Mixer UI toggle; verification that toggle doesn’t change perceived level.

## Phase 4 (Wave 4): Air Band for Drums

**Focus**: Ride cymbal "ping" and high-end feel.

- **Success Criteria**: Drums bus (or drums send) has a high-shelf boost +3 dB at 12 kHz; audibly more definition on ride; no harshness.
- **Tasks**:
  - [x] **REQ-HIFI-09**: Add high-shelf EQ (+3 dB, 12 kHz) on drums path; Tone.EQ3 or BiquadFilter; optional bypass or tied to Pro Mix.
  - [x] **REQ-HIFI-10**: WebGPU EQ deferred unless already in use.
- **Deliverables**: Drums Air band in globalAudio; optional Mixer control; listening test. ✅ Done.

## Dependencies

- Phase 2 depends on Phase 1 (wet path must exist).
- Phase 3 depends on Phase 2 (compressor in place to measure output RMS).
- Phase 4 can be done in parallel with Phase 3 (independent EQ on drums bus).

## Success Metrics (Overall)

- A/B: Pro Mix on vs off → same perceived loudness, fuller tone on.
- Bass: sits; piano: no plinky transients; drums: punch + ride definition.
- No regressions: mute, solo, volume, reverb unchanged.
