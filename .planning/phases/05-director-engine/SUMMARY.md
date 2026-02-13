# Phase 5: The "Director" Engine – Summary

**Goal**: Adaptive curriculum driven by FSRS (Retrievability, Stability, Difficulty) and context injection (timbre/instrument variation) so teaching is data-driven and not context-dependent.

**Status**: ✅ Complete.

**Scope**: Three waves — (1) FSRS integration and per-item state (ts-fsrs, persist, due/new), (2) Director service and useDirector hook, (3) Director-driven instrument signal and playback (Piano → Cello → Synth).

**Deliverables** (implemented):
- fsrsBridge + useDirectorStore (persist); directorTypes; getDueItems / getNextNewItems / recordReviewFromOutcome.
- DirectorService.getNextDecision; useDirector (nextItem, advance, setInstrument); JazzKiller "Suggested next" button.
- directorInstrumentSignal; globalAudio getGuideInstrument / playGuideChord / celloSynth; useJazzBand playChord uses guide instrument when not piano; ROTATION.md.
