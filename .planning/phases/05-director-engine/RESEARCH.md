# Research: Phase 5 – The "Director" Engine

**Roadmap**: Phase 5: The Director Engine  
**Goal**: Adaptive curriculum driven by FSRS (R, S, D) and context injection (timbre/instrument variation) so teaching is data-driven and not context-dependent.

---

## What We Need to Know to Plan This Phase

### 1. FSRS (Free Spaced Repetition Scheduler)

- **Variables**: **Retrievability (R)** = probability of recall at a given time; **Stability (S)** = interval (days) for R to drop 100%→90%; **Difficulty (D)** = inherent hardness (1–10), affects how much S grows per review.
- **Laws**: Harder material → smaller S increase; higher S → smaller S increase (decay); lower R at review → larger S increase.
- **Implementation**: **ts-fsrs** (npm: `ts-fsrs`) provides TypeScript API: card state, `repeat()` with ratings (Again/Hard/Good/Easy), scheduling output. FSRS-6 uses 21 parameters; default generator params are available.
- **Mapping to ITM**: A "practice item" can be a song+key, a lick, or an exercise. Each item needs FSRS state (or we store D/S/lastReview and compute R). Profile/store already has `SongProgress` (maxBpm, mastered, lastPracticed, attempts); we can add optional FSRS fields (D, S, lastReview) or a separate Director store keyed by itemId.

### 2. Director Service (REQ-DR-02)

- **Role**: Consumes FSRS state + session context (time available, current module, history this session) and outputs: next item to practice, optional instrument/timbre for context injection.
- **Inputs**: Per-item R/S/D (and due/overdue), session length, user preferences (e.g. "focus on standards").
- **Outputs**: Ordered queue or single "next" item; optional difficulty/pace hint; instrument/timbre id for playback.
- **Placement**: New module or service under `src/core/director/` (e.g. `DirectorService.ts`, `useDirector.ts`) that the practice UI (JazzKiller, guided session, or a dedicated Director-driven screen) calls to get the next card/item.

### 3. Context Injection – Timbre/Instrument (REQ-DR-03)

- **Goal**: Vary the sound (Piano → Cello → Synth) so learning is not tied to one timbre; reduces context-dependency and improves transfer.
- **Current audio**: `globalAudio.ts` exposes piano, guitar, bass, drums, shellSynth, extensionSynth; JazzKiller uses its own piano/bass/drums samples in `useJazzPlayback` / `useJazzBand`. ChordBuildr has `synthPlayer` and instrument selection (piano, nylon, pluck).
- **Approach**: Director chooses an "instrument slot" or patch id (e.g. piano, cello, synth). Either:
  - **Option A**: Add Cello (and optionally Synth) to `globalAudio` if not present; Director sets a "current guide instrument" signal that playback layers read (e.g. for chord/guide-tone playback in JazzKiller or guided mode).
  - **Option B**: JazzKiller/guided session already use a single piano for comping; introduce a "Director-selected timbre" that swaps the piano (or lead sound) to another sampler/synth from a small set (Piano, Cello, Synth). Shared signal or context so the same engine plays the same part with different timbre.
- **Scope**: Start with the practice/playback path used by JazzKiller or the teaching machine (guide tones, chord cues). Full band (bass/drums) can stay fixed; vary the "lead" or "cue" instrument.

### 4. Dependencies

- **Phase 2 (Mastery Tree)**: Song tagging and progress (songProgress, mastered, maxBpm) provide item identity and basic history; Director can use these plus FSRS for scheduling.
- **Phase 3 (Sonic)**: Mixer and audio routing exist; context injection adds a "patch selector" or instrument switch driven by Director.
- **Phase 4 (Cloud)**: Optional: sync FSRS state (D, S, lastReview) to Supabase so scheduling is consistent across devices; can be Phase 5 scope or follow-up.

### 5. Data Model

- **Item types**: Song+key, Lick, Exercise (e.g. scale/guide-tone block). Each has a stable id (e.g. `song:Autumn Leaves`, `lick:xyz`, `exercise:guide-tones-ii-V`).
- **FSRS state**: For each item, store at least: last review timestamp, rating (Again/Hard/Good/Easy or derived from accuracy/BPM), and optionally D/S. ts-fsrs returns updated D/S and next review date; we persist and use for scheduling.
- **Director output**: Next item id, optional instrument id (piano | cello | synth), optional BPM/level hint so the UI can preconfigure the session.

---

## Summary

- **FSRS**: Use ts-fsrs; map practice items to cards (or card-like state); store D, S, lastReview; compute R for scheduling; Director picks due/overdue and new items.
- **Director**: New service/hook that takes FSRS state + session context and returns next item + optional timbre/instrument.
- **Context injection**: Director selects instrument (Piano/Cello/Synth); playback layer (globalAudio or JazzKiller path) reads that choice and uses the corresponding patch for guide/chord playback to reduce context-dependency.
