# Studio Polish – State

## Current Status

- **Phase**: Not started (0% complete).
- **Objective**: When a user puts on headphones, the app must sound like a mastered record, not a MIDI file ($29/mo justification).
- **Priority**: High.

## Checklist

### Phase 1: Parallel Compression Bus

- [ ] REQ-STUDIO-01: DryBus and WetBus topology implemented.
- [ ] REQ-STUDIO-02: Worklet Compressor 8:1, fast attack on WetBus.
- [ ] REQ-STUDIO-03: 70/30 dry/wet blend verified.

### Phase 2: Air Band and Auto-Leveling

- [ ] REQ-STUDIO-04: Drum Bus high-shelf +2 dB @ 12 kHz.
- [ ] REQ-STUDIO-05: Master limiter -14 LUFS.

### Phase 3: Visualizer Interpolation

- [ ] REQ-STUDIO-06: Note Waterfall 60fps, decoupled from audio ticks.

## Next Steps

1. Implement Phase 1 (parallel bus) in globalAudio or equivalent.
2. Add Drum Bus Air band and Master LUFS limiter.
3. Refactor Note Waterfall to 60fps interpolation (requestAnimationFrame + last-known state).
