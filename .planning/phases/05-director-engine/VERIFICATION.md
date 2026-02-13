# Phase 5: The Director Engine – Verification

## Phase goal (from ROADMAP)

The AI "Director" schedules what to practice using FSRS (R, S, D) and varies timbre/instrument (e.g. Piano → Cello → Synth) to reduce context-dependency; teaching flow is data-driven and adaptive.

## Verification checklist

- [x] **FSRS state is stored per item**; recordReview updates D/S and next review; getDueItems and getNextNewItem return correct sets.
  - `useDirectorStore` persists cards keyed by ItemId; `fsrsBridge.recordReview` / `recordReviewFromOutcome`; `getDueItems` / `getNextNewItems` in fsrsBridge.
- [x] **DirectorService returns a nextItem** (itemId, optional BPM, optional instrumentId) from due/new items; useDirector() exposes nextItem and advance().
  - `DirectorService.getNextDecision`, `useDirector` with advance() returning DirectorDecision.
- [x] **At least one practice entry point** (e.g. JazzKiller or Director mode) uses Director to choose and load the next item.
  - JazzKiller: "Suggested next" button calls directorAdvance(), parses nextItemId (song:title:key), loads song and sets transpose.
- [x] **directorInstrumentSignal drives playback**: when set to cello or synth, chord/guide-tone playback uses that timbre (Piano / Cello / Synth) via globalAudio or JazzKiller path.
  - `directorInstrumentSignal.ts`; `globalAudio.getGuideInstrument()` / `playGuideChord()`; `useJazzBand.playChord` uses playGuideChord when instrument !== 'piano'.
- [x] **Running a session with Director and advancing items shows timbre change** (e.g. after 1–2 items or per session).
  - Rotation: Piano → Cello → Synth → Piano on each advance (see ROTATION.md).

## Deliverables

- **Wave 1**: ts-fsrs dependency; directorTypes (ItemId, FSRSStateSnapshot, DirectorDecision); useDirectorStore (persist); fsrsBridge (getState, recordReview, recordReviewFromOutcome, getDueItems, getNextNewItems).
- **Wave 2**: DirectorService.getNextDecision; useDirector hook; JazzKiller "Suggested next" button and handleSuggestedNext.
- **Wave 3**: directorInstrumentSignal; globalAudio celloSynth, getGuideInstrument, playGuideChord; useJazzBand playChord wired to guide instrument; ROTATION.md.

## Optional follow-ups

- Call `recordReviewFromOutcome` when a JazzKiller session ends (e.g. on "Suggested next" for previous song, or when closing song) so FSRS state is updated from actual performance.
- Sync FSRS state to Supabase (Phase 4) for cross-device scheduling.
