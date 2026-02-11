# Research: Phase 9 – Adaptive Ear Training with MIDI-Supported AI

## What do I need to know to PLAN this phase well?

### 1. Existing MIDI Integration (Reuse Points)

- **MidiContext** (`src/context/MidiContext.tsx`): Provides `useMidi()` with `lastNote` (note, velocity, type, timestamp) and `activeNotes` (Set of MIDI notes). Used app-wide.
- **MelodyStepsLevel**: Already has full MIDI support. On `lastNote` change: computes `(playedMidi - rootMidi) % 12` → interval in semitones; compares to `targetInterval.semitones`; shows MATCH or PLAYED: X feedback.
- **ChordQualitiesLevel**: Has MIDI in **Pro** mode only. Uses `lastNote` to build `inputBuffer` (intervals from root); when buffer length ≥ target, compares sorted intervals to target. Uses `noteNameToMidi`, `playChordPart`, `triggerAttack`/`triggerRelease`. **Gap**: Novice/Advanced modes are click-only.
- **IntervalsLevel**: **No MIDI**. Uses click buttons only. Has `challenge.rootMidi`, `challenge.targetMidi`, `challenge.interval`; `handleAnswer(intervalName)`. Same structure as MelodySteps—add `useMidi` + effect on `lastNote`.

### 2. Ear Diagnosis (Phase 7)

- **earDiagnosis.ts**: `diagnoseEarError(correctInterval, userGuess)` → `{ correct, guess, errorType, distance, isCommonConfusion }`. Uses `NAME_TO_SEMITONES` map (matches IntervalsLevel INTERVALS). Supports m2..P8, #4/b5.
- **earHintService.ts**: `getEarHint(diagnosis)` uses askNano; one-shot session. For IntervalsLevel wrong answers.
- **ChordQualities diagnosis**: earDiagnosis is interval-based. For chord qualities we'd have "correct quality vs played quality"—no semitone distance. Phase 9 can log `{ correct, guess }` for qualities; defer fine-grained chord diagnosis to v2.

### 3. Chord Quality from Played Notes

- **analyzeChordFromNotes** (`src/core/theory/index.ts`): Takes `notes: number[]`, optional `keyContext`; returns `{ root, quality, bass }`. Used in ChordLab for chord detection.
- ChordQualitiesLevel currently compares **raw intervals** (e.g. [0,4,7]) not chord names. For MIDI, we can either:
  - **A**: Keep interval match (current Pro behavior)—user must play exact intervals.
  - **B**: Use `analyzeChordFromNotes` to get quality from played notes, compare to target quality. More flexible (any voicing).
- **Recommendation**: Start with A (interval match) for consistency with current Pro mode; B can be a refinement.

### 4. FunctionalEarTraining Store

- **useFunctionalEarTrainingStore**: Has level, difficulty, score, streak, currentKey, isPlaying, externalData. **No performance heatmap or error profiling**.
- **Streak**: Store has `addScore` which increments streak when points > 0; but `updateStreak` in IntervalsLevel comes from **useMasteryStore** (different system). Clarify: FET store streak vs MasteryStore streak—both are used.
- **New store needed**: `useEarPerformanceStore` (or extend FET store). Zustand with: `byLevel: { Intervals: { byInterval: { P4: { success, fail, lastDiagnosis[] } }, ChordQualities: { byQuality: { Major: { success, fail } } } }`, `sessionStart`, `consecutiveMistakes`, `consecutiveCorrect`, etc.

### 5. Adaptive Logic (Thresholds)

- **Repeat on struggle**: N consecutive mistakes (e.g. 3) or session mistake count for same type > threshold → prioritize similar items.
- **Harder when ready**: Streak ≥ M (e.g. 3) and success rate > threshold (e.g. 0.7) → expand pool (wider intervals, rarer qualities).
- Need configurable values; suggest: `STRUGGLE_THRESHOLD = 3`, `READY_STREAK = 3`, `READY_SUCCESS_RATE = 0.7`.

### 6. AI Focus-Area Service

- **askNano** (`nanoHelpers`): `askNano(context, question, systemPrompt?)`. One-shot; context re-injected.
- **Profile format**: `{ weakIntervals: ['P4','#4/b5'], commonConfusions: [['P4','#4/b5']], overshootCount, undershootCount, totalAttempts }`.
- **Prompt**: "Based on this profile, suggest 1–2 focus areas for the student. One sentence max."

