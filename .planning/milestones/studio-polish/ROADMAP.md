# Studio Polish – Roadmap

## Phase 1: Parallel Compression Bus (NY Trick)

**Goal**: DryBus and WetBus in place; heavy Worklet Compressor on wet; 70/30 blend.

- **REQ-STUDIO-01**: Implement DryBus and WetBus in AudioGraph; trio sum feeds both; sum to master.
- **REQ-STUDIO-02**: Add Worklet Compressor on WetBus (ratio 8:1, fast attack).
- **REQ-STUDIO-03**: Set blend 70% dry / 30% wet; verify audibly.

**Success**: Parallel NY compression active; punch + body; no regression on mute/solo/volume.

---

## Phase 2: The "Air" Band and Auto-Leveling

**Goal**: Drum Bus has air; Master has consistent loudness.

- **REQ-STUDIO-04**: Add high-shelf EQ +2 dB @ 12 kHz to Drum Bus.
- **REQ-STUDIO-05**: Implement Master limiter targeting -14 LUFS; verify level consistency.

**Success**: Drums sound "expensive"; app loudness ~-14 LUFS regardless of content.

---

## Phase 3: Visualizer Interpolation

**Goal**: Note Waterfall runs at 60fps independent of audio.

- **REQ-STUDIO-06**: Decouple Note Waterfall from audio ticks; drive with requestAnimationFrame (or 60 Hz); consume last-known state from store/SAB; verify 60fps and no hitches under load.

**Success**: Waterfall smooth at 60fps; no stutter when audio thread is busy.

---

## Mapping: Requirements → Phases

| REQ | Phase |
|-----|-------|
| REQ-STUDIO-01, 02, 03 | 1 |
| REQ-STUDIO-04, 05 | 2 |
| REQ-STUDIO-06 | 3 |
