# Phase 8 – Universal Microphone Handler & Harmonic Mirror: Summary

## Goal (from ROADMAP)

Single app-wide mic pipeline; Harmonic Mirror first (pitch/note accuracy, "teacher that listens"). Guide Tone Spotlight, Call and Response, useAuralMirror, noise gate, Live Note indicator; rhythm grading deferred.

## Waves Executed

### Wave 1: Central mic service (Step 25)

- **Task 1.1**: `MicrophoneService.ts` — singleton with `start()`, `stop()`, `isActive()`, `getStream()`, `subscribe(listener)`.
- **Task 1.2**: `useMicrophone.ts` — hook returning `{ start, stop, isActive, stream, error }`; subscribes to MicrophoneService.
- **Commit**: feat(mic): Phase 8 Wave 1 – central mic service and useMicrophone hook.

### Wave 2: Pitch-to-Theory Pipe + useAuralMirror (Steps 26, 27)

- **Task 2.1**: `pitchDetection.ts` — `createPitchPipeline(stream)` using ml5 + AnalyserNode for RMS; noise gate -40 dB.
- **Task 2.2**: Tonal.js note from frequency — used in useAuralMirror via `Note.fromFreq(freq)` and `Note.midi(noteName)`.
- **Task 2.3**: `useAuralMirror.ts` — returns `{ liveNote, midi, clarity }`; clarity > 90%, debounce 100 ms, noise gate in pipeline.
- **Task 2.4**: `LiveNoteIndicator.tsx` — shows live note or "Listening…" when mic on.
- **Commit**: feat(mic): Phase 8 Wave 2 – Pitch-to-Theory Pipe, useAuralMirror, Live Note indicator.

### Wave 3: Guide Tone Spotlight + Call and Response (Steps 28, 29)

- **Task 3.1**: Guide Tone Spotlight — `usePracticeStore`: `guideToneSpotlightMode`, `guideToneBarsHit`, `setGuideToneSpotlightMode`, `addGuideToneBarHit`. `GuideToneSpotlightEffect` compares useAuralMirror live note to 3rd of current chord (GuideToneCalculator); marks bar green. LeadSheet shows green bar when `guideToneBarsHit[index]`. JazzKillerModule: Mic button toggles Spotlight and starts mic; `LiveNoteIndicator` when Spotlight on.
- **Task 3.2**: Call and Response — `CallAndResponseDrill.tsx`: plays 4-note motif (globalAudio), listens via useAuralMirror, buffers notes, compares to expected; on miss calls `askNano` for tip. Wired in Practice Panel (Drills).
- **Commit**: (included in Wave 3 file set)

### Wave 4: Modes, Clapping, Migration (Steps 30, 31, 32)

- **Task 4.1**: Modes — MicrophoneService and useAuralMirror document "pitch" (default); subscription is via useAuralMirror / createPitchPipeline. Rhythm mode secondary (stub/planned).
- **Task 4.2**: Clapping — secondary; not implemented in this phase; pipeline and service support future onset/beat.
- **Task 4.3**: Migration — BiTonal Sandbox: SingingArchitect accepts optional `stream` prop; when provided, uses shared stream and does not stop its tracks. BiTonalSandbox uses `useMicrophone()`, shows "Enable app microphone", passes `micStream` to SingingArchitect. One mic permission; no duplicate getUserMedia in BiTonal when using shared mic.
- **Commit**: (Wave 4 changes)

## Files Created / Modified

- **New**: `src/core/audio/MicrophoneService.ts`, `src/core/audio/pitchDetection.ts`, `src/hooks/useMicrophone.ts`, `src/hooks/useAuralMirror.ts`, `src/components/shared/LiveNoteIndicator.tsx`, `src/modules/JazzKiller/components/GuideToneSpotlightEffect.tsx`, `src/modules/JazzKiller/components/CallAndResponseDrill.tsx`.
- **Modified**: `src/core/store/usePracticeStore.ts` (guideToneSpotlightMode, guideToneBarsHit, actions), `src/modules/JazzKiller/components/LeadSheet.tsx` (green bar when hit), `src/modules/JazzKiller/JazzKillerModule.tsx` (Spotlight toggle, effect, LiveNoteIndicator, CallAndResponseDrill), `src/modules/BiTonalSandbox/SingingArchitect.tsx` (optional stream prop, no stop of external stream), `src/modules/BiTonalSandbox/BiTonalSandbox.tsx` (useMicrophone, pass stream).

## Verification

- One central mic service; start/stop, isActive, single stream; permission once per session.
- Pitch-to-Theory: PCM → pitch (ml5) → frequency → Tonal.js note/MIDI; noise gate -40 dB.
- useAuralMirror: Live Note with clarity > 90%, debounce ~100 ms; Live Note indicator when mic on.
- Guide Tone Spotlight: target 3rd of chord; bar lights green when student hits it (JazzKiller).
- Call and Response: play motif → listen → verify pitches → Nano tip on miss (Practice Panel).
- Modes: pitch default; rhythm secondary/stub.
- BiTonal migrated to shared service when "Enable app microphone" is used; at least one other module (Guide Tone Spotlight, Call and Response) uses the handler.

**Phase goal**: One mic permission and one stream; Harmonic Mirror in use (Guide Tone or Call & Response); Live Note indicator and noise gate; playing yields pitch/notes validated by Tonal.js.
