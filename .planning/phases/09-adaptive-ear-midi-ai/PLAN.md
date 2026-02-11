# Plan: Phase 9 – Adaptive Ear Training with MIDI-Supported AI

**Roadmap**: Phase 9 (Steps 33–38)  
**Goal**: All applicable ear training exercises accept MIDI; AI learns mistakes and drives adaptive difficulty (harder when ready, repeat when struggling).

---

## Frontmatter

- **Waves**: 3 (MIDI + Performance store → Adaptive curriculum → AI focus-area; Step 38 optional).
- **Dependencies**: Phase 7 (earDiagnosis, getEarHint, nanoHelpers), MidiContext, useFunctionalEarTrainingStore, IntervalsLevel, ChordQualitiesLevel.
- **Files likely to be modified**:
  - `src/modules/FunctionalEarTraining/components/levels/IntervalsLevel.tsx` (add useMidi, MIDI answer path).
  - `src/modules/FunctionalEarTraining/components/levels/ChordQualitiesLevel.tsx` (extend MIDI to Novice/Advanced if feasible; ensure Pro MIDI logs to performance store).
  - New: `src/modules/FunctionalEarTraining/state/useEarPerformanceStore.ts` (performance heatmap, error profiling).
  - New: `src/core/services/earFocusService.ts` (getFocusAreaSuggestion via askNano).
  - New (optional): `src/modules/FunctionalEarTraining/utils/adaptiveCurriculum.ts` (repeat-on-struggle, harder-when-ready logic).
  - `src/modules/FunctionalEarTraining/components/HUD.tsx` or new FocusAreaPanel (display AI suggestion).

---

## Phase scope (from ROADMAP.md)

- **Step 33**: MIDI input in IntervalsLevel and ChordQualitiesLevel; grade played notes as answer.
- **Step 34**: Create useEarPerformanceStore; record per-level, per-interval/quality success/failure and diagnosis.
- **Step 35**: Repeat on struggle: when N+ mistakes on same type, repeat similar items before new ones.
- **Step 36**: Harder when ready: when streak ≥ M and success rate > threshold, offer harder variants.
- **Step 37**: AI focus-area suggestion via getFocusAreaSuggestion(profile); display in panel/toast.
- **Step 38** (optional): Extend to BassLevel, HarmonicContextLevel MIDI.

---

## Wave 1: MIDI Input & Performance Store (Steps 33–34)

### Task 1.1: IntervalsLevel MIDI input (Step 33a)

- Add `useMidi` to IntervalsLevel. When `lastNote` fires (type === 'noteon'):
  - Compute `playedSemitones = lastNote.note - challenge.rootMidi`. Normalize: if playedSemitones < 0, add 12; if playedSemitones > 12, use `playedSemitones % 12` (or cap at 12 for single octave).
  - Find interval in INTERVALS where `interval.semitones === playedSemitones` (or closest match for feedback).
  - Call `handleAnswer(interval.name)` with that interval—same path as click. If no match, show "PLAYED: X" feedback (map semitones to interval label for display).
- **Debounce**: Ignore rapid repeats (e.g. same note within 300ms) to avoid double-grade.
- **Fallback**: If no MIDI device, existing click buttons work unchanged.
- **Location**: `src/modules/FunctionalEarTraining/components/levels/IntervalsLevel.tsx`.
- **Verification**: Connect MIDI keyboard, play interval, play root+interval.semitones → see correct/incorrect; play wrong note → see PLAYED: X or wrong-answer path with hint.

### Task 1.2: ChordQualitiesLevel MIDI (Step 33b)

- ChordQualitiesLevel already has MIDI in **Pro** mode. Ensure it:
  - Logs each attempt (correct/incorrect) to performance store once Task 1.3 exists.
  - Extend MIDI to **Advanced** mode (Sevenths): same pattern—collect intervals from `lastNote`, compare to targetIntervals when buffer full.
  - **Novice** (Triads only): optionally add MIDI—collect 3 notes, compare intervals [0,3,7], [0,4,7], [0,3,6], [0,4,8].
