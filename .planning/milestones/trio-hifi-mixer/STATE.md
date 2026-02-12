# Trio Hi-Fi Mixer – State

## Current Status

- **Phase**: Not started
- **Status**: Planning complete (PROJECT.md, REQUIREMENTS.md, ROADMAP.md)
- **Next**: Phase 1 – Bus architecture and parallel dry/wet sum

## Progress

| Phase | Status | Notes |
|-------|--------|--------|
| Phase 1: Bus architecture and parallel dry/wet | Not started | REQ-HIFI-01, REQ-HIFI-02 |
| Phase 2: WASM/Worklet compressor | Not started | REQ-HIFI-03, REQ-HIFI-04, REQ-HIFI-05 |
| Phase 3: RMS-matching makeup gain | Not started | REQ-HIFI-06, REQ-HIFI-07, REQ-HIFI-08 |
| Phase 4: Air band for drums | Not started | REQ-HIFI-09 |

## Active Requirements

- [ ] REQ-HIFI-01: Parallel bus topology
- [ ] REQ-HIFI-02: Dry/wet mix ratios
- [ ] REQ-HIFI-03: Soft-knee compression (WASM/worklet)
- [ ] REQ-HIFI-04: Jazz trio compressor params
- [ ] REQ-HIFI-05: Connect trio to parallel mixer
- [ ] REQ-HIFI-06: RMS measurement pre/post
- [ ] REQ-HIFI-07: Automatic makeup gain
- [ ] REQ-HIFI-08: Mastering / Pro Mix toggle
- [ ] REQ-HIFI-09: Drums Air band (+3 dB @ 12 kHz)

## Blockers

- None.

## Notes

- Milestone aligns with main PROJECT.md Pillar 3 (Sonic Layer) and extends Phase 3 (Sonic Layer) with pro dynamics and consistency.
- Existing chain: globalAudio.ts uses Tone.Compressor, masterLimiter, masterEQ, masterBus; pianoVol → pianoReverb → masterLimiter; bassVol/drumsVol → compressor → masterBus.
- Phase 22 in main roadmap: `.planning/phases/22-trio-hifi-mixer/`.
