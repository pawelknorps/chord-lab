# Studio Polish – State

## Current Status

- **Phase**: Complete (Phase 22.1 executed).
- **Objective**: When a user puts on headphones, the app must sound like a mastered record, not a MIDI file ($29/mo justification).
- **Priority**: High.

## Checklist

### Phase 1: Parallel Compression Bus

- [x] REQ-STUDIO-01: DryBus and WetBus topology implemented (parallelDryGain 0.7, parallelWetGain 0.3 into parallelSumGain).
- [x] REQ-STUDIO-02: Worklet Compressor 8:1, fast attack (≤5 ms) on WetBus (processorOptions ratio: 8, attack: 0.005; Tone fallback same).
- [x] REQ-STUDIO-03: 70/30 dry/wet blend verified (PARALLEL_DRY_GAIN 0.7, PARALLEL_WET_GAIN 0.3).

### Phase 2: Air Band and Auto-Leveling

- [x] REQ-STUDIO-04: Drum Bus high-shelf +2 dB @ 12 kHz (drumsAirBand gain: 2).
- [x] REQ-STUDIO-05: Master output ~-14 LUFS (masterOutputGain 1.8 before limiter; verify with external LUFS meter; no clipping).

### Phase 3: Visualizer Interpolation

- [x] REQ-STUDIO-06: Note Waterfall 60fps, decoupled from audio ticks (wall-clock time via performance.now() in NoteWaterfall.tsx).

## Next Steps

1. Optional: A/B listen with Pro Mix on; confirm punch and body.
2. Optional: Tune masterOutputGain if measured LUFS differs from -14.
