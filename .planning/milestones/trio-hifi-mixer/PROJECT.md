# Trio Hi-Fi Mixer (WASM Compressor & Parallel Processing) – Project Vision

## Vision Statement

Make JazzKiller trio playback sound **consistent and hi-fi** by replacing the blunt native `DynamicsCompressorNode` with a **Custom WASM Compressor** and **Parallel (NY-style) Mix**, plus **Intelligent Makeup Gain** and an **"Air" Band** EQ—so the app feels like a high-end recording session rather than a practice tool.

## Problem Statement

For the specific trio (Piano, Double Bass, Drums):

- **Double Bass** needs heavy but transparent control to sit in the mix; the native browser compressor is too blunt.
- **Piano** needs a soft-knee response so transients don’t sound "plinky" or electric.
- **Drums** need to retain attack while the body is fattened (parallel compression).
- **Mastering** toggle today causes a volume jump; students should hear tonal improvement without getting louder.
- **Sampled drums** lack "ping" on the ride; a high-shelf "Air" band would bring out the cymbal.

## Core Value Proposition

**“Studio-grade dynamics and consistency for the jazz trio—without volume jumps.”**

1. **WASM-powered dynamics**: Soft-knee, lookahead-capable compression (Essentia.js or custom Rust Audio Worklet) so bass is controlled and piano stays wooden.
2. **Parallel (NY) mix**: Blend 100% wet compressed signal with ~40% dry so drums keep attack and body is fattened.
3. **Intelligent Makeup Gain**: RMS-matching loop (input RMS / output RMS) so toggling "Mastering" doesn’t increase perceived volume—only fullness and consistency.
4. **Air band**: High-shelf boost (+3 dB at 12 kHz) for the drums bus to bring out ride cymbal "ping."

## Target Audience

- **Jazz students** practicing with JazzKiller who want playback to sound professional and consistent.
- **Teachers** using the app in classroom or demo settings where hi-fi matters.
- **Developers** extending the audio chain (globalAudio, Mixer UI) with bus-based architecture.

## Core Functionality (The ONE Thing)

**The trio mix is consistent and hi-fi: bass sits, piano doesn’t plink, drums have punch and air—and the "Mastering" button improves tone without making it louder.**

Students must be able to:

- Hear bass clearly without boom; piano transients natural; drums with punch and ride definition.
- Toggle a "Mastering" or "Pro Mix" control and hear fuller, more professional sound at stable loudness.
- Optionally hear more "air" on the drums (ride ping) via an Air band or preset.

## Key Requirements (High-Level)

- **Bus architecture**: Dry path (e.g. 40% gain) and wet path (WASM compressor) summed to destination; trio sources (bass, piano, drums) feed both paths as appropriate.
- **Soft-knee WASM compressor**: Logarithmic gain reduction; parameters (ratio, knee, attack ~5 ms for bass transients, adaptive release) suitable for jazz trio; implemented via Audio Worklet (WASM) or Essentia.js.
- **Parallel mix**: Blend wet (compressed) and dry so attack is retained (drums) and body is fattened.
- **RMS-matching makeup gain**: Measure input RMS (pre-compression) and output RMS (post-compression); apply gain = InputRMS / OutputRMS so toggling mastering doesn’t change perceived volume.
- **Air band**: High-shelf EQ (+3 dB at 12 kHz) on the drums bus (or master) to bring out ride cymbal; implement as Tone.EQ3 / BiquadFilter or, by 2026, WebGPU EQ if available.

## Technical Constraints

- Integrate with existing **globalAudio.ts** chain: `pianoVol`, `bassVol`, `drumsVol` → current compressor → masterBus → masterEQ → masterLimiter.
- Reuse **Tone.js** where possible; add Audio Worklet(s) only for compressor (and optional EQ) where native nodes are insufficient.
- No change to JazzKiller song/playback data; mixer and destination chain only.
- Optional: **Mixer UI** toggle for "Pro Mix" / "Mastering" that enables parallel compressor + RMS makeup.

## Out of Scope (v1)

- Full DAW-style multi-band compressor per instrument.
- User-editable compressor parameters (preset-only for v1).
- WebGPU EQ required only if Tone/BiquadFilter is insufficient for Air band.

## Success Metrics

- A/B: With "Pro Mix" on, perceived loudness unchanged vs off, but mix is fuller and more consistent.
- Bass: No boom; sits in mix. Piano: No plinky transients. Drums: Punch retained, ride has more definition with Air band.
- No regressions: Existing mute/solo/volume and reverb behaviour unchanged.

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Parallel (NY) mix** | Retains attack (drums), fatten body; standard pro approach for jazz. |
| **WASM / Worklet compressor** | Enables soft knee, lookahead, true peak limiting; native node is too blunt. |
| **RMS-matching makeup** | "Mastering" improves tone without volume jump—key UX ask. |
| **Air band on drums** | Simple high-shelf at 12 kHz brings out ride; no need for full multi-band. |

## Integration Points

- **globalAudio.ts**: Insert parallel compressor bus (dry gain + wet worklet) before or in place of current single compressor; route piano/bass/drums into both dry and wet; sum to masterBus. Add RMS metering and makeup gain node.
- **Mixer UI**: Optional "Pro Mix" / "Mastering" toggle; optional "Air" checkbox or preset for drums.
- **Audio Worklets**: Register `wasm-compressor-processor` (or equivalent) with soft-knee, ratio, attack ~5 ms, adaptive release.

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation waves (ROADMAP.md).
3. Implement Wave 1: Bus architecture and parallel dry/wet sum.
4. Implement Wave 2: WASM/Worklet compressor (soft-knee, params).
5. Implement Wave 3: RMS-matching makeup gain.
6. Implement Wave 4: Air band (high-shelf 12 kHz) for drums.