### 7. IntervalsLevel Structure (for MIDI)

- Root = 60 (Middle C). Target = root + interval.semitones. INTERVALS array has name, semitones, label.
- When user plays MIDI note: `playedSemitones = (lastNote.note - rootMidi + 12) % 12`. Handle octave: if playedSemitones matches interval.semitones (or interval.semitones % 12 when P8) → correct. Actually P8 = 12 semitones; (played - root) % 12 for P8 would be 0 if they play same note octave up. Need to allow octave equivalence: `playedSemitones = (lastNote.note - rootMidi) % 12` handles 0–11; for P8 we need 12 ≡ 0 in some sense—no. P8 means root + 12. So (played - root) % 12: if played is root+12, we get 0. So for P8 we need (played - root) === 12 or (played - root) % 12 === 0 when we consider octave. Simpler: `diff = (lastNote.note - rootMidi + 120) % 12`—no. Standard: interval in semitones from root = (playedMidi - rootMidi). If we want octave equivalence, semitones can be 0–11 normally, but P8 = 12. So: `diff = lastNote.note - rootMidi`. If diff < 0, add 12 until positive. Then diff can be 1–12. Map to interval: if diff === interval.semitones → correct. For intervals up to P8 (12), diff can be 1–12. If they play root+12 (octave), diff=12. Good. If they play root+13, diff=13→ could wrap to 1 for m2. So we use `diff = ((lastNote.note - rootMidi) % 12 + 12) % 12` for 0–11, but P8 is 12. So: `semitonesFromRoot = lastNote.note - rootMidi`. If negative, add 12. Cap at 12 for "within octave" or allow 12. MelodyStepsLevel uses `(playedMidi - rootMidi) % 12` and compares to `targetInterval.semitones + 12` in one place—check. In MelodyStepsLevel line 209: `targetMidi = rootMidi + targetInterval.semitones + 12` (octave up). So they're in different octave. And line 255: `let diff = (playedMidi - rootMidi) % 12`. So they're comparing diff to something. Let me check again. Ah: `targetInterval.semitones` in ALL_INTERVALS are 2, 5, 9 etc (compound intervals). So for 9 it's 2 (9th = 2 semitones above octave). The diff (played - root) % 12 would give 0–11. So for a "9" (14 semitones total, 2 in next octave), diff would be 2. So they compare diff to targetInterval.semitones. For IntervalsLevel INTERVALS, semitones are 1–12 (m2 to P8). So diff = (played - root) % 12. If root=60, played=72, diff=0 (octave). For P8, interval.semitones=12, so we need diff=12… but %12 gives 0. So for P8 we need special case: diff === 0 or diff === 12? Actually (72-60)%12 = 0. So octave equivalence: P8 could be 0 or 12. IntervalsLevel has P8 semitones 12. So we'd need `semitonesFromRoot = playedMidi - rootMidi`. If it's 12, that's P8. If it's 0, that's unison. So we shouldn't use %12 for the comparison; we use the raw diff. If diff is in 1–11, that's m2–M7. If diff is 12 (or -12 mod 12 = 0 for same note), we need 12 for P8. Convention: `diff = (playedMidi - rootMidi + 12) % 12` gives 0–11. For P8, we want 12. So we could do: if diff===0 and interval.semitones===12, treat as P8 (octave up). Or: use `diff = playedMidi - rootMidi` and if diff < 0 add 12; then diff 1–12. For diff=12 that's P8. So `diff = ((playedMidi - rootMidi) % 12 + 12) % 12 || 12` when we want 12 for octave. Actually simpler: `diff = playedMidi - rootMidi`. If diff <= 0, diff += 12. If diff > 12, diff = diff % 12 or keep for compound. For single octave, diff in [1,12]. Good.
- **Conclusion**: Use `diff = ((playedMidi - rootMidi) % 12 + 12) % 12`; for diff=0 treat as 12 (P8 octave). Or: `diff = playedMidi - rootMidi`; if diff < 1, diff += 12; if diff > 12, diff = diff % 12 (for compound). Keep it simple: `diff = (playedMidi - rootMidi + 12) % 12`; if 0, use 12 for P8 check. So: `const playedSemitones = (lastNote.note - challenge.rootMidi + 12) % 12 || 12;` when comparing to interval.semitones.
