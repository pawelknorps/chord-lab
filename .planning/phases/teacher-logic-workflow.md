# Teacher Logic Workflow: Practice Studio → Gemini Nano

## Goal
Feed the **crucial information** from the Practice Studio (progressions, patterns, guide tones, focus) to Gemini Nano so the AI can provide **valuable, contextual lessons** instead of generic advice.

## Data Available in Practice Studio (usePracticeStore)

| Source | Data | Use for AI |
|--------|------|------------|
| **currentSong** | title, key, measures (string[][]) | Song identity and full chord progression |
| **detectedPatterns** | type, startIndex, endIndex, metadata (key, romanNumerals, target, substitutes) | What harmonic concepts exist and where |
| **practiceExercises** | type, startIndex, chords[], practiceScale, practiceArpeggio | Per-pattern chords and suggested scale/arpeggio |
| **guideTones** | Map<measureIndex, { third, seventh }> | 3rds and 7ths per measure for voice-leading context |
| **hotspots** | measure indices | High-difficulty measures to prioritize |
| **activeFocusIndex** | pattern index or null | Which pattern the student is currently drilling |

## Workflow

1. **Build context** from the store when the user asks for a lesson:
   - Song: title, key, chord summary (first ~32 measures or full if short).
   - Patterns: for each detected pattern — type, measures (start–end), chords in that window, roman numerals, optional key; if practiceExercises[index] exists, include practiceScale and practiceArpeggio.
   - Focus (optional): if activeFocusIndex is set, include that pattern as the "current drill" and its guide tones for that measure range.
   - Hotspots: list of measure indices so the AI can prioritize "hard spots."

2. **Prompt structure** sent to Gemini Nano:
   - System: existing jazz teacher persona (Barry Harris / Hal Galper style).
   - User: structured block:
     - SONG + KEY + chord line (or summary).
     - PATTERNS: one line per pattern with type, measures, chords, roman numerals, scale/arpeggio if present.
     - FOCUSED PATTERN (if any): "The student is currently drilling: [type] in measures X–Y: [chords]. Guide tones in this section: [third → seventh where available]."
     - HOTSPOTS: "High-difficulty measures: [list]."
     - TASK: "Give a 3-bullet lesson for the focused pattern" or "Identify the hardest pivot in this tune and one strategy" (overview mode).

3. **Modes**:
   - **Drill mode**: activeFocusIndex set → lesson tailored to that pattern (chords, scale, arpeggio, guide tones).
   - **Overview mode**: no focus → lesson on the whole tune (pivot points, hotspots, one strategy per main pattern type).

## Implementation

- **buildPracticeContext(storeState)**  
  Builds a serializable context object from `usePracticeStore.getState()` (no React deps). Used by the UI to pass data into the teacher.

- **generateLessonFromPracticeContext(context, options?)**  
  Builds the prompt from the context, calls `window.ai.languageModel.create` + `session.prompt`, returns the lesson text. Options: `focusMode`, `customTask`, `maxBullets`.

- **UI**: "Get AI lesson" in Practice Studio (PracticeExercisePanel) that:
  - Builds context from the store.
  - Optionally uses the focused pattern (activeFocusIndex) for drill-mode lesson.
  - Calls generateLessonFromPracticeContext, shows result in a small panel or modal.

## Files

- `.planning/phases/teacher-logic-workflow.md` (this doc)
- `src/modules/JazzKiller/ai/jazzTeacherLogic.ts` — PracticeContext type, buildPracticeContext, generateLessonFromPracticeContext
- `src/modules/JazzKiller/components/PracticeExercisePanel.tsx` — "Get AI lesson" button and result display

---

## Status: Implemented

**Completed**: Teacher Logic workflow is implemented and wired into Practice Studio.

### Verification

- [x] **buildPracticeContext(state)** — Builds PracticeContext from usePracticeStore state (song, patterns with chords/roman numerals/scale/arpeggio, guide tones per pattern, focused pattern, hotspots).
- [x] **generateLessonFromPracticeContext(context, options)** — Builds prompt (SONG + KEY + chord excerpt, DETECTED PATTERNS, CURRENT DRILL when focused, HOTSPOTS, TASK) and calls Gemini Nano; returns lesson text.
- [x] **Practice Studio UI** — "Get AI lesson" button (Sparkles icon) in PracticeExercisePanel header; on click builds context and calls generator; result shown in card under header ("AI lesson" + text).
- [x] **Drill mode** — When activeFocusIndex is set (pattern focused), lesson is for that pattern only (chords, scale, arpeggio, guide tones).
- [x] **Overview mode** — When no pattern focused, lesson identifies hardest pivot and one strategy.

### Flow in practice

1. User loads a standard in JazzKiller → store gets song, patterns, exercises, guide tones, hotspots.
2. User optionally focuses a pattern (e.g. "Engage loop" on one ii–V–I).
3. User clicks **"Get AI lesson"** → context built from store and sent to Gemini Nano.
4. AI receives: song + key + chords, all patterns with chords/roman numerals/scale, (if focused) current drill + guide tones, hotspots.
5. AI returns a short, contextual lesson (3 bullets); shown in the Practice Studio panel.

### Next steps (optional)

- Test in Chrome/Edge with Gemini Nano enabled; verify prompt fits context window.
- Add "Copy lesson" or "Regenerate" in the AI lesson card if desired.
- Reuse `generateLessonFromPracticeContext` from SmartLessonPane for consistency.
