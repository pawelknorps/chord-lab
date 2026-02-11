# Research: Phase 4 – Polish & Theory Calibration & Nano Hardening

**Roadmap**: Phase 4 (Steps 10, 11, 12b, 12c, 12d)  
**Goal**: Optimize token usage, theory validation, and harden Gemini Nano with stateless atomic prompts, guardrails, and a Tonal.js validator.

---

## What We Need to Know to Plan This Phase

### 1. Current Nano Usage
- **jazzTeacherLogic.ts**: `createGeminiSession(systemPrompt, { temperature: 0.6|0.7|0.5, topK: 5 })`; session created per request and `session.destroy()` called after each prompt. No long-lived session.
- **Chord Lab SmartLessonPane**: Uses `localAgent.ask(prompt)` (LocalAgentService singleton with one persistent session); progression bundle prepended to user message. No temperature/topK override; no atomic template; no validator on response.
- **JazzKiller Practice Studio**: `generateLessonFromPracticeContext()` builds context from `buildPracticeContext(state)` (patterns, focus, hotspots) and uses a free-form prompt block (SONG, CHORDS, PATTERNS, FOCUS, TASK). No strict CONTEXT/TASK/CONSTRAINTS/RESPONSE template; no 4+4 bar slice.

### 2. State Slice (4+4 Bars)
- **JazzKiller**: `buildPracticeContext()` already focuses on patterns and focused pattern; it does not explicitly limit to "current 4 bars + next 4 bars." We need a small helper or option to slice measures to 4+4 for the prompt to satisfy REQ-NANO-01.
- **Chord Lab**: `progressionContext.ts` builds bundle from full progression; for stateless we can keep full progression but keep it short (already compact). Optional: "current chord" + "next chord" emphasis for atomic replies.

### 3. Theory Grounding (Tonal.js)
- **AiContextService** and theory core already provide chord tones, scale suggestions, Roman numerals, guide tones. REQ-NANO-02 is satisfied by injecting this into the prompt; we need to ensure scale degrees (note names in key) are explicit in the CONTEXT block when we ask for note-level advice (for validator and model).

### 4. Atomic Prompt Template
- **Template**: CONTEXT (song, key, current chord, scale degrees) → TASK → CONSTRAINTS (2 sentences, use scale degrees only) → RESPONSE. This can be a single function `generateAtomicPrompt(theoryData)` used by JazzKiller lesson and/or Chord Lab chat when asking for chord-in-context analysis.

### 5. Few-Shot
- Add 2–3 example pairs (input → teacher reply) to the system prompt in `jazzTeacherLogic.ts` (JAZZ_TEACHER_SYSTEM_PROMPT) and/or to the start of the user message. Example: "Input: Dm7 in C Major. Teacher: This is the ii chord. Aim for F (minor 3rd) to lead into B (3rd of G7) in the next bar."

### 6. Chain-of-Thought (CoT)
- For complex progressions, add an instruction line: "First identify the Roman numeral. Second, the target note of the resolution. Third, suggest a short lick." Can be optional (e.g. when pattern has 3+ chords or user asks "explain this progression").

### 7. Guardrails (temperature, topK, session reset)
- **temperature**: Change from 0.6/0.7 to **0.2** for all theory/lesson calls in `jazzTeacherLogic.ts` (createGeminiSession).
- **topK**: Change from 5 to **3** for theory calls.
- **Session reset**: jazzTeacherLogic already calls `session.destroy()` after each request. LocalAgentService keeps one session; we should either (a) call `dispose()` periodically (e.g. every N requests or on tab blur) or (b) have Chord Lab use the same createGeminiSession + destroy pattern for theory Q&A (per-request session). Option (b) aligns with stateless and avoids drift.

### 8. Validator (Tonal.js)
- **Where**: Any displayed AI response that suggests specific notes (e.g. "Play C#", "target the B"). Parse the response for note names (regex or simple list); for the current chord/scale from context, use Tonal.js to get allowed notes; if a suggested note is not in the set, remove or rewrite that part of the message (or append "(corrected: use scale tones only)" and list allowed notes).
- **Scope**: Apply in JazzKiller (Practice Studio lesson, SmartLessonPane) and Chord Lab (Progression Assistant chat) when the prompt was theory/note-specific. Optional: add a small `validateSuggestedNotes(text, chordSymbol, key)` in theory or AiContextService.

### 9. Token Optimization (Step 10)
- Keep semantic markdown short; cap chord summary length (already MAX_CHORDS_IN_PROMPT = 48). For 4+4 bar slice, we naturally reduce tokens. No new service required; enforce in prompt builders.

### 10. Theory Validation Prompts (Step 11)
- Add an explicit line in the system prompt: "Before naming a note, verify it is in the Tones (1,3,5,7) or Scale Suggestion for that chord." JAZZ_TEACHER_SYSTEM_PROMPT already has HALLUCINATION CHECK; we can strengthen with "Never suggest a note that is not listed in the provided context."

---

## Summary
- **Guardrails**: Central change in `jazzTeacherLogic.ts`: theory calls use `temperature: 0.2`, `topK: 3`; sessions already per-request with destroy. For Chord Lab, prefer per-request session (teacher logic path) for theory Q&A to avoid drift.
- **Atomic + few-shot + CoT**: New or extended prompt builders in jazzTeacherLogic (and optionally progressionContext) with CONTEXT/TASK/CONSTRAINTS/RESPONSE and 2–3 few-shot examples in system prompt; CoT instruction for complex progression questions.
- **State slice**: Helper to get "current 4 bars + next 4 bars" from practice store / song measures; feed into atomic prompt.
- **Validator**: Small validator that takes (responseText, chordOrScaleContext) and masks or corrects suggested notes not in Tonal.js scale/chord; integrate at display time in lesson/chat components.
