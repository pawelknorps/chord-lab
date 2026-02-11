# Plan: Phase 4 – Polish & Theory Calibration & Nano Hardening

**Roadmap**: Phase 4 (Steps 10, 11, 12b, 12c, 12d)  
**Goal**: Optimize token usage, strengthen theory validation prompts, and harden Gemini Nano with stateless atomic prompts, guardrails (temperature/topK/session reset), and a Tonal.js validator for suggested notes.

**Note**: DRILL:SPOTLIGHT / Phase 5 (AI Drill Actions) is out of scope for this phase; skip command parsing and execution.

---

## Frontmatter

- **Waves**: 2 (Guardrails + atomic/few-shot/CoT → State slice + validator + token/theory prompts).
- **Dependencies**: AiContextService, jazzTeacherLogic, progressionContext, LocalAgentService, theory core (Tonal.js, RomanNumeralAnalyzer, ChordScaleEngine).
- **Files likely to be modified**:
  - `src/modules/JazzKiller/ai/jazzTeacherLogic.ts` (guardrails, atomic prompt builder, few-shot in system prompt, CoT option).
  - `src/core/services/LocalAgentService.ts` (optional: periodic session reset or document use of per-request session for theory).
  - `src/modules/ChordLab/components/SmartLessonPane.tsx` (use atomic prompt + validator for Progression Assistant; optional per-request session).
  - `src/core/services/AiContextService.ts` or new util (state slice 4+4 bars; optional `validateSuggestedNotes`).
  - New: `src/core/services/atomicPromptHelpers.ts` or under `jazzTeacherLogic` (generateAtomicPrompt, theoryData shape).

---

## Wave 1: Guardrails and atomic prompt pattern

### Task 1.1: Set theory guardrails (temperature 0.2, topK 3)
- In `jazzTeacherLogic.ts`, change all `createGeminiSession(..., { temperature, topK })` calls used for **theory/lesson** to `temperature: 0.2` and `topK: 3`.
- Affected: `generateLessonFromPracticeContext`, `generateJazzLesson`, `getKeyShiftTip`.
- Leave any non-theory usage (if added later) at higher values.
- **Verification**: Grep confirms theory sessions use 0.2 and 3; manual run: lesson output is more stable and on-topic.

### Task 1.2: Atomic prompt builder (CONTEXT / TASK / CONSTRAINTS / RESPONSE)
- Add a function that builds an atomic prompt from a minimal theory payload, e.g.:
  - **Input**: `{ songTitle, key, chordSymbol, scaleNotes: string[], nextChord?: string }` (scaleNotes from Tonal.js).
  - **Output**: Single string with blocks: `### CONTEXT`, `### TASK`, `### CONSTRAINTS`, `### RESPONSE`.
- Use in at least one path: e.g. when generating a "chord-in-context" lesson for the focused pattern (current chord + next chord), call this builder and pass result to `session.prompt(...)`.
- **Verification**: Unit test or manual check: given C, Dm7, scale degrees [C,D,E,F,G,A,B], output contains CONTEXT/TASK/CONSTRAINTS/RESPONSE and scale degrees.

### Task 1.3: Few-shot examples in system prompt
- Add 2–3 "perfect response" examples to `JAZZ_TEACHER_SYSTEM_PROMPT` in `jazzTeacherLogic.ts`. Format: "Example: Input: Dm7 in C Major. Teacher: This is the ii chord. Aim for F (minor 3rd) to lead into B (3rd of G7) in the next bar."
- Keep total system prompt size reasonable (< ~500 words).
- **Verification**: Prompt string contains at least 2 examples; lesson output style aligns with examples.

### Task 1.4: Optional Chain-of-Thought for complex progressions
- When the context has 3+ chords or the user task asks to "explain the progression," append a line to the prompt: "First identify the Roman numeral of each chord. Second, identify the target note of the resolution. Third, suggest a short lick."
- Implement in `generateLessonFromPracticeContext` or `generateJazzLesson` when conditions are met.
- **Verification**: For a ii–V–I question, response contains stepwise structure (Roman numerals → target note → lick).

### Task 1.5: Session reset behavior
- **jazzTeacherLogic**: Already creates a new session per request and calls `session.destroy()` after each prompt; no change required.
- **LocalAgentService**: Document that for theory Q&A (Chord Lab), callers should use per-request session (e.g. via jazzTeacherLogic) to avoid context drift; or add optional `resetSessionAfterNRequests` and call `dispose()` when threshold reached. Prefer documenting and using teacher logic path for Chord Lab theory answers.
- **Verification**: Chord Lab Progression Assistant uses a path that creates/destroys session per request (or LocalAgentService resets periodically); no long-lived session for theory.

