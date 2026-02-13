# Phase 22.1 Verification: Studio Polish

## Requirements Coverage

| Requirement | Implementation | Verification |
|-------------|----------------|---------------|
| REQ-STUDIO-01 | DryBus and WetBus; trio feeds both; sum to master | parallelDryGain (0.7) and parallelWetGain (0.3) from trioSum; both connect to parallelSumGain → makeupGain → backingBus. Mute/solo/volume unchanged. |
| REQ-STUDIO-02 | WetBus Worklet Compressor 8:1, fast attack (≤5 ms) | processorOptions ratio: 8, attack: 0.005 in tryUseJazzCompressorWorklet; Tone.Compressor fallback same. |
| REQ-STUDIO-03 | 70/30 dry/wet blend | PARALLEL_DRY_GAIN = 0.7, PARALLEL_WET_GAIN = 0.3. |
| REQ-STUDIO-04 | Drum Bus +2 dB @ 12 kHz | drumsAirBand Tone.Filter highshelf 12000 Hz, gain: 2. |
| REQ-STUDIO-05 | Master ~-14 LUFS; no clipping | masterOutputGain(1.8) before masterLimiter; limiter ceiling -0.5 dB. Verify with external LUFS meter; tune gain if needed. |
| REQ-STUDIO-06 | Note Waterfall 60fps, decoupled from audio | NoteWaterfall uses performance.now()/1000 for note startTime and animate "now"; no Tone.Transport in scroll path. |

## Manual Checks

- [ ] With Pro Mix on: blend sounds ~70 dry / 30 wet; wet path punchy (8:1).
- [ ] Drums: audible air/definition without harshness (+2 dB @ 12 kHz).
- [ ] Master: measure with LUFS meter during typical playback; adjust masterOutputGain if far from -14 LUFS.
- [ ] Note Waterfall: smooth scroll under load; no hitches tied to BPM or buffer.
