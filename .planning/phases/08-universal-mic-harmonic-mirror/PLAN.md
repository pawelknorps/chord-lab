# Plan: Phase 8 – Universal Microphone Handler & Harmonic Mirror

**Roadmap**: Phase 8 (Steps 25–32)  
**Goal**: Single app-wide mic pipeline; Harmonic Mirror first (pitch/note accuracy, "teacher that listens"). Guide Tone Spotlight, Call and Response, useAuralMirror, noise gate, Live Note indicator; rhythm grading deferred.

---

## Frontmatter

- **Waves**: 4 (Central mic → Pitch-to-Theory + useAuralMirror → Guide Tone + Call & Response → Modes + Clapping + Migration).
- **Dependencies**: BiTonal Sandbox (SingingArchitect uses ml5 + getUserMedia); Tonal.js; LocalAgentService/nanoHelpers for Call & Response tips; JazzKiller/Practice Studio for Guide Tone; Tone.js for playback.
- **Files likely to be modified**:
  - New: `src/core/audio/MicrophoneService.ts` (or `src/core/services/MicrophoneService.ts`) — central mic + stream lifecycle.
  - New: `src/core/audio/pitchDetection.ts` or under MicrophoneService — PCM → pitch (YIN/MPM or Pitchy; or wrap ml5 path).
  - New: `src/hooks/useMicrophone.ts` — start/stop, isActive, permission.
  - New: `src/hooks/useAuralMirror.ts` — Live Note, clarity threshold, debounce, noise gate.
  - New: `src/components/shared/LiveNoteIndicator.tsx` (or inline in layout).
  - `src/modules/BiTonalSandbox/SingingArchitect.tsx` — migrate to shared mic service.
  - JazzKiller or Practice Studio: Guide Tone Spotlight UI (target 3rd, bar lights green).
  - New: Call and Response drill component + Nano tip on miss.

---

## Phase scope (from ROADMAP.md)

- **Step 25**: Central mic service — getUserMedia, stream lifecycle, is active, start/stop, permission handling.
- **Step 26**: Playing analysis — Pitch-to-Theory Pipe: Audio Worklet or AnalyserNode → YIN/MPM (e.g. Pitchy) → frequency; Tonal.js → MIDI/note, validate against chord.
- **Step 27**: useAuralMirror hook — Live Note with clarity > 90%, ~100 ms debounce, noise gate ~-40 dB; Live Note indicator in UI.
- **Step 28**: Guide Tone Spotlight — app plays drums/bass; student plays 3rd of chord; bar lights green when hit.
- **Step 29**: Call and Response — app plays motif; listens; mic verifies pitches; Nano tip on miss.
- **Step 30**: Modes and subscription — "pitch" and optional "rhythm"; consumers subscribe to pitch/beat/tempo.
- **Step 31**: Clapping analysis (secondary) — beat/onset, tempo.
- **Step 32**: Migration — BiTonal Sandbox to shared service; at least one other module uses handler (Guide Tone or Call & Response).

---

## Wave 1: Central mic service (Step 25)

### Task 1.1: MicrophoneService singleton (REQ-MIC-01, REQ-MIC-02)

- Implement a central service that owns `getUserMedia({ audio: true })`, holds the single `MediaStream`, and exposes:
  - `start(): Promise<void>` — request permission, create stream if not present; idempotent if already active.
  - `stop(): void` — stop all tracks, release stream.
  - `isActive(): boolean` — true when stream exists and not ended.
  - `getStream(): MediaStream | null` — for consumers that need raw stream (e.g. AnalyserNode, pitch detector).
- Do not open mic automatically on app load; require explicit start (e.g. user clicks "Enable mic" or a module requests it).
- **Location**: New file `src/core/audio/MicrophoneService.ts` (or `src/core/services/MicrophoneService.ts`).
- **Verification**: Manual: call start() once, getStream() returns stream; call stop(), getStream() null; start() again works.

### Task 1.2: useMicrophone hook

- Expose `useMicrophone()` that returns `{ start, stop, isActive, stream, error }`. Hook subscribes to MicrophoneService state (or uses React state updated by service callbacks/subscription).
- **Location**: New file `src/hooks/useMicrophone.ts`.
- **Verification**: In a test screen or BiTonal, use hook; start/stop toggles isActive and stream.

