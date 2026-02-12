# Soloist-Responsive Playback – State

## Current Status

- **Phase**: Not started
- **Status**: Planning complete (PROJECT.md, REQUIREMENTS.md, ROADMAP.md)
- **Next**: Phase 1 – Toggle and soloist activity derivation from SwiftF0

## Progress

| Phase | Status | Notes |
|-------|--------|--------|
| Phase 1: Toggle and soloist activity | Not started | REQ-SRP-01, REQ-SRP-02, REQ-SRP-03 |
| Phase 2: Band loop integration | Not started | REQ-SRP-04, REQ-SRP-05, REQ-SRP-06 |
| Phase 3: UI and verification | Not started | REQ-SRP-07, REQ-SRP-08 |

## Active Requirements

- [ ] REQ-SRP-01: Soloist-responsive toggle
- [ ] REQ-SRP-02: Soloist activity from SwiftF0
- [ ] REQ-SRP-03: Graceful fallback when no mic
- [ ] REQ-SRP-04: Effective activity in band loop
- [ ] REQ-SRP-05: Trio engines receive effective activity
- [ ] REQ-SRP-06: No regression when toggle off
- [ ] REQ-SRP-07: Toggle UI
- [ ] REQ-SRP-08: Verification and documentation

## Blockers

- None.

## Notes

- Milestone extends Phase 18 (Creative Jazz Trio Playback): adds **soloist-driven** call-and-response on top of place-in-cycle and song-style.
- Reuse: useITMPitchStore, useHighPerformancePitch, activityLevelSignal, trio context (getPlaceInCycle, getSongStyleTag, isSoloistSpace), useJazzBand loop.
- Experimental: default off; can refine sensitivity/smoothing in a follow-up.
