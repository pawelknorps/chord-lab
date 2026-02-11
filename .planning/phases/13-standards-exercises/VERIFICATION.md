# Phase 13 Verification: Standards-Based Exercises (JazzKiller Module)

## Phase Goal (from ROADMAP)

Inside JazzKiller, student can pick a standard (same library), choose exercise type (Scales / Guide Tones / Arpeggios), choose input (Mic / MIDI), start playback, and receive real-time evaluation against the correct scale, guide tones, or arpeggio for each chord. Single exercise engine consumes either mic or MIDI; same scoring logic for both.

## Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| REQ-SBE-01 Scale Exercise Mode | ✅ | ChordScaleEngine → target set; scoring in StandardsExerciseEngine + useStandardsExercise |
| REQ-SBE-02 Guide-Tone Exercise Mode | ✅ | GuideToneCalculator → 3rd/7th; scoring in engine |
| REQ-SBE-03 Arpeggio Exercise Mode | ✅ | Tonal.js Chord.notes → chord tones; scoring in engine |
| REQ-SBE-04 Unified Input (Mic + MIDI) | ✅ | ExerciseInputAdapter: useHighPerformancePitch (mic) + useMidi (MIDI) → getCurrentNote() |
| REQ-SBE-05 Exercise UI (JazzKiller module) | ✅ | StandardsExercisesPanel in JazzKiller; Exercises button; same standard picker, chart, playback |

## Verification Checklist

- [x] **ExerciseInputAdapter**: getCurrentNote() from mic (useHighPerformancePitch → freq → note) or MIDI (useMidi lastNote); isReady; mic start/stop when active.
- [x] **StandardsExerciseEngine**: getTargetSet(chord, type) returns scale notes (ChordScaleEngine), guide tones (GuideToneCalculator), or chord tones (Chord.notes); scoreNote(studentNote, targetSet) returns hit/miss; pitch-class comparison.
- [x] **Scale / Guide-tone / Arpeggio flows**: useStandardsExercise wires exerciseType and currentChordSymbolSignal; target updates with chart; scoring in raf loop.
- [x] **StandardsExercisesPanel**: Exercise type (Scales / Guide Tones / Arpeggios), input (Mic / MIDI), current chord + target label, real-time feedback (correct/miss, accuracy %, hits/misses), reset session.
- [x] **JazzKiller integration**: showStandardsExercises state; Exercises button (Target icon); panel in right sidebar; sidebar visibility includes showStandardsExercises; close button resets showStandardsExercises.
- [x] **Unit tests**: StandardsExerciseEngine.test.ts — getTargetSet for scale (Dm7 Dorian), guideTones (3rd/7th), arpeggio (chord tones); scoreNote hit/miss; 8 tests passing.

## Manual Verification (recommended)

1. **Scale**: Load a standard in JazzKiller → open Exercises (Target button) → select Scales → start playback → play scale tones in time; UI shows correct/miss and accuracy.
2. **Guide tones**: Same; select Guide Tones → play 3rd/7th on downbeats; scoring reflects hits.
3. **Arpeggio**: Same; select Arpeggios → play chord tones; scoring reflects hits.
4. **Mic vs MIDI**: With Mic selected, allow mic and play; with MIDI selected (and device connected), play keyboard; same scoring logic.

## Files Delivered

- `src/modules/JazzKiller/core/ExerciseInputAdapter.ts` — unified input hook (mic/MIDI)
- `src/modules/JazzKiller/core/StandardsExerciseEngine.ts` — target set + scoring
- `src/modules/JazzKiller/core/StandardsExerciseEngine.test.ts` — unit tests
- `src/modules/JazzKiller/hooks/useStandardsExercise.ts` — hook composing adapter + engine
- `src/modules/JazzKiller/components/StandardsExercisesPanel.tsx` — Exercises panel UI
- `src/modules/JazzKiller/JazzKillerModule.tsx` — state, button, sidebar condition, panel render
