---
wave: 1
dependencies: []
files_to_modify:
  - src/modules/ChordLab/ChordLab.tsx
  - src/core/services/AudioManager.ts
  - src/context/AudioContext.tsx
  - src/core/services/InstrumentService.ts
estimated_time: 1-2 hours
---

# Plan: Debug ChordLab Piano Click — No Sound

## Goal

Identify why clicking the piano (and progression chords) in ChordLab produces no sound, then fix it using runtime evidence. Use the existing audio engine and realistic piano playback (AudioManager + InstrumentService) once the cause is known.

## Context

- ChordLab uses `UnifiedPiano` with `onNoteClick` → `handleNoteToggle` → `audioManager.initialize().then(() => audioManager.playNote(...))`.
- Past logs showed: click reaches handler (H1, H2); when play was gated on `startAudio().then()`, the callback never ran; when play was immediate, `initialized` stayed false and only fallback synth played.
- See **RESEARCH.md** in this folder for architecture, evidence, and hypotheses (A–E).

## Tasks

### Task 1: Add Minimal Instrumentation to Confirm Where the Chain Stops

<task>
<description>
Add logs so we can see: (1) whether initialize() completes or rejects, (2) whether playNote is called after init, (3) Tone.context.state and initialized state at play time.
</description>

<steps>
1. In `AudioManager.initialize()`: at start of the async IIFE log `AudioManager.initialize:start` and `Tone.context.state`; after `Tone.start()` log `Tone.context.state` again; before setting `initialized = true` log `AudioManager.initialize:success`; in catch log `AudioManager.initialize:error` and the error message.
2. In `ChordLab.handleNoteToggle`: right before `audioManager.initialize().then(...)` log `ChordLab:beforeInitialize`; inside `.then()` log `ChordLab:initializeResolved, calling playNote`; inside `.catch()` log `ChordLab:initializeRejected` and call playNote (fallback).
3. In `AudioManager.playNote()`: when taking the `initialized` branch log `playNote:usingRealInstrument` and `hasInst`; when taking the fallback branch log `playNote:usingFallback`.
4. Use either the debug ingest endpoint (if server running) or `console.log` so logs are visible in browser console. Prefer one consistent mechanism (e.g. console) so reproduction is reliable.
5. Clear or ignore previous debug.log before the run; document how to reproduce (open ChordLab, click piano 2–3 times, click one progression chord if present).
</steps>

<verification>
- [ ] After one piano click we see either initialize:success or initialize:error or no resolve/reject (init hangs).
- [ ] We see either initializeResolved + playNote:usingRealInstrument or initializeRejected/playNote:usingFallback.
- [ ] Tone.context.state is logged at least at init start.
</verification>
</task>

### Task 2: Reproduce and Capture Logs

<task>
<description>
User (or developer) reproduces the bug and captures console (or debug.log) output for at least 2–3 piano clicks and one chord slot click.
</description>

<steps>
1. Start app; open ChordLab.
2. Open browser DevTools → Console; clear console.
3. Click 2–3 piano keys; if a chord exists in the progression, click one chord slot.
4. Copy/save all log lines that contain: ChordLab, AudioManager, initialize, playNote, Tone.context.
5. Attach or paste logs into the phase folder (e.g. VERIFICATION.md or a paste in chat) for analysis.
</steps>

<verification>
- [ ] Logs are available for analysis.
- [ ] Logs cover both piano and (if applicable) progression chord click.
</verification>
</task>

### Task 3: Analyze Logs and Decide Root Cause

<task>
<description>
Map log evidence to hypotheses A–E and decide the single most likely root cause.
</description>

<steps>
1. Check whether `AudioManager.initialize:success` ever appears → if not, init never completes (A or B or C).
2. If `initialize:error` appears → init rejected (B or D); inspect error message and network/CORS.
3. If `Tone.context.state` stays `suspended` after `Tone.start()` → user gesture / context issue (C).
4. If init succeeds but `playNote:usingFallback` still appears on next click → logic bug (e.g. wrong branch or instrument not stored).
5. If `ChordLab:initializeResolved` never appears but init logs success → .then() not attached or different promise (unlikely).
6. Document: CONFIRMED / REJECTED / INCONCLUSIVE for each of A–E with one-line log evidence.
7. Pick one root cause to fix (prefer the one that explains “no sound” end-to-end).
</verification>
- [ ] Each hypothesis A–E has a verdict with cited log line(s).
- [ ] One root cause is chosen for the fix.
</verification>
</task>

### Task 4: Implement Fix with Evidence

<task>
<description>
Apply a minimal, targeted fix for the chosen root cause; keep instrumentation in place for one more run.
</description>

<steps>
1. If root cause is “initialize() never resolves” (A/C): ensure Tone.start() is invoked synchronously in the same user gesture as the click (already done in UnifiedPiano); consider calling Tone.start() at the very start of handleNoteToggle as well, then await audioManager.initialize() (or ensure initialize() does not depend on a different startAudio() that never resolves). Option: bypass startAudio() and only use audioManager.initialize() + playNote, with Tone.start() in piano click.
2. If root cause is “initialize() rejects” (B/D): fix network/CORS or fallback path; ensure .catch() in ChordLab still calls playNote so fallback is heard; optionally retry or show user message.
3. If root cause is “context not running at play time” (C): ensure all play happens after Tone.start() in the same gesture chain (e.g. Tone.start() in handler, then initialize().then(play)).
4. If root cause is “wrong instrument / fallback used” (D/E): fix InstrumentService or AudioManager so real piano is stored and selected; add a simple check (e.g. sampler vs synth) if needed.
5. Do not remove instrumentation yet; add a short comment or runId in logs for “post-fix” run if desired.
</steps>

<verification>
- [ ] Fix is applied in the minimal set of files.
- [ ] No removal of existing debug logs until Task 5 confirms success.
</verification>
</task>

### Task 5: Verify Fix with Logs and User Confirmation

<task>
<description>
Run again, compare before/after logs, and confirm with user that piano and progression chords make sound.
</description>

<steps>
1. Reproduce again: open ChordLab, click piano keys and one progression chord.
2. Confirm in logs: initialize:success (or expected path), playNote:usingRealInstrument (or fallback with known reason), and that playNote is called.
3. Confirm audibly: piano key click and chord slot click produce sound (real piano preferred).
4. If verified: remove or comment out temporary instrumentation and document the fix in SUMMARY.md or VERIFICATION.md.
5. If not verified: return to Task 3 with new logs and refine hypotheses (e.g. new subsystem).
</verification>
- [ ] Logs show the expected path (init success + real instrument, or documented fallback).
- [ ] User confirms sound works for piano and progression chords.
- [ ] Instrumentation removed after success; fix summarized in one place.
</verification>
</task>

## Verification (Phase Goal)

- **Done when**: Clicking piano keys and progression chords in ChordLab produces audible sound using the existing audio engine (realistic piano when init succeeds; acceptable fallback only when init fails with a known, logged reason). No regression in ChordLab behavior.
- **Evidence**: Before/after logs and user confirmation (or ticket/chat).

## Next Steps

After completing this plan and verifying the fix:

1. Update **STATE.md** if this was a tracked blocker.
2. Optionally add a one-line note to **CONCERNS.md** or integration phase docs if the root cause is architectural (e.g. startAudio vs AudioManager.initialize).
3. Recommend running the app and testing ChordLab manually; no separate execute-phase command is required for this debug-only phase.
