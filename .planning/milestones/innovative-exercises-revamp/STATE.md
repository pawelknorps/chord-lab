# Innovative Exercises Revamp – State

## Current Status

- **Phase**: Not started
- **Status**: Milestone initialized; PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md created
- **Next**: Phase 1 – Progress summary & data layer

## Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Progress summary & data layer | Not started | REQ-IER-01, REQ-IER-02 |
| Phase 2: AI recommendation engine | Not started | REQ-IER-03, REQ-IER-04 |
| Phase 3: Parameterized exercises & library audio | Not started | REQ-IER-05, REQ-IER-06, REQ-IER-07 |
| Phase 4: “For You” UI & refresh | Not started | REQ-IER-08, REQ-IER-09, REQ-IER-10 |

## Active Requirements

- [ ] REQ-IER-01: Progress summary for AI
- [ ] REQ-IER-02: Read-only consumption of progress
- [ ] REQ-IER-03: AI recommendation function
- [ ] REQ-IER-04: Fallback when no/sparse progress
- [ ] REQ-IER-05: Parameterized launch of existing exercises
- [ ] REQ-IER-06: Musical content from existing library
- [ ] REQ-IER-07: Mic pipeline unchanged
- [ ] REQ-IER-08: “For You” / Recommended section
- [ ] REQ-IER-09: Manual exercise list preserved
- [ ] REQ-IER-10: Recommendations refresh from progress

## Blockers

- None.

## Notes

- **Builds on Phase 17**: Existing Innovative Exercises module (six exercises, mic-ready, Phase 17) is extended, not replaced.
- **Data sources**: useSessionHistoryStore, useScoringStore, useMasteryStore, useMasteryTreeStore, useProfileStore, standards heatmap store; itmSyncService for cloud history when needed.
- **AI**: Gemini Nano + jazzTeacherLogic pattern; structured output (exerciseId, params, reason).
- **Library**: Licks (ghost-note, call-and-response), ChordScaleEngine, GuideToneCalculator, backing/stems, standards metadata.
