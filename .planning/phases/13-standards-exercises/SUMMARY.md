# Phase 13 Summary: Standards-Based Exercises (JazzKiller Module)

## Delivered

- **ExerciseInputAdapter** (`core/ExerciseInputAdapter.ts`): Hook that exposes `getCurrentNote()` from either mic (useHighPerformancePitch → frequency → MIDI) or MIDI (useMidi lastNote). Starts/stops mic when active and source is mic; isReady for UI.
- **StandardsExerciseEngine** (`core/StandardsExerciseEngine.ts`): `getTargetSet(chord, exerciseType)` returns pitch-class set and label for scale (ChordScaleEngine), guide tones (GuideToneCalculator), or arpeggio (Tonal.js Chord.notes). `scoreNote(studentNoteMidi, targetSet)` returns hit/miss (pitch-class comparison).
- **useStandardsExercise** (`hooks/useStandardsExercise.ts`): Composes adapter + engine; subscribes to currentChordSymbolSignal, measure/beat; runs scoring in requestAnimationFrame; returns targetSet, lastResult, accuracy, hits, misses, resetSession.
- **StandardsExercisesPanel** (`components/StandardsExercisesPanel.tsx`): Exercise type (Scales / Guide Tones / Arpeggios), input (Mic / MIDI), current chord + target display, real-time correct/miss and accuracy %, reset button.
- **JazzKiller integration**: `showStandardsExercises` state; Exercises button (Target icon) in toolbar; panel in right sidebar; sidebar shows when showStandardsExercises (or Guided Practice, etc.); close overlay resets showStandardsExercises.
- **Tests**: `StandardsExerciseEngine.test.ts` — getTargetSet (scale, guideTones, arpeggio), scoreNote (hit/miss, octave invariance); 8 tests passing.

## Requirements Satisfied

- REQ-SBE-01 (Scale), REQ-SBE-02 (Guide Tones), REQ-SBE-03 (Arpeggio), REQ-SBE-04 (Unified Mic + MIDI), REQ-SBE-05 (Exercise UI in JazzKiller).

## Out of Scope (this phase)

- Director/FSRS integration for "what to practice next."
- CREPE-WASM swap (Phase 9).
- New theory logic (existing ChordScaleEngine, GuideToneCalculator, Tonal.js only).
