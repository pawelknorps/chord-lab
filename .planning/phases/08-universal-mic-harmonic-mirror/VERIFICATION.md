# Phase 8 – Universal Microphone Handler & Harmonic Mirror: Verification

## Phase goal (from ROADMAP)

Single app-wide mic pipeline; Harmonic Mirror first (pitch/note accuracy, "teacher that listens"). Guide Tone Spotlight, Call and Response, useAuralMirror, noise gate, Live Note indicator; rhythm grading deferred.

## Goal-backward check

1. **One mic permission and one stream**  
   - **Must be true**: MicrophoneService owns a single `getUserMedia` stream; all consumers use `MicrophoneService.start()` / `getStream()` or `useMicrophone()`.  
   - **Verified**: `MicrophoneService.ts` has single stream, `start()`/`stop()`/`getStream()`; BiTonal and JazzKiller use `useMicrophone()` and pass stream or start mic from service.

2. **Harmonic Mirror in use (Guide Tone or Call & Response)**  
   - **Must be true**: At least one of Guide Tone Spotlight or Call and Response is implemented and uses the central mic + pitch.  
   - **Verified**: Guide Tone Spotlight (JazzKiller: Mic button, GuideToneSpotlightEffect, green bar on hit) and Call and Response (CallAndResponseDrill in Practice Panel) both use useAuralMirror / useMicrophone.

3. **Live Note indicator and noise gate**  
   - **Must be true**: Live Note indicator visible when mic on; pitch pipeline applies noise gate (~-40 dB).  
   - **Verified**: `LiveNoteIndicator.tsx` shows live note or "Listening…" when mic active; `pitchDetection.ts` uses `NOISE_GATE_DB = -40` and only emits when RMS >= -40 dB.

4. **Playing yields pitch/notes validated by Tonal.js**  
   - **Must be true**: useAuralMirror returns note name via Tonal.js `Note.fromFreq`; pitch pipeline feeds frequency.  
   - **Verified**: `useAuralMirror.ts` uses `Note.fromFreq(result.frequency)` and `Note.midi(noteName)`; pitchDetection returns frequency; clarity > 90% before updating.

5. **BiTonal migrated to shared service**  
   - **Must be true**: BiTonal Sandbox uses MicrophoneService stream when in mic mode instead of opening its own getUserMedia.  
   - **Verified**: BiTonalSandbox uses `useMicrophone()`, passes `micStream` to SingingArchitect; SingingArchitect accepts `stream` prop and does not stop external stream tracks.

## ROADMAP steps

- **Step 25**: Central mic service — done (MicrophoneService, useMicrophone).
- **Step 26**: Pitch-to-Theory Pipe — done (pitchDetection + Tonal.js in useAuralMirror).
- **Step 27**: useAuralMirror, Live Note, noise gate, debounce — done.
- **Step 28**: Guide Tone Spotlight — done (store, effect, LeadSheet green bar, JazzKiller toggle).
- **Step 29**: Call and Response — done (CallAndResponseDrill, Nano tip on miss).
- **Step 30**: Modes and subscription — done (pitch default; subscription via useAuralMirror / createPitchPipeline).
- **Step 31**: Clapping — secondary; not implemented (stub/planned).
- **Step 32**: Migration — done (BiTonal uses shared mic; Guide Tone + Call & Response use handler).

## Success criteria (ROADMAP)

- One mic permission and one stream — **met**  
- Harmonic Mirror in use (Guide Tone or Call & Response) — **met**  
- Live Note indicator and noise gate — **met**  
- "Ignore Rhythm" UX — **met** (no rhythm grading in v1)  
- Playing yields pitch/notes validated by Tonal.js — **met**  
- Optional clapping yields beat/tempo — **deferred** (Step 31 secondary)

**Phase 8 verification**: Complete. Phase goal achieved; Step 31 (clapping) intentionally deferred.