---

## Wave 2: State slice, validator, token and theory prompts

### Task 2.1: State slice (current 4 + next 4 bars)
- Add a helper that, given song measures and current focus index (or "cursor" bar), returns chord/theory data for **current 4 bars** and **next 4 bars** (or fewer at end of tune).
- Integrate with `buildPracticeContext` or prompt building in `generateLessonFromPracticeContext` so that when we want stateless minimal context, we pass only this slice (e.g. for atomic chord-in-context replies).
- **Verification**: For a 32-bar tune, focus at bar 8: prompt contains only bars 8–11 and 12–15 (or equivalent); token count is reduced.

### Task 2.2: Validator – do not display notes outside scale/chord
- Implement `validateSuggestedNotes(responseText: string, context: { chordSymbol?: string; key: string; scaleNotes: string[] }): string`.
  - Use Tonal.js to get allowed notes (chord tones or scale tones) from context.
  - Parse `responseText` for note names (e.g. A–G with optional #/b); if a mentioned note is not in the allowed set, remove that phrase or replace with a safe note from the set, or append a short "(use only scale tones: ...)" and the list.
  - Return sanitized string.
- Call this before displaying AI response in:
  - JazzKiller Practice Studio lesson text.
  - JazzKiller SmartLessonPane lesson/chat.
  - Chord Lab SmartLessonPane Progression Assistant chat when the last user question was theory/note-specific (e.g. "what note over G7?").
- **Verification**: If model says "Play C#" over Cmaj7 in C, validator removes or corrects; displayed text only suggests notes in C major scale.

### Task 2.3: Token optimization (Step 10)
- Ensure chord summary in prompts is capped (already MAX_CHORDS_IN_PROMPT); when using 4+4 bar slice, use only those chords in the CONTEXT block.
- Add a short comment in prompt-building code: "Keep CONTEXT under N tokens for Nano."
- **Verification**: No new overflow; prompt size for typical 4+4 slice is smaller than full-song prompt.

### Task 2.4: Theory validation prompt strengthening (Step 11)
- In `JAZZ_TEACHER_SYSTEM_PROMPT`, add or strengthen: "Before naming any note, verify it appears in the provided Tones (1,3,5,7) or Scale Suggestion for that chord. Never suggest a note that is not listed in the context."
- **Verification**: System prompt contains this rule; combined with validator, no out-of-scale notes in displayed lessons.

---

## Verification (phase success criteria)

- **Step 10**: Token usage optimized; CONTEXT limited when using 4+4 slice.
- **Step 11**: Theory validation rule present in system prompt; interval/note naming constrained to context.
- **Step 12**: Already done (Chord/Scale tone verification in prompts).
- **Step 12b**: Atomic prompt (CONTEXT/TASK/CONSTRAINTS/RESPONSE) used for at least one lesson path; few-shot in system prompt; CoT used for complex progression questions.
- **Step 12c**: Theory calls use `temperature: 0.2`, `topK: 3`; session lifecycle avoids long-lived drift (per-request destroy or periodic reset).
- **Step 12d**: Validator runs on theory/note-specific responses; suggested notes not in Tonal.js scale/chord are not shown.

**Phase goal**: AI response time &lt; 2s for complex lookups; theory answers stay on-topic; suggested notes pass Tonal.js validation.

---

## Plan check (phase goal and requirements)

- **Phase goal**: Polish & Theory Calibration & Nano Hardening → Wave 1 (guardrails, atomic prompt, few-shot, CoT, session behavior) and Wave 2 (state slice, validator, token/theory prompts) cover it.
- **REQ-NANO-01** (state slice): Task 2.1.
- **REQ-NANO-02** (theory grounding): Already in AiContextService; Task 1.2 and 2.1 ensure injection in atomic form.
- **REQ-NANO-03** (atomic prompt): Task 1.2.
- **REQ-NANO-04** (few-shot): Task 1.3.
- **REQ-NANO-05** (CoT): Task 1.4.
- **REQ-NANO-06** (guardrails): Tasks 1.1, 1.5.
- **REQ-NANO-07** (validator): Task 2.2.
