# Research: Phase 7 – Ear Trainer Feedback Loop & Rhythm Scat

## What do we need to know to plan this phase well?

### 1. Ear Trainer integration point

- **Functional Ear Training** lives in `src/modules/FunctionalEarTraining/`.
- **IntervalsLevel** (`components/levels/IntervalsLevel.tsx`) is the primary interval-identification level: it has a fixed `INTERVALS` list with `name`, `semitones`, and `label` (e.g. `m2`, `M3`, `P4`, `#4/b5`).
- On wrong answer it sets `result = 'incorrect'`, then after 1s resets state and clears selection. We need to **intercept** the wrong-answer path: instead of only resetting, show "Not quite" + fetch AI hint (async), display in a toast/bubble, add "Listen again" (replay) and allow retry without loading a new challenge until correct or user skips.
- **Interval naming**: IntervalsLevel uses `name` (e.g. `P4`, `#4/b5`). Tonal.js uses names like `4P`, `4d` (tritone). For `diagnoseEarError` we can work with **semitones** from the existing `INTERVALS` array (no new dependency), or use `@tonaljs/interval` if we add it: `Interval.semitones('4P')` → 5, `Interval.fromSemitones(7)` → `'5P'`. REQ says "using Tonal.js Interval.semitones" — use semitones derived from our INTERVALS (or map names to Tonal and call `Interval.semitones`) so diagnosis is unambiguous.

### 2. Diagnosis shape (Ear Feedback Loop)

- **diagnoseEarError(correctInterval, userGuess)**:
  - Inputs: correct and guessed interval (as names or semitones). Prefer semitones for consistency (from INTERVALS lookup).
  - Output: `{ correct, guess, errorType: 'overshot'|'undershot', distance: number, isCommonConfusion: boolean }`.
  - **Common confusions**: e.g. Perfect 4th (5 semitones) vs Tritone (6); Perfect 5th (7) vs Tritone (6). So `isCommonConfusion = (correct === 5 && guess === 6) || (correct === 7 && guess === 6) || (correct === 6 && (guess === 5 || guess === 7))` (or by interval names).

### 3. Hint generator (Nano)

- **getEarHint(diagnosis)** must **never** give the answer; Nano returns a 1-sentence hint on the "vibe" or "character" of the correct interval vs the guess.
- **Context**: Every call must receive full context (REQ-NANO-08). Pass `diagnosis` as JSON in the prompt; use a **one-shot session** (create → prompt → destroy) so we can set a custom system prompt ("You are a jazz ear-training coach. Never give the answer. Provide a 1-sentence hint focused on the 'vibe' or 'character' of the interval.").
- **Implementation options**: (a) Extend `LocalAgentService` with `askWithSystemPrompt(systemPrompt, context, question)` that creates a temporary session, or (b) add a small `earHintService.ts` that uses the same pattern as `jazzTeacherLogic.ts` (create session with ear-specific system prompt, inject diagnosis as context, prompt, destroy). Option (b) keeps LocalAgentService unchanged and matches existing JazzKiller pattern.

### 4. Rhythm Scat integration point

- **Rhythm Architect** lives in `src/modules/RhythmArchitect/`. **SubdivisionPyramid** (`components/SubdivisionPyramid.tsx`) has:
  - `SUBDIVISION_NAMES` (e.g. "Quarter Note", "8th Note Triplets", "16th Notes").
  - `KONNAKOL_SYLLABLES` (static: "Ta", "Ta-Ka", "Ta-Ki-Ta", …).
  - Metronome and playback; no "Swing" preset in the list, but we can add a "Swing" or "Swing 8ths" preset for Nano-generated scat.
- **Scat generator**: For a given subdivision (or rhythm name like "Swing"), call Nano with context `{ subdivision: "8th Note Triplets" }` and ask for a 3-word vocalization (e.g. "Doo-dah, doo-dah"). Display this **above the metronome** so students internalize the pocket.
- **Complex syncopated rhythms**: SyncopationBuilder or other views could pass a description (e.g. "syncopated 16ths") and Nano returns a scat phrase ("Doo-be-dah").

### 5. askNano guardrail (REQ-NANO-08)

- All Nano calls must re-inject ground truth; never assume the model remembers prior context.
- Pattern: `askNano(context, question)` with `systemPrompt: "You are a concise Jazz Coach. Limit answers to 15 words."` (or a role-specific prompt for ear/rhythm). Context = `JSON.stringify(context)` in the prompt.
- **Where**: Use this pattern in `getEarHint`, `getScatForSubdivision`, and any other new Nano call in this phase. Either add a shared helper in `src/core/services/` (e.g. `nanoHelpers.ts` or inside `LocalAgentService`) or implement inline in each service with the same contract.

### 6. Dependencies

- **Existing**: LocalAgentService, jazzTeacherLogic (session create/destroy pattern), Tonal.js usage in codebase (@tonaljs/chord, note, core). No @tonaljs/interval in package.json; we can use semitones from IntervalsLevel INTERVALS for diagnosis to avoid adding a dependency, or add @tonaljs/interval for strict Tonal compliance.
- **New files**: `earHintService.ts` (or under FunctionalEarTraining/utils), `diagnoseEarError` (same or in a shared ear utils file), optional `rhythmScatService.ts`, optional `askNano` in core services.

### 7. UI details

- **Ear Trainer**: Toast or inline bubble for "Not quite" + AI hint; "Listen again" button to replay the same interval; then user can guess again. Do not advance to next challenge until correct or explicit "Next" / "Skip". Performance heatmap update on success (existing behavior).
- **Rhythm**: Small label or card above the metronome area showing the current scat phrase when Nano is available; optional "Generate scat" button for current subdivision.

---

## Summary

- **Ear**: IntervalsLevel wrong-answer path → diagnoseEarError (semitones + common confusion) → getEarHint (Nano, one-shot, context = diagnosis) → show hint + Listen again + retry.
- **Rhythm**: SubdivisionPyramid (and optionally SyncopationBuilder) → getScatForSubdivision(name) → display above metronome.
- **Guardrail**: All new Nano calls use context injection (askNano pattern); no reliance on conversation history.
