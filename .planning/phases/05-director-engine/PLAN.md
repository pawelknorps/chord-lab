---
phase: 5
name: The Director Engine
waves: 3
dependencies: ["Phase 2: The Mastery Tree", "Phase 3: The Sonic Layer"]
files_modified: [
  "src/core/profiles/useProfileStore.ts",
  "src/core/profiles/ProfileTypes.ts",
  "src/core/audio/globalAudio.ts",
  "src/modules/JazzKiller/hooks/useJazzPlayback.ts",
  "src/modules/JazzKiller/state/jazzSignals.ts",
  "package.json"
]
files_created: [
  "src/core/director/DirectorService.ts",
  "src/core/director/fsrsBridge.ts",
  "src/core/director/directorTypes.ts",
  "src/hooks/useDirector.ts",
  "src/core/audio/directorInstrumentSignal.ts"
]
---

# Phase 5 Plan: The "Director" Engine

Focus: Adaptive curriculum using FSRS (R, S, D) and context injection (timbre/instrument variation).

**Success Criteria**: The AI "Director" schedules what to practice using FSRS and varies timbre/instrument (e.g. Piano → Cello → Synth) via the audio system so teaching is data-driven and not context-dependent.

---

## Wave 1: FSRS Integration & Item State

*Goal: Each practice item has FSRS state (R, S, D); we can schedule reviews and new material (REQ-DR-01).*

- <task id="W1-T1">Add dependency: `ts-fsrs` (npm). Create `src/core/director/fsrsBridge.ts`: wrap ts-fsrs so we can create/update "cards" keyed by item id (e.g. song+key, lick id). Expose: getState(itemId), recordReview(itemId, rating), getDueItems(), getNextNewItem(). Use default generator parameters unless we add optimizer later.</task>
- <task id="W1-T2">Define practice item types in `directorTypes.ts`: ItemId (e.g. `song:${title}:${key}`, `lick:${id}`), and optional FSRS fields (D, S, lastReview, nextReview). Persist FSRS state in a dedicated store (Zustand + persist) or extend profile with a `directorState: Map<ItemId, FSRSState>` so it survives reload and can sync to cloud later.</task>
- <task id="W1-T3">Bridge existing progress: when user completes a run (e.g. JazzKiller session), map outcome (accuracy, BPM, mastered) to a simple rating (Again/Hard/Good/Easy) and call fsrsBridge.recordReview(itemId, rating). Optionally seed D from song complexity (tags) or fixed default.</task>
- <task id="W1-T4">Implement getDueItems() and getNextNewItem(): due = items with nextReview <= now or R below threshold; new = items not yet in FSRS or never reviewed. Return ordered list for Director to choose from.</task>

---

## Wave 2: Director Service

*Goal: Central Director consumes FSRS and session context to select next item and optional instrument (REQ-DR-02).*

- <task id="W2-T1">Create `DirectorService.ts`: given FSRS state (due + new items), session context (time limit, module filter), and optional user prefs, return `DirectorDecision`: { nextItemId, suggestedBpm?, instrumentId? }. Logic: prefer due items by retrievability (low R first), then new items; cap new items per session if desired.</task>
- <task id="W2-T2">Expose `useDirector()` hook: returns { nextItem, advance(), setInstrument(id) }. advance() calls DirectorService for next decision, updates local state, and optionally navigates or sets JazzKiller song/key. nextItem includes itemId, suggestedBpm, instrumentId for UI and playback.</task>
- <task id="W2-T3">Integrate with practice entry points: from JazzKiller or a "Director mode" screen, call useDirector() to get next item; load that song/lick and (in Wave 3) apply instrument. If no Director mode screen yet, at least wire Director into one flow (e.g. "Suggested next" button that sets song and starts session).</task>

---

## Wave 3: Context Injection (Timbre/Instrument)

*Goal: Director varies timbre/instrument for playback to reduce context-dependency (REQ-DR-03).*

- <task id="W3-T1">Add `directorInstrumentSignal.ts`: a signal (e.g. Preact signal or Zustand slice) holding current "Director-chosen" instrument id: `piano` | `cello` | `synth`. DirectorService sets this when returning a decision (e.g. rotate or algorithm-based). Default to `piano`.</task>
- <task id="W3-T2">Extend `globalAudio` (or JazzKiller playback path): ensure at least two alternate timbres are available for the same role (e.g. chord/guide-tone playback). Add Cello sampler/synth if not present; use existing synth(s) for "Synth". Expose a single "guide instrument" getter that reads directorInstrumentSignal and returns the correct Tone node (piano, cello, or synth).</task>
- <task id="W3-T3">Wire JazzKiller (or guided session) chord/guide-tone playback to use the Director's guide instrument instead of a fixed piano. When Director sets instrumentId to cello/synth, playback uses that patch for the next run so the student hears the same material in different timbres.</task>
- <task id="W3-T4">Document rotation policy: e.g. "every N items" or "per session" switch (Piano → Cello → Synth → Piano). Keep it simple in Phase 5; can refine with R/S/D later (e.g. lower R → more familiar timbre).</task>

---

## Verification

- [ ] FSRS state is stored per item; recordReview updates D/S and next review; getDueItems and getNextNewItem return correct sets.
- [ ] DirectorService returns a nextItem (itemId, optional BPM, optional instrumentId) from due/new items; useDirector() exposes nextItem and advance().
- [ ] At least one practice entry point (e.g. JazzKiller or Director mode) uses Director to choose and load the next item.
- [ ] directorInstrumentSignal drives playback: when set to cello or synth, chord/guide-tone playback uses that timbre (Piano / Cello / Synth) via globalAudio or JazzKiller path.
- [ ] Running a session with Director and advancing items shows timbre change (e.g. after 1–2 items or per session) so learning is not tied to a single sound.
