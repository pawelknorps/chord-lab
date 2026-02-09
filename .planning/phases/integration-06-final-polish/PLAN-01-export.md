---
wave: 1
dependencies: [integration-05-advanced-motivic]
files_to_modify:
  - src/modules/RhythmArchitect/components/SyncopationBuilder.tsx
  - src/modules/RhythmArchitect/components/PolyrhythmGenerator.tsx
  - src/modules/RhythmArchitect/components/MotivicDisplacement.tsx
  - src/modules/RhythmArchitect/components/SubdivisionPyramid.tsx
  - src/hooks/useMidiExport.ts
estimated_time: 4-6 hours
---

# Plan: Final Polish & Export Features (EXP-01, GAME-01)

## Context

The Rhythm Architect is fully functional and interactive. To make it a "pro" tool, users must be able to export their creations (MIDI) into their DAWs. Additionally, we need to ensure the gamification loop feels rewarding across all modules.

## Goal

Implement MIDI export for all rhythm generators and polish the user experience with gamification feedback.

## Tasks

### Task 1: Universal MIDI Export Hook (EXP-01)

<task>
<description>
Create a reusable `useMidiExport` hook that can take a rhythm pattern (array of booleans or notes) and generate a downloadable .mid file.
</description>

<steps>

1. Create `src/hooks/useMidiExport.ts`.
   - Use `@tonejs/midi` or a simple binary writer if dependency is heavy (likely use a lightweight approach or `file-saver`).
   - Function signature: `exportRhythm(pattern: boolean[] | Note[], bpm: number, subdivision: string)`.
2. Integrate "Export MIDI" button into:
   - `SyncopationBuilder` (exports the current syncopated loop).
   - `PolyrhythmGenerator` (exports the combined polyrhythm).
   - `MotivicDisplacement` (exports the displaced melodic pattern).
   - `SubdivisionPyramid` (exports the active layers combined).

</steps>

<verification>

* [ ] Clicking "Export" downloads a valid `.mid` file.
* [ ] The MIDI file plays correctly in a DAW (e.g., GarageBand/Ableton).

</verification>
</task>

### Task 2: Gamification Feedback & Polish (GAME-01)

<task>
<description>
Audit and enhance the XP/Streak feedback loop.
</description>

<steps>

1. Create a `FloatingFeedback` component (or integrate into `useToast`) that shows "+50 XP" animations near the cursor or center screen.
2. Verify `useMasteryStore` calls in:
   - `SyncopationBuilder` (on successful dictation).
   - `PolyrhythmGenerator` (on successful tap challenge).
   - `RhythmExercises` (already done, verify consistency).
3. Add "Perfect Streak" visual cues (fire effects or similar).

</steps>

<verification>

* [ ] Completing a challenge triggers a visible XP reward.
* [ ] Progress is persisted in the store (mock).

</verification>
</task>

## Success Criteria

* [x] All 4 major rhythm modules have a working "Export MIDI" button.
* [x] Gamification feels rewarding and consistent.
