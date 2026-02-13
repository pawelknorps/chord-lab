# Studio Polish – Project Vision

## Vision Statement

When a user puts on headphones, the app must **sound like a mastered record, not a MIDI file**. This is what justifies the $29/mo. The "Studio" Polish phase elevates perceived production value through parallel compression, air band, consistent loudness (LUFS), and a smooth 60fps Note Waterfall—so the app feels expensive and professional.

## Problem Statement

- **Current state**: The app works, but it doesn't "feel" expensive (0% complete for this phase).
- **Gap**: Raw trio playback can sound thin or inconsistent; volume varies with how many notes the user plays; visualizer can stutter when tied to audio ticks.
- **Goal**: Headphones-on experience = mastered record: punchy, airy, consistent level, and buttery-smooth visuals.

## Core Value Proposition

1. **Parallel Compression Bus (NY trick)**: DryBus + WetBus; WetBus gets heavy Worklet Compressor (8:1, fast attack); blend 70% dry / 30% wet so transients stay punchy and body is fattened.
2. **The "Air" Band**: High-shelf EQ +2 dB @ 12 kHz on the Drum Bus so web-audio drums sound expensive (ride "ping").
3. **Auto-Leveling (LUFS)**: Limiter on Master Output so the app is consistently loud (-14 LUFS) regardless of how many notes the user plays.
4. **Visualizer Interpolation**: Note Waterfall renders at 60fps independent of audio logic—decouple UI ticks from audio ticks so the waterfall never stutters.

## Target Audience

- **Paying subscribers** who expect premium sound and smooth UX.
- **Jazz students** practicing with headphones who judge quality by "does this sound like a record?"
- **Product** positioning: $29/mo justified by sonic and visual polish.

## Core Functionality (The ONE Thing)

**Headphones on = mastered record: consistent loudness, punch + air, and 60fps Note Waterfall—no MIDI-file feel, no stutter.**

## High-Level Requirements

| Area | Goal | Out of Scope |
|------|------|--------------|
| Parallel compression | DryBus + WetBus; Worklet Compressor 8:1, fast attack; 70/30 blend | Full multi-band per stem |
| Air band | +2 dB @ 12 kHz on Drum Bus | User-adjustable EQ |
| LUFS | Master limiter targeting -14 LUFS | Full loudness metering UI |
| Visualizer | Note Waterfall 60fps; decouple from audio ticks | Rewrite of Tone.Transport |

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| 70/30 dry/wet | NY-style parallel: retain transients, add weight. |
| 8:1 ratio, fast attack | Heavy squash on wet bus for punch without killing dynamics on dry. |
| -14 LUFS | Streaming-style reference; consistent level regardless of content. |
| 60fps interpolation | requestAnimationFrame or fixed 60Hz tick for waterfall; sample audio state, don't block on audio. |

## Success Metrics

- A/B: With Studio Polish on, perceived quality "like a record" (subjective); level consistent at -14 LUFS.
- Note Waterfall: 60fps (or 60 updates/s) independent of buffer size or BPM; no visible hitches.
- No regression: Mute/solo/volume and existing mixer behaviour unchanged.

## Integration Points

- **globalAudio / AudioGraph**: DryBus, WetBus, Worklet Compressor, sum; Drum Bus → Air high-shelf; Master → LUFS limiter.
- **Note Waterfall component**: Consume pitch/MIDI from store or SAB via interpolated/tick-decoupled updates (e.g. requestAnimationFrame + last-known state).
- **Trio Hi-Fi milestone**: Can build on or align with Phase 22 bus architecture; Studio Polish adds specific blend ratio, LUFS, and visualizer decoupling.

## Out of Scope

- Full DAW-style mixing.
- User-editable compressor/EQ (preset-only).
- Changing SwiftF0 or playback engines.

## Next Steps

1. Detail requirements with REQ-IDs (REQUIREMENTS.md).
2. Plan implementation waves (ROADMAP.md).
3. Track progress in STATE.md.
