# Plan: Phase 7 – Ear Trainer Feedback Loop & Rhythm Scat (Nano as Metadata Generator)

**Roadmap**: Phase 7 (Steps 20–24)  
**Goal**: Ear Trainer explains why mistakes happened (diagnostic hints); Rhythm Trainer gets scat phrases for subdivisions. Nano narrates Tonal.js ground truth. No Nano call assumes prior context.

---

## Frontmatter

- **Waves**: 2 (Ear diagnostic + hint + Listen Again UI → Rhythm Scat + askNano guardrail).
- **Dependencies**: LocalAgentService (or jazzTeacherLogic-style session create/destroy), FunctionalEarTraining store and IntervalsLevel, RhythmArchitect SubdivisionPyramid, existing INTERVALS and subdivision names.
- **Files likely to be modified**:
  - `src/modules/FunctionalEarTraining/components/levels/IntervalsLevel.tsx` (wrong-answer path: show hint, Listen again, retry).
  - New: `src/modules/FunctionalEarTraining/utils/earDiagnosis.ts` (diagnoseEarError).
  - New: `src/modules/FunctionalEarTraining/utils/earHintService.ts` or `src/core/services/earHintService.ts` (getEarHint).
  - New (optional): `src/core/services/nanoHelpers.ts` (askNano wrapper).
  - `src/modules/RhythmArchitect/components/SubdivisionPyramid.tsx` (display scat phrase above metronome; optional "Generate scat" or auto-fetch when Nano available).
  - New (optional): `src/modules/RhythmArchitect/utils/rhythmScatService.ts` or `src/core/services/rhythmScatService.ts` (getScatForSubdivision).

---

## Phase scope (from ROADMAP.md)

- **Step 20**: Ear diagnostic – `diagnoseEarError(correctInterval, userGuess)` using semitones (from INTERVALS or Tonal.js Interval.semitones); return correct, guess, errorType (overshot/undershot), distance, isCommonConfusion (e.g. 4P vs tritone).
- **Step 21**: Ear hint – `getEarHint(diagnosis)`; pass diagnosis to Nano; system prompt "Never give the answer. 1-sentence hint on vibe/character of the correct interval." Return hint for display.
- **Step 22**: Listen Again UI – In Ear Trainer (IntervalsLevel): on wrong answer → show "Not quite" + AI hint (toast/bubble) → replay → retry → on success update performance heatmap.
- **Step 23**: Rhythm Scat – For selected rhythm (e.g. Swing, 8th Note Triplets), ask Nano for a 3-word vocalization/scat phrase; display above metronome. For complex syncopated rhythms, generate scat phrase to internalize time.
- **Step 24**: askNano guardrail – Ensure all Nano calls use Zero-Shot Context wrapper; re-inject ground truth (JSON from Tonal.js/state); system prompt "Concise Jazz Coach. Limit 15 words" (or role-specific) where applicable.

---

## Wave 1: Ear diagnostic, hint, and Listen Again UI

### Task 1.1: diagnoseEarError (Step 20)

