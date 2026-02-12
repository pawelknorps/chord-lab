# Milestone: Audio Glitch Diagnosis (Mic + Pitch + Playback)

## Vision

Identify and document the root cause(s) of audio playback glitching when microphone pitch detection is turned on, so we can fix or mitigate them.

## Goal

- **Plan** a set of tests that reveal why playback glitches when mic pitch is on.
- **Run** those tests and capture findings.
- **Document** hypotheses and next steps (context isolation, main-thread load, multiple contexts).

## Scope

- Unit tests: context isolation (pitch vs playback), pitch pipeline using dedicated context only.
- Integration-style tests: main-thread load vs Tone scheduling (simulated).
- Documentation: where mic, pitch, and playback touch the audio stack; multiple RAF loops and extra AudioContexts (e.g. useMicSpectrum).

## Out of Scope

- E2E tests in a real browser with real audio (manual or future).
- Fixing the glitch in this milestone (follow-up phase).

## Key Hypotheses to Test

1. **Context sharing**: Playback (Tone) and pitch (worklet + analyser) must use different AudioContexts; any use of Tone's context for the mic path would cause glitches.
2. **Main-thread blocking**: Multiple requestAnimationFrame loops (HighPerformanceScoringBridge, ExerciseInputAdapter, useMicSpectrum, createPitchPipeline legacy path, etc.) plus Tone's main-thread scheduling could cause late callbacks and buffer underruns.
3. **Multiple contexts**: useMicSpectrum creates its own `new AudioContext()` when the mic is on, so with JazzKiller we can have Tone + pitch + spectrum = 3 contexts and more main-thread work.

## REQ-GLITCH-04: Multiple contexts and RAF loops (documented)

When mic + playback are active, the following create AudioContexts or run requestAnimationFrame loops:

**AudioContexts:**
- **Tone** (playback): `globalAudio` / `getSharedAudioContext()` — used for piano, bass, drums, reverb.
- **Pitch**: `getPitchAudioContext()` — used by `useITMPitchStore` (worklet) and `createPitchPipeline` (analyser path).
- **useMicSpectrum** (JazzKiller): creates its own `new AudioContext()` for FFT spectrum viz when mic is on — **third context**.

**RAF loops when mic + playback + scoring active:**
- `HighPerformanceScoringBridge`: getLatestPitch + processNote every frame.
- `ExerciseInputAdapter`: getLatestPitch every frame (mic source).
- `useMicSpectrum`: getByteFrequencyData + warmth/brightness every frame.
- `createPitchPipeline` (if used): computeRmsDb + legacyPitchFromAnalyser every 2nd frame.
- `JazzPitchMonitor`, `GuideToneSpotlightEffect`, `useStandardsExercise`, `NoteWaterfall`, etc. may add more.

**Mitigation ideas:** Use pitch context for useMicSpectrum (single AnalyserNode on pitch context); throttle or coalesce RAF work; move more work into worklet/worker.