- **Location**: `src/modules/FunctionalEarTraining/components/levels/ChordQualitiesLevel.tsx`.
- **Verification**: Pro/Advanced quiz mode + MIDI → play chord tones → correct; wrong notes → incorrect; logs to store.

### Task 1.3: useEarPerformanceStore (Step 34)

- Create Zustand store `useEarPerformanceStore`.
- **State**: 
  - `byLevel: Record<string, Record<string, { success: number, fail: number, lastDiagnoses: EarDiagnosis[] }>>` — e.g. `Intervals.P4`, `ChordQualities.Major`.
  - `sessionStart: number`, `consecutiveMistakes: number`, `consecutiveCorrect: number`, `lastChallengeType: string | null`.
- **Actions**:
  - `recordAttempt(level, itemKey, correct, diagnosis?)`: increment success or fail; if fail and diagnosis, push to lastDiagnoses (keep last 5); update consecutiveMistakes/consecutiveCorrect.
  - `getProfile()`: return `{ weakIntervals, commonConfusions, overshootCount, undershootCount, totalAttempts }` from lastDiagnoses and byLevel aggregates.
  - `resetSession()`: clear session data (optional; for "Reset progress").
- **Persistence**: Optional `persist` middleware with localStorage key `ear-performance`; expire or clear on version bump.
- **Location**: `src/modules/FunctionalEarTraining/state/useEarPerformanceStore.ts`.
- **Verification**: recordAttempt calls; getProfile returns sensible aggregates after 5+ attempts with some failures.

### Task 1.4: Wire levels to performance store (Step 34)

- In **IntervalsLevel**: After `handleAnswer` resolves (correct or incorrect), call `recordAttempt('Intervals', challenge.interval.name, result === 'correct', diagnosis)` when incorrect. Use diagnosis from `diagnoseEarError` when wrong.
- In **ChordQualitiesLevel**: After `handleAnswer` (correct or incorrect), call `recordAttempt('ChordQualities', targetAnswer, answer === targetAnswer, null)` — no fine-grained diagnosis for qualities in v1.
- **Verification**: Perform 3 wrong + 2 correct in Intervals → store shows P4 (or relevant interval) with fail 3, success 2; getProfile includes weakIntervals.

---

## Wave 2: Adaptive Curriculum (Steps 35–36)

### Task 2.1: Repeat-on-struggle logic (Step 35)

- Add `shouldRepeatSimilar(level, itemKey): boolean`: true when `consecutiveMistakes >= STRUGGLE_THRESHOLD` (e.g. 3) or when `byLevel[level][itemKey].fail` in last 5 attempts is high.
- Add `getNextChallenge(level, currentPool, lastItemKey?)`: when `shouldRepeatSimilar` and lastItemKey, return same or similar item (e.g. same interval, or adjacent semitone for intervals) instead of random. "Similar" for intervals: same or ±1 semitone; for qualities: same category (triad vs seventh).
- **Config**: `STRUGGLE_THRESHOLD = 3` in constants or store.
- **Location**: New `src/modules/FunctionalEarTraining/utils/adaptiveCurriculum.ts` or inline in store.
- **Verification**: Make 3 wrong on P4 → next challenge is P4 or #4/b5 or P5 (similar) instead of random.

### Task 2.2: Harder-when-ready logic (Step 36)

- Add `shouldIncreaseDifficulty(level): boolean`: true when `consecutiveCorrect >= READY_STREAK` (e.g. 3) and `successRate > READY_SUCCESS_RATE` (e.g. 0.7) over last 10 attempts.
- When true, expand pool: e.g. Intervals add m2, M7 (harder); ChordQualities add Extensions or rarer qualities. Use existing difficulty tiers or define "extended pool."
- **getNextChallenge**: when `shouldIncreaseDifficulty`, pick from extended pool; otherwise from base pool.
- **Config**: `READY_STREAK = 3`, `READY_SUCCESS_RATE = 0.7`.
- **Verification**: 3 correct streak + 70%+ rate → next challenges include harder intervals (e.g. m2, M7).

