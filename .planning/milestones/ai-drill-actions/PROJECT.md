# AI-Driven Drill Actions – Project Vision

## Vision Statement

When the JazzKiller Practice Studio **Get AI lesson** returns a response, the AI often ends with a **command** such as `[[DRILL:SPOTLIGHT]]`. Today that text is shown literally and no action is taken. This milestone makes the app **parse and execute** those commands so the AI can directly drive the practice flow (e.g. start looping the current focus, set tempo, or hide the keyboard), and **extends** the set of actions the AI can trigger.

## Problem Statement

- **Get AI lesson** (PracticeExercisePanel) displays the raw lesson string; `[[DRILL:SPOTLIGHT]]`, `[[SET:BPM:120]]`, etc. appear as text and are **never parsed or run**.
- ChordLab and JazzKiller **SmartLessonPane** already parse and execute `[[DRILL:...]]` / `[[SET:...]]` and strip them from the displayed text; Practice Studio does not.
- The AI is instructed (in `jazzTeacherLogic.ts`) to use these commands sparingly, but in Practice Studio they have no effect, so the “lesson-based action” loop is broken.

## Core Value Proposition

**“AI says it → the app does it.”**

1. **Parse**: After receiving the AI lesson in Practice Studio, detect all `[[TYPE:ACTION:PARAM]]` tokens.
2. **Execute**: Map each command to a concrete action (e.g. SPOTLIGHT → focus current pattern + enable loop + start playback; SET:BPM → set BPM; DRILL:BLINDFOLD → hide piano/fretboard).
3. **Display**: Show the user only the lesson text with commands stripped (no raw `[[...]]` in the card).
4. **Extend**: Add and document more AI-driven actions so the teacher can suggest tempo, key, or drill mode changes that the app performs automatically.

## Target Audience

- **Jazz students** using Practice Studio who want the AI’s suggestion to immediately shape their drill (e.g. “loop this turnaround” → one click from the AI).
- **Developers** maintaining a single, clear command grammar and execution layer shared (where possible) between SmartLessonPane and Practice Studio.

## Core Functionality (The ONE Thing)

**In Practice Studio, when the user clicks “Get AI lesson”, any `[[DRILL:...]]` and `[[SET:...]]` commands in the response are executed and removed from the displayed text; SPOTLIGHT starts (or continues) looping the current focus and playback.**

Students must be able to:

- Get an AI lesson and see only the prose (no `[[...]]`).
- Have the app automatically e.g. start looping the focused section (SPOTLIGHT) or set BPM/key when the AI suggests it.
- Rely on a consistent command set that can be extended (new actions) without breaking existing behavior.

## High-Level Requirements

- **Parsing**: Same grammar as SmartLessonPane: `[[DRILL|SET|UI]:ACTION[:PARAM]]` (case-insensitive, optional spaces). Extract all matches, then strip from display string.
- **Execution in Practice Studio**:
  - `[[DRILL:SPOTLIGHT]]`: If a pattern is focused, ensure loop is on and start playback if stopped; if none focused, focus first pattern (or first N bars) and enable loop + start playback.
  - `[[DRILL:BLINDFOLD]]`: Toggle hide piano/fretboard (or equivalent “ear only” mode) if available in Practice Studio.
  - `[[SET:BPM:X]]`: Set practice BPM to X (e.g. via `usePracticeStore.getState().setBpm(X)` or the engine’s `setBpm` used by Practice Studio).
  - `[[SET:KEY:X]]` / `[[SET:TRANSPOSE:X]]`: Set key/transpose (integrate with JazzKiller transpose signal or store if used in Practice Studio).
- **Display**: Rendered lesson text must not contain any `[[...]]` tokens.
- **Extensibility**: New commands (e.g. `[[UI:...]]` for analysis/guide tones) can be added in one place and executed in both SmartLessonPane and Practice Studio where applicable.

## Technical Constraints

- Changes are confined to:
  - **Practice Studio**: `PracticeExercisePanel.tsx` (parse + execute + strip after `generateLessonFromPracticeContext`).
  - **Shared (optional)**: Extract a small `parseAiLessonCommands(response)` (and optionally `executePracticeStudioCommands(parsed, context)`) so SmartLessonPane and PracticeExercisePanel share the same grammar and execution contract where they overlap.
- Reuse existing store/engine: `usePracticeStore` (`focusOnPattern`, `clearFocus`, `togglePlayback`, `setBpm`, `toggleGuideTones`, `toggleAnalysis`), and JazzKiller signals for transpose/BPM where the Practice view is wired to them.
- No change to the AI system prompt beyond optional clarifications (e.g. “In Practice Studio, SPOTLIGHT starts the loop for the current focus”).

## Out of Scope (v1)

- Cloud LLM or different model; remains Gemini Nano / local.
- Persisting “AI-suggested” state (e.g. “last AI-set BPM”) beyond the current session.
- New UI panels solely for “AI command history”; focus is on immediate execution and display stripping.
- Changing how SmartLessonPane works beyond possibly sharing a parser/executor helper.

## Success Metrics

- In Practice Studio, a lesson ending with `[[DRILL:SPOTLIGHT]]` results in the focused section looping and playback running (or focus set then loop+play), and the user does not see `[[DRILL:SPOTLIGHT]]` in the card.
- `[[SET:BPM:120]]` in the lesson text sets BPM to 120 and the token is not shown.
- One clear place (or a small shared module) that defines the command grammar and maps commands to actions for Practice Studio (and optionally SmartLessonPane).

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Parse in PracticeExercisePanel** | Keeps “Get AI lesson” flow in one component; can later extract shared parser. |
| **SPOTLIGHT = focus + loop + play** | Matches user intent “a lesson based on what AI said” and “trigger action”. |
| **Strip commands from display** | Same UX as SmartLessonPane; user sees only pedagogical content. |
| **Reuse store/engine APIs** | No new playback/loop model; use existing `focusOnPattern`, `togglePlayback`, `setBpm`. |

## Integration Points

- **JazzKiller**: `PracticeExercisePanel.tsx`, `usePracticeStore` (focusOnPattern, clearFocus, togglePlayback, setBpm, toggleGuideTones, toggleAnalysis).
- **AI**: `jazzTeacherLogic.ts` (system prompt already documents `[[DRILL:SPOTLIGHT]]`, etc.); no change required for v1 beyond optional wording.
- **Optional**: Shared parser/executor used by `JazzKiller/components/SmartLessonPane.tsx` and `PracticeExercisePanel.tsx` for consistent behavior.

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation phases (ROADMAP.md).
3. Implement Phase 1: parse + strip + execute SPOTLIGHT and SET:BPM in Practice Studio.
