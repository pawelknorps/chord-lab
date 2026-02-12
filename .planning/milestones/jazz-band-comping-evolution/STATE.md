# Jazz Band Comping Evolution – State

## Current Status

- **Phase**: Not started
- **Status**: Milestone initialized; PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md created
- **Next**: Phase 1 — Markov Pattern Engine and Tagging (REQ-JBCE-01, REQ-JBCE-02, REQ-JBCE-03)

## Progress

| Phase | Status | Notes |
|-------|--------|--------|
| Phase 1: Markov engine and tagging | Not started | REQ-JBCE-01, REQ-JBCE-02, REQ-JBCE-03 |
| Phase 2: Stochastic humanization | Not started | REQ-JBCE-04, REQ-JBCE-05, REQ-JBCE-06 |
| Phase 3: Procedural lead-ins | Not started | REQ-JBCE-07, REQ-JBCE-08 |
| Phase 4: RhythmicDensityTracker + MarkovBridge | Not started | REQ-JBCE-09, REQ-JBCE-10 (optional) |
| Phase 5: Meter independence | Deferred | REQ-JBCE-11 |

## Active Requirements

- [ ] REQ-JBCE-01: Pattern type and tagging
- [ ] REQ-JBCE-02: Markov transition matrix
- [ ] REQ-JBCE-03: Pattern selection API
- [ ] REQ-JBCE-04: Bass micro-timing offsets
- [ ] REQ-JBCE-05: Piano velocity humanization
- [ ] REQ-JBCE-06: Ghost-note probability gate
- [ ] REQ-JBCE-07: Last eighth procedural note
- [ ] REQ-JBCE-08: Lead-in harmony awareness
- [ ] REQ-JBCE-09: RhythmicDensityTracker (optional)
- [ ] REQ-JBCE-10: MarkovBridge (optional)
- [ ] REQ-JBCE-11: Rhythmic fragments (deferred)

## Blockers

- None.

## Notes

- **Source**: Phase vision and implementation notes from `.planning/phases/Jazz band comping evolution.md`.
- **Relationship**: Builds on Phase 18 (Creative Jazz Trio Playback) and Phase 19 (Soloist-Responsive Playback); does not replace pattern library—evolves it with tags, Markov selection, humanization, and procedural lead-ins.
- **Optional Phase 4**: RhythmicDensityTracker + MarkovBridge can reuse or extend soloist activity (Phase 19); density is “notes per second” style; matrix bias keeps transitions smooth.