---

## Wave 2: Pitch-to-Theory Pipe + useAuralMirror (Steps 26, 27)

### Task 2.1: Pitch detection pipeline (REQ-MIC-08)

- From MicrophoneService stream: create AudioContext, create MediaStreamSource(stream), then either (a) AnalyserNode → process in main thread or (b) Audio Worklet → process in worklet. Run a pitch algorithm (YIN or MPM; e.g. use library like `pitchy` or `crepe`/ml5 path). Output: `{ frequency: number, clarity?: number }` or equivalent (confidence 0–1).
- **Reuse**: BiTonal Sandbox uses ml5.pitchDetection; option to wrap that in the central service so one stream feeds ml5, or replace with a lighter YIN/MPM implementation for lower latency.
- **Location**: New file `src/core/audio/pitchDetection.ts` or inside `MicrophoneService`; integrate with MicrophoneService when "pitch" mode is on.
- **Verification**: With mic on, speak/sing a note; pipeline returns plausible frequency (e.g. A4 → ~440 Hz).

### Task 2.2: Tonal.js note from frequency (REQ-MIC-08 Brain)

- Given frequency, use Tonal.js (e.g. `Note.fromFreq(freq)` or manual MIDI: `69 + 12*log2(freq/440)`) to get note name and MIDI. Optionally validate against current chord tones (chord passed in by consumer).
- **Location**: In pitch module or in useAuralMirror; keep Tonal in core/theory.
- **Verification**: 440 Hz → A4; 261 Hz → C4.

### Task 2.3: useAuralMirror hook (REQ-MIC-09, REQ-MIC-10)

- Hook that returns `{ liveNote: string | null, midi: number | null, clarity: number }` (or similar). Only update when clarity > 0.9 (90%); apply noise gate: do not report note when RMS/volume below ~-40 dB. Optional ~100 ms debounce before updating `liveNote` for stable UI.
- Hook uses MicrophoneService stream and pitch pipeline; subscribes to pitch events.
- **Location**: New file `src/hooks/useAuralMirror.ts`.
- **Verification**: Sing a note; liveNote appears after debounce; silence or low volume yields null.

### Task 2.4: Live Note indicator (REQ-MIC-11)

- A small UI component (e.g. corner of dashboard or module) that shows the current "Live Note" when mic is active and note is above clarity threshold. Show "—" or "Listening..." when mic on but no clear note. Hide or grey out when mic off.
- **Location**: New file `src/components/shared/LiveNoteIndicator.tsx`; mount in layout or dashboard when mic is active.
- **Verification**: Enable mic, play a note; indicator shows note name; stop playing, indicator shows listening or —.

---

## Wave 3: Guide Tone Spotlight + Call and Response (Steps 28, 29)

### Task 3.1: Guide Tone Spotlight mode (REQ-MIC-12)

- In JazzKiller or Practice Studio: when "Guide Tone" mode is on, app plays drums/bass (existing or minimal loop); current chord per bar from chart. Target note = 3rd of current chord: `Tonal.Chord.get(symbol).notes[1]`. useAuralMirror detects student pitch; when detected note matches target (with tolerance), mark current bar as "hit" (e.g. bar lights green).
- **Ignore Rhythm**: Do not grade timing; if pitch matches the chord’s 3rd for that bar, count success.
- **Location**: Integrate in Practice Studio or JazzKiller (e.g. BarRangeDrill or LeadSheet); add mode toggle and green bar state.
- **Verification**: Select Guide Tone mode, play 3rd of current chord; bar turns green.

### Task 3.2: Call and Response — playback + listen (REQ-MIC-13)

- App plays a short motif (4–8 notes) via Tone.js or existing sampler; then app goes silent and listens. Student plays back; buffer detected pitches (useAuralMirror or raw pitch stream). Compare buffer to expected notes (with tolerance). If mismatch: call Nano with context (expected notes, student notes, chord) and get a short tip (e.g. "You missed the b7 on G7...").
- **Location**: New component or screen (e.g. `CallAndResponseDrill.tsx`) or integrate into existing drill; use nanoHelpers.askNano for tip.
- **Verification**: Play motif → student copies correctly → success; student misses b7 → Nano returns tip about b7.

