# Phase 3: The Sonic Layer — Verification

## Success Criteria (from ROADMAP)

- High-quality samples with a 3-track mixer for user control and studio-grade effects.

## Checklist

- [x] **No clipping/distortion** when all tracks are at 100% volume (Limiter check).  
  Master chain in `globalAudio.ts`: `Tone.Limiter(-0.5)` as final stage; all stems route through compressor → masterBus → masterEQ → masterLimiter.

- [x] **Note Waterfall** maintains 60fps during playback.  
  Single `requestAnimationFrame` loop; positioning uses `Tone.Transport.seconds`; note buffer capped (5s window); canvas sized via ResizeObserver.

- [x] **Mute/Solo** correctly state-manage the Tone.Sampler channels.  
  `jazzSignals` (piano/bass/drums muted/solo); `globalAudio.getOutputVolume()` applies mute/solo to `pianoVol`, `bassVol`, `drumsVol`; PremiumMixer and useJazzBand/useJazzPlayback use the same signals.

- [x] **Premium Mixer** integrated: Bass, Drums, Piano volume sliders, Mute/Solo, Reverb; Master Limiter noted in footer.

- [x] **Note Waterfall** wired to band engine (`onNote` from useJazzEngine); harmonic coloring (root/third/fifth/seventh/extension).

- [x] **Tone Analysis**: ToneSpectrumAnalyzer (real-time mic FFT) and Acoustic Feedback (Warmth/Brightness) in sidebar when mixer is open.

## Performance Audit (W3-T3)

- **Audio**: Existing Tone.js graph unchanged; single AnalyserNode per mic consumer when mic is active; no extra processing on master bus.
- **Visuals**: Note Waterfall — one rAF loop, no React re-renders per frame. Tone spectrum — FFT written to ref every frame; React state (warmth/brightness) throttled to every 3 frames to avoid 60 setState/sec. Canvas draw loops only when component is mounted and (for spectrum) when mic is active.
- **Recommendation**: Under load (many tracks + mic + waterfall + spectrum), if frame drops occur, consider reducing spectrum bar count or throttling waterfall draw to 30fps.
