# AI-Driven Drill Actions – Requirements

## v1 Requirements (Must-Have)

### CMD-01: Parse commands from AI lesson in Practice Studio
**Status**: Active  
**Priority**: P0  
**Description**: When "Get AI lesson" returns a string, parse all tokens matching the command grammar `[[DRILL|SET|UI]:ACTION[:PARAM]]` (case-insensitive, optional spaces).  
**Success Criteria**:
- All such tokens are detected (regex or shared parser consistent with JazzKiller SmartLessonPane).
- Parsed list is available for execution and for stripping from the display string.
- Displayed lesson text contains no `[[...]]` command tokens.

### CMD-02: Execute [[DRILL:SPOTLIGHT]] in Practice Studio
**Status**: Active  
**Priority**: P0  
**Description**: When the parsed response includes `[[DRILL:SPOTLIGHT]]`, trigger the "spotlight" drill: focus a pattern (current or first), enable loop, and start playback.  
**Success Criteria**:
- If a pattern is already focused: ensure loop is on and call `togglePlayback()` to start if not playing.
- If no pattern is focused: call `focusOnPattern(0)` (or first pattern), then start playback.
- User sees no `[[DRILL:SPOTLIGHT]]` in the lesson card.

### CMD-03: Execute [[SET:BPM:X]] in Practice Studio
**Status**: Active  
**Priority**: P0  
**Description**: When the response includes `[[SET:BPM:X]]` (e.g. `[[SET:BPM:120]]`), set the practice/playback BPM to X.  
**Success Criteria**:
- BPM is set via the same path Practice Studio uses (e.g. `usePracticeStore.getState().setBpm(parsed)` or engine `setBpm` where applicable).
- Value is clamped to a safe range (e.g. 40–300).
- Token is stripped from displayed text.

### CMD-04: Strip all commands from displayed lesson text
**Status**: Active  
**Priority**: P0  
**Description**: The text shown in the "AI lesson" card must be the lesson content only; all `[[TYPE:ACTION:PARAM]]` tokens are removed before rendering.  
**Success Criteria**:
- No raw `[[...]]` appears in the PracticeExercisePanel lesson card.
- Behavior matches JazzKiller SmartLessonPane (commands executed then removed).

### CMD-05: Execute [[SET:KEY:X]] / transpose in Practice Studio (if wired)
**Status**: Active  
**Priority**: P1  
**Description**: When the response includes `[[SET:KEY:X]]` or `[[SET:TRANSPOSE:X]]`, set key/transpose so Practice Studio playback reflects it.  
**Success Criteria**:
- If Practice Studio uses JazzKiller transpose (e.g. `transposeSignal`), set it to the parsed value.
- If only BPM is wired in v1, document KEY/TRANSPOSE as "execute when integration exists" and implement when store/signals are connected.
- Token is stripped from displayed text.

### CMD-06: Single place or shared helper for command grammar
**Status**: Active  
**Priority**: P1  
**Description**: Command parsing (regex + extraction) is defined in one place so SmartLessonPane and PracticeExercisePanel stay in sync; optional shared executor for overlapping actions.  
**Success Criteria**:
- Either: (a) shared `parseAiLessonCommands(response)` used by both panels, or (b) same regex and behavior documented in one module so both panels can be updated together.
- Adding a new command type does not require hunting through multiple regex strings.

## v2 / Deferred

- **CMD-07**: `[[DRILL:BLINDFOLD]]` – toggle hide piano/fretboard (ear-only mode) when that UX exists in Practice Studio.
- **CMD-08**: `[[UI:ANALYSIS]]` / `[[UI:GUIDE_TONES]]` in Practice Studio – toggle analysis or guide tones overlay.
- **CMD-09**: AI prompt tweak – explicitly tell the model "In Practice Studio, ending with [[DRILL:SPOTLIGHT]] will start the loop for the current focus."
- **CMD-10**: Persist or log "last AI-suggested BPM/key" for user reference (optional).

## Out of Scope

- Cloud LLM or changing the AI model.
- New UI panels only for "command history."
- Changing SmartLessonPane behavior beyond optionally sharing a parser/executor.