---

## Wave 4: Modes, Clapping, Migration (Steps 30, 31, 32)

### Task 4.1: Modes and subscription (REQ-MIC-05, Step 30)

- MicrophoneService (or pitch module) supports mode: "pitch" (default for Harmonic Mirror) and optionally "rhythm". Consumers subscribe to events: pitch updates and/or beat/tempo. API: e.g. `subscribePitch(callback)`, `subscribeBeat(callback)`; unsubscribe on cleanup.
- **Location**: Extend MicrophoneService or add a small event bus for pitch/beat.
- **Verification**: Module A subscribes to pitch; receives callbacks when mic on and pitch detected.

### Task 4.2: Clapping analysis (Step 31, REQ-MIC-04 — secondary)

- From same mic stream, optional path: AnalyserNode or energy threshold to detect onsets (claps). Estimate BPM from inter-onset intervals. Expose via `subscribeBeat` or `getTempo()`. Secondary to Harmonic Mirror; can be minimal (e.g. simple energy threshold).
- **Location**: `src/core/audio/onsetDetection.ts` or inside MicrophoneService when mode includes "rhythm".
- **Verification**: Clap steadily; BPM or beat events fire (optional for v1).

### Task 4.3: Migration and integration (Step 32, REQ-MIC-06)

- Migrate BiTonal Sandbox: SingingArchitect (or BiTonalSandbox) stops calling `getUserMedia` directly; instead uses MicrophoneService + useMicrophone/useAuralMirror. Pitch path can still use ml5 internally fed from MicrophoneService.getStream().
- At least one other module uses the handler: either Guide Tone Spotlight (Wave 3) or Call and Response (Wave 3). Both use the central mic and useAuralMirror.
- **Verification**: BiTonal Sandbox works with shared mic; no duplicate permission prompt. Guide Tone or Call & Response uses the same mic service.

---

## Verification (phase success criteria)

- **Step 25**: One central mic service; start/stop, isActive, single stream; permission once per session.
- **Step 26**: Pitch-to-Theory Pipe: PCM → pitch → frequency → Tonal.js note/MIDI; validate against chord when provided.
- **Step 27**: useAuralMirror returns Live Note with clarity > 90%, debounce ~100 ms, noise gate -40 dB; Live Note indicator visible when mic on.
- **Step 28**: Guide Tone Spotlight: target 3rd of chord; bar lights green when student hits it.
- **Step 29**: Call and Response: play motif → listen → verify pitches → Nano tip on miss.
- **Step 30**: Modes (pitch/rhythm) and subscription API for pitch (and optionally beat).
- **Step 31**: Clapping (beat/tempo) optional; secondary.
- **Step 32**: BiTonal migrated to shared service; at least one other module (Guide Tone or Call & Response) uses handler.

**Phase goal**: One mic permission and one stream; Harmonic Mirror in use (Guide Tone or Call & Response); Live Note indicator and noise gate; playing yields pitch/notes validated by Tonal.js.

---

## Plan check (requirements)

- **REQ-MIC-01** (single app-wide mic): Task 1.1.
- **REQ-MIC-02** (permission, lifecycle): Task 1.1, 1.2.
- **REQ-MIC-03** (playing analysis): Tasks 2.1, 2.2.
- **REQ-MIC-04** (clapping): Task 4.2.
- **REQ-MIC-05** (modes): Task 4.1.
- **REQ-MIC-06** (integration): Task 4.3.
- **REQ-MIC-07** (Harmonic Mirror focus): UX in 3.1, 3.2; no rhythm grading.
- **REQ-MIC-08** (Pitch-to-Theory): Tasks 2.1, 2.2.
- **REQ-MIC-09** (useAuralMirror): Task 2.3.
- **REQ-MIC-10** (noise gate): Task 2.3.
- **REQ-MIC-11** (Live Note indicator): Task 2.4.
- **REQ-MIC-12** (Guide Tone Spotlight): Task 3.1.
- **REQ-MIC-13** (Call and Response): Task 3.2.
- **REQ-MIC-14** (Smart mic goals): Target Practice / Guide Tone in 3.1; Lick Validation in 3.2; plan only for Drone/Energy in docs.
- **REQ-MIC-15** (Tone Quality v2): Deferred.