- Implement `diagnoseEarError(correctInterval, userGuess)`.
- **Inputs**: `correctInterval` and `userGuess` as interval identifiers. Use semitones: either from IntervalsLevel INTERVALS (name → semitones) or, if available, from `@tonaljs/interval` (`Interval.semitones(intervalName)`). Map IntervalsLevel names (e.g. `P4`, `#4/b5`) to semitones via existing INTERVALS or a small map (P4→5, #4/b5→6, P5→7, etc.).
- **Output**: `{ correct: string, guess: string, errorType: 'overshot' | 'undershot', distance: number, isCommonConfusion: boolean }`. `errorType = guessSemitones > correctSemitones ? 'overshot' : 'undershot'`. `distance = Math.abs(correctSemitones - guessSemitones)`. `isCommonConfusion`: true when (correct is P4 and guess is tritone) or (correct is P5 and guess is tritone) or (correct is tritone and guess is P4 or P5).
- **Location**: New file `src/modules/FunctionalEarTraining/utils/earDiagnosis.ts` (or `src/core/ear/earDiagnosis.ts`).
- **Verification**: Unit test or manual: given correct=P4 (5 semitones), guess=#4/b5 (6) → errorType 'overshot', distance 1, isCommonConfusion true. Given correct=M3 (4), guess=m3 (3) → 'undershot', distance 1, isCommonConfusion false.

### Task 1.2: getEarHint (Step 21)

- Implement `getEarHint(diagnosis)`.
- **Behavior**: If `window.ai?.languageModel` (or LanguageModel) is unavailable, return a fallback string (e.g. "Listen for the tension."). Otherwise create a **one-shot session** with system prompt: "You are a jazz ear-training coach. Never give the answer. Provide a 1-sentence hint focused on the 'vibe' or 'character' of the correct interval compared to their guess."
- **Context**: Pass full diagnosis as JSON in the prompt: `Context: ${JSON.stringify(diagnosis)}. Question: Give a hint that describes the 'flavor' of the correct interval compared to their guess. Do not name the interval.`
- **Return**: The model response string (hint only). Call `session.destroy()` after the prompt.
- **Location**: New file `src/core/services/earHintService.ts` or `src/modules/FunctionalEarTraining/utils/earHintService.ts`. Reuse the same session-creation pattern as `jazzTeacherLogic.ts` (create, prompt, destroy).
- **Verification**: Manual: wrong answer in IntervalsLevel → getEarHint called with diagnosis → response is a short hint and does not contain the correct interval name (e.g. "Minor 3rd").

### Task 1.3: Listen Again UI in IntervalsLevel (Step 22)

- In `IntervalsLevel.tsx`, on wrong answer (when `intervalName !== challenge.interval.name`):
  - Set `result = 'incorrect'` (existing).
  - Call `diagnoseEarError(challenge.interval.name, intervalName)` to get diagnosis.
  - Call `getEarHint(diagnosis)` (async). Show loading state (e.g. "Getting hint...").
  - Display "Not quite." and the AI hint in a **toast or bubble** (reuse existing toast if present, or add a small inline message below the buttons).
  - Add a **"Listen again"** button that calls `playAudio()` (replay the same interval). Do **not** call `loadNewChallenge()` on wrong answer; keep the same challenge so the user can retry.
  - When the user selects the correct interval after a retry, proceed as today: set result 'correct', add score, update heatmap, then `loadNewChallenge()` after delay.
  - Optionally add a **"Next"** or **"Skip"** button after wrong answer that calls `loadNewChallenge()` so the user can skip without retrying.
- **Verification**: Manual: play interval → choose wrong answer → see "Not quite" + AI hint → click "Listen again" → hear same interval → choose correct answer → see success and next challenge. Skip button loads next challenge.

---

## Wave 2: Rhythm Scat and askNano guardrail

### Task 2.1: getScatForSubdivision (Step 23 – backend)

- Implement `getScatForSubdivision(subdivisionName: string): Promise<string>`.
- **Behavior**: If Nano is unavailable, return a fallback (e.g. use existing KONNAKOL_SYLLABLES for that index, or "Ta-Ka").
- **Context**: Pass `{ subdivision: subdivisionName }` in the prompt. Prompt: "Given this rhythm subdivision, give a 3-word vocalization or scat phrase that a student can say to internalize the groove (e.g. 'Doo-dah, doo-dah' for swing). Reply with only the phrase, no explanation."
- **Session**: One-shot: create session with short system prompt ("You are a rhythm coach. Reply only with a short scat phrase."), prompt with context, destroy.
- **Location**: New file `src/core/services/rhythmScatService.ts` or `src/modules/RhythmArchitect/utils/rhythmScatService.ts`.
- **Verification**: Manual: call with "8th Note Triplets" or "Swing" → get a short phrase (e.g. "Doo-dah, doo-dah" or similar).

### Task 2.2: Display scat above metronome (Step 23 – UI)

- In `SubdivisionPyramid.tsx`, add a **scat phrase** display above (or near) the metronome area.
- When the component mounts or the user changes the active preset/subdivision, if Nano is available, call `getScatForSubdivision(SUBDIVISION_NAMES[index] or preset name)` and set state with the result. Display it in a small label (e.g. "Say: Doo-dah, doo-dah").
- If Nano is not available, hide the scat block or show the static KONNAKOL_SYLLABLES for the current layer if desired.
- **Verification**: Manual: open Rhythm Architect → Pyramid Lab → select a subdivision → see scat phrase above metronome when Nano is on.

### Task 2.3: askNano guardrail (Step 24)

- **Option A**: Add a shared helper `askNano(context: object, question: string, systemPrompt?: string): Promise<string>` in `src/core/services/nanoHelpers.ts`. Implementation: create session with `systemPrompt ?? "You are a concise Jazz Coach. Limit answers to 15 words."`, prompt with `Context: ${JSON.stringify(context)}. Question: ${question}`, destroy, return response.
- **Option B**: Document the pattern and implement it inline in `earHintService` and `rhythmScatService` (each creates session, injects context, prompts, destroys). No new file.
- Use this pattern (or the shared helper) in `getEarHint` and `getScatForSubdivision` so that **no Nano call assumes prior context**; context is always re-injected.
- **Verification**: Grep or review: all new Nano calls in this phase pass a context object and do not rely on conversation history.

---

## Verification (phase success criteria)

- **Step 20**: diagnoseEarError returns correct, guess, errorType, distance, isCommonConfusion for P4/tritone and M3/m3 cases.
- **Step 21**: getEarHint returns a 1-sentence hint without giving the interval name; uses one-shot session and diagnosis as context.
- **Step 22**: Ear Trainer wrong answers show "Not quite" + AI hint; "Listen again" replays; retry leads to success and heatmap update; optional Skip loads next challenge.
- **Step 23**: Rhythm Trainer shows a scat phrase above the metronome for the selected subdivision when Nano is available; getScatForSubdivision returns a short phrase for a given subdivision name.
- **Step 24**: All new Nano calls in this phase re-inject context (askNano pattern or equivalent); no reliance on prior turns.

**Phase goal**: Ear Trainer wrong answers show AI hint (no answer); student can retry after hint. Rhythm Trainer shows scat phrase above metronome for selected subdivision. No Nano call assumes prior context.

---

## Plan check (phase goal and requirements)

- **Phase goal**: "Ear Trainer explains why mistakes happened (diagnostic hints); Rhythm Trainer gets scat phrases for subdivisions. Nano narrates Tonal.js ground truth." → Wave 1 (diagnoseEarError, getEarHint, Listen Again UI) and Wave 2 (getScatForSubdivision, display above metronome, askNano guardrail) cover it.
- **REQ-EAR-01** (diagnose error): Task 1.1.
- **REQ-EAR-02** (hint generator): Task 1.2.
- **REQ-EAR-03** (Listen Again UI): Task 1.3.
- **REQ-EAR-04** (aural mnemonics): Task 1.2 prompt allows Nano to suggest mnemonics; no extra task.
- **REQ-EAR-05** (error profiling): v2; out of scope for this phase.
- **REQ-RHY-01** (scat for subdivision): Tasks 2.1, 2.2.
- **REQ-RHY-02** (display above metronome): Task 2.2.
- **REQ-RHY-03** (complex rhythm → scat): Task 2.1 can accept a description string (e.g. "syncopated 16ths"); same API.
- **REQ-NANO-08** (askNano wrapper): Task 2.3; used in getEarHint and getScatForSubdivision.
