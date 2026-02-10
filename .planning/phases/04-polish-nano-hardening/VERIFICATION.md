# Phase 4 – Polish & Nano Hardening: Verification

**Phase goal**: Optimize token usage, strengthen theory validation prompts, and harden Gemini Nano with stateless atomic prompts, guardrails, and Tonal.js validator.

## Success criteria (from ROADMAP)

- [x] **Step 10**: Token usage optimized; CONTEXT limited when using 4+4 slice.
- [x] **Step 11**: Theory validation rule present in system prompt; interval/note naming constrained to context.
- [x] **Step 12**: Already done (Chord/Scale tone verification in prompts).
- [x] **Step 12b**: Atomic prompt (CONTEXT/TASK/CONSTRAINTS/RESPONSE) used for focused-pattern path; few-shot in system prompt; CoT for complex progression questions.
- [x] **Step 12c**: Theory calls use `temperature: 0.2`, `topK: 3`; session lifecycle avoids long-lived drift (per-request destroy in jazzTeacherLogic; periodic reset in LocalAgentService).
- [x] **Step 12d**: Validator runs on theory/note-specific responses; suggested notes not in Tonal.js scale/chord are not shown (replaced with “[use scale tone]” + disclaimer).

**Phase goal**: AI response time < 2s for complex lookups; theory answers stay on-topic; suggested notes pass Tonal.js validation.

## Verification checklist

- Grep: `temperature: 0.2`, `topK: 3` in jazzTeacherLogic.ts for theory paths.
- Manual: Practice Studio with focused pattern (1–2 chords) uses atomic prompt; lesson is short and on-topic.
- Manual: AI response that suggests “Play C#” over Cmaj7 in C is sanitized (replaced or disclaimer appended).
- Manual: Chord Lab / JazzKiller lesson and chat display validated text; no raw out-of-scale note suggestions.
