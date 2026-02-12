# Soloist-Responsive Playback – State

## Current Status

- **Phase**: Phase 19 complete
- **Status**: Soloist-Responsive Playback implemented (toggle + soloist activity + band steering + Mixer UI)
- **Next**: Optional refinement (sensitivity/smoothing) or next milestone

## Progress

| Phase | Status | Notes |
|-------|--------|--------|
| Phase 1: Toggle and soloist activity | Done | REQ-SRP-01, REQ-SRP-02, REQ-SRP-03 |
| Phase 2: Band loop integration | Done | REQ-SRP-04, REQ-SRP-05, REQ-SRP-06 |
| Phase 3: UI and verification | Done | REQ-SRP-07, REQ-SRP-08 |

## Active Requirements

- [x] REQ-SRP-01: Soloist-responsive toggle
- [x] REQ-SRP-02: Soloist activity from SwiftF0
- [x] REQ-SRP-03: Graceful fallback when no mic
- [x] REQ-SRP-04: Effective activity in band loop
- [x] REQ-SRP-05: Trio engines receive effective activity
- [x] REQ-SRP-06: No regression when toggle off
- [x] REQ-SRP-07: Toggle UI
- [x] REQ-SRP-08: Verification and documentation

## Blockers

- None.

## Notes

- **Additive only**: All existing band rules (place-in-cycle, song style, trio context, Q&A, style-driven engines) stay intact. Soloist-responsive layer only **steers** inputs (e.g. effective activity) so the same engines behave in the right direction—no replacement of band logic.
- Milestone extends Phase 18 (Creative Jazz Trio Playback): adds **soloist-driven** call-and-response on top of place-in-cycle and song-style.
- Reuse: useITMPitchStore, useHighPerformancePitch, activityLevelSignal, trio context (getPlaceInCycle, getSongStyleTag, isSoloistSpace), useJazzBand loop.
- Experimental: default off; can refine sensitivity/smoothing in a follow-up.