### Task 2.3: Integrate adaptive logic into loadNewChallenge (Step 35–36)

- In **IntervalsLevel** `loadNewChallenge`: call `getNextChallenge('Intervals', INTERVALS, challenge?.interval?.name)` (or equivalent) instead of `INTERVALS[Math.random()]`. Pass performance store state.
- In **ChordQualitiesLevel** `nextQuestion`: integrate `getNextChallenge` for pool selection.
- **Verification**: Struggle → repeat similar; ready → harder pool used.

---

## Wave 3: AI Focus-Area Suggestion (Step 37)

### Task 3.1: getFocusAreaSuggestion (Step 37a)

- Implement `getFocusAreaSuggestion(profile): Promise<string>`.
- **Input**: profile from `useEarPerformanceStore.getProfile()`.
- **Behavior**: If Nano unavailable, return fallback ("Keep practicing the intervals you missed."). Else call `askNano(profile, "Based on this student's ear training profile, suggest 1-2 focus areas in one sentence. Do not list intervals by name if that would give answers; instead describe the area of focus.")` with systemPrompt "You are a jazz ear coach. One sentence only."
- **Location**: New `src/core/services/earFocusService.ts`.
- **Verification**: Pass profile with weakIntervals ['P4','#4/b5'] → get short suggestion; no blocking.

### Task 3.2: Focus area UI (Step 37b)

- Add a "Focus area" display: small panel or toast, shown when user has 5+ attempts and clicks "Get focus suggestion" or after session summary.
- Component: `FocusAreaPanel` or section in FET HUD. Button "What should I focus on?" → call getFocusAreaSuggestion → display result. If loading, show spinner.
- **Location**: New `src/modules/FunctionalEarTraining/components/FocusAreaPanel.tsx` or integrate into existing HUD.
- **Verification**: 5+ attempts → click "Get focus suggestion" → see AI suggestion; no blocking.

---

## Wave 4 (Optional): Extend to More Levels (Step 38)

### Task 4.1: BassLevel MIDI (optional)

- BassLevel: if the exercise asks "play the root" or "play the bass note," add useMidi to accept played note and compare to expected root/bass. Defer if BassLevel structure is complex.
- **Verification**: Manual test.

### Task 4.2: HarmonicContextLevel MIDI (optional)

- If HarmonicContextLevel has "play chord tones" type exercises, add MIDI. Defer if structure differs.
- **Verification**: Manual test.

---

## Verification (phase success criteria)

- **Step 33**: IntervalsLevel and ChordQualitiesLevel accept MIDI input; played notes graded correctly.
- **Step 34**: useEarPerformanceStore exists; IntervalsLevel and ChordQualitiesLevel log attempts; getProfile returns aggregates.
- **Step 35**: After 3+ mistakes on same type, next challenge repeats similar items.
- **Step 36**: After 3 correct streak + 70% success rate, harder variants appear.
- **Step 37**: getFocusAreaSuggestion returns AI suggestion; UI displays it on demand without blocking.
- **Step 38** (optional): BassLevel or HarmonicContextLevel MIDI if applicable.

**Phase goal**: Ear training accepts MIDI; curriculum adapts (repeat when struggling, harder when ready); AI suggests focus areas from error profile.

---

## Plan check (phase goal and requirements)

- **Phase goal**: "All applicable ear training exercises accept MIDI; AI learns mistakes and drives adaptive difficulty" → Waves 1–3 cover Steps 33–37.
- **REQ-ADAPT-EAR-01** (MIDI input): Tasks 1.1, 1.2.
- **REQ-ADAPT-EAR-02** (Performance store): Tasks 1.3, 1.4.
- **REQ-ADAPT-EAR-03** (Repeat on struggle): Task 2.1, 2.3.
- **REQ-ADAPT-EAR-04** (Harder when ready): Task 2.2, 2.3.
- **REQ-ADAPT-EAR-05** (AI focus-area suggestion): Tasks 3.1, 3.2.
