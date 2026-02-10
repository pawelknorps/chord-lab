# AI-Driven Drill Actions – State

## Current Status

**Phase**: Planning complete  
**Progress**: 0% implementation  
**Last Updated**: 2026-02-11

---

## Phase Status

| Phase | Status | Progress | Start Date | End Date |
|-------|--------|----------|------------|----------|
| Phase 1: Parse, strip, execute in Practice Studio | Not started | 0% | - | - |
| Phase 2: Shared parser and extended actions | Not started | 0% | - | - |

---

## Requirements Status

### Phase 1
- [ ] CMD-01: Parse commands from AI lesson in Practice Studio
- [ ] CMD-02: Execute [[DRILL:SPOTLIGHT]]
- [ ] CMD-03: Execute [[SET:BPM:X]]
- [ ] CMD-04: Strip all commands from displayed lesson text
- [ ] CMD-05: Execute [[SET:KEY:X]] (if wired)
- [ ] CMD-06: Single place or shared helper for command grammar

### Phase 2 (optional)
- [ ] CMD-07: [[DRILL:BLINDFOLD]]
- [ ] CMD-08: [[UI:ANALYSIS]] / [[UI:GUIDE_TONES]]
- [ ] CMD-09: AI prompt tweak
- [ ] Shared parser and executor

---

## Blockers

None.

---

## Next Actions

1. Run `/gsd-plan-phase 1` for the **ai-drill-actions** milestone to create a detailed Phase 1 plan (or start from ROADMAP Phase 1 tasks).
2. Implement PARSE, STRIP, SPOTLIGHT, SET-BPM (and SET-KEY if wired) in PracticeExercisePanel.
3. Manually verify: Get AI lesson with `[[DRILL:SPOTLIGHT]]` and `[[SET:BPM:120]]`; confirm actions run and tokens are not shown.

---

## Notes

- User focus: "Get AI lesson always outputs [[DRILL:SPOTLIGHT]] at the end – catch this and trigger action (lesson based on what AI said). Develop further these actions made by AI."
- JazzKiller SmartLessonPane already parses and executes these commands; Practice Studio (PracticeExercisePanel) currently does not. This milestone closes that gap and extends the action set.
