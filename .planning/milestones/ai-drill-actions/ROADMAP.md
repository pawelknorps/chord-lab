# AI-Driven Drill Actions – Roadmap

## Overview

Catch `[[DRILL:SPOTLIGHT]]` (and other commands) from the Get AI lesson response in JazzKiller Practice Studio, execute them, strip them from the displayed text, and extend the set of AI-driven actions.

**Timeline**: 1 main phase + 1 optional phase  
**Target**: Practice Studio executes AI commands and shows only lesson prose; shared grammar where possible.

---

## Phase 1: Parse, strip, and execute core commands in Practice Studio

**Goal**: In PracticeExercisePanel, after receiving the AI lesson string: parse commands, execute SPOTLIGHT and SET:BPM (and SET:KEY if wired), then display only the stripped text.

### Tasks
- [ ] **PARSE**: Add parsing of `[[DRILL|SET|UI]:ACTION[:PARAM]]` to the flow in PracticeExercisePanel (after `generateLessonFromPracticeContext`). Use same regex as JazzKiller SmartLessonPane or extract a shared `parseAiLessonCommands(response)` that returns `{ commands: [...], strippedText: string }`.
- [ ] **STRIP**: Set `aiLessonResult` to the stripped text only (no `[[...]]` in the card).
- [ ] **SPOTLIGHT**: On `[[DRILL:SPOTLIGHT]]`: if `activeFocusIndex !== null`, ensure loop is already on (focus is set), then call `togglePlayback()` if not playing; if no focus, call `focusOnPattern(0)` then `togglePlayback()`.
- [ ] **SET-BPM**: On `[[SET:BPM:X]]`: call `usePracticeStore.getState().setBpm(parsed)` (or the engine’s setBpm used by Practice Studio); clamp to 40–300.
- [ ] **SET-KEY**: If Practice Studio is wired to transpose: on `[[SET:KEY:X]]` or `[[SET:TRANSPOSE:X]]`, set transpose (e.g. transposeSignal or store); otherwise document and skip until integration exists.
- [ ] **VERIFY**: Manually test: get AI lesson that ends with `[[DRILL:SPOTLIGHT]]` → loop runs and card has no token; same for `[[SET:BPM:120]]`.

### Requirements Addressed
- CMD-01: Parse commands from AI lesson
- CMD-02: Execute [[DRILL:SPOTLIGHT]]
- CMD-03: Execute [[SET:BPM:X]]
- CMD-04: Strip all commands from displayed text
- CMD-05: Execute [[SET:KEY:X]] (if wired)
- CMD-06: Single place or shared helper for grammar (optional in Phase 1; can be same regex in panel first)

### Success Criteria
- Lesson ending with `[[DRILL:SPOTLIGHT]]` starts loop + playback and does not show the token.
- `[[SET:BPM:120]]` sets BPM and is stripped.
- One clear code path in PracticeExercisePanel for parse → execute → strip → setState.

---

## Phase 2: Shared parser and extended actions (optional)

**Goal**: Extract shared command parser (and optionally executor) for SmartLessonPane and PracticeExercisePanel; add BLINDFOLD and UI toggles where applicable.

### Tasks
- [ ] **SHARED**: Extract `parseAiLessonCommands(response)` (and optionally `executePracticeStudioCommands(parsed, context)`) to a shared module (e.g. `ai/lessonCommands.ts`) and use it in both PracticeExercisePanel and JazzKiller SmartLessonPane.
- [ ] **BLINDFOLD**: Implement `[[DRILL:BLINDFOLD]]` in Practice Studio if "hide piano/fretboard" or ear-only mode exists (CMD-07).
- [ ] **UI**: Wire `[[UI:ANALYSIS]]` / `[[UI:GUIDE_TONES]]` to store’s `toggleAnalysis` / `toggleGuideTones` in Practice Studio (CMD-08).
- [ ] **PROMPT**: Optional prompt tweak in jazzTeacherLogic system prompt: "In Practice Studio, [[DRILL:SPOTLIGHT]] starts the loop for the current focus." (CMD-09)

### Requirements Addressed
- CMD-06: Single place for grammar (shared module)
- CMD-07, CMD-08, CMD-09: v2 actions and prompt

### Success Criteria
- Same regex and types used in both panels; new commands can be added in one place.
- BLINDFOLD and UI toggles work when their UX exists.

---

## State Tracking

- **Current Phase**: Phase 0 (Planning)
- **Overall Progress**: 0%
- **Next Milestone**: Phase 1 – Parse, strip, execute in Practice Studio

---

## Dependencies

### Internal
- `PracticeExercisePanel.tsx` – Get AI lesson handler
- `usePracticeStore` – focusOnPattern, clearFocus, togglePlayback, setBpm, toggleGuideTones, toggleAnalysis
- `jazzTeacherLogic.ts` – system prompt (optional wording tweak in Phase 2)
- `JazzKiller/components/SmartLessonPane.tsx` – reference for regex and behavior (Phase 2 shared parser)

### External
- None (no new packages)

---

## Success Metrics

- **Correctness**: Every `[[DRILL:SPOTLIGHT]]` and `[[SET:BPM:X]]` in a lesson triggers the right action and disappears from the card.
- **Clarity**: Parsing and execution are easy to find and extend (single flow in Phase 1; shared module in Phase 2).
- **UX**: User perceives "AI suggested something → the app did it" without seeing raw commands.
