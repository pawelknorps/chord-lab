# Phase 15 Summary: Standards Exercises — Error Heatmaps, Transcription & AI Analysis

## Goal

Extend Phase 13 so that when the user plays over a standard (mic or MIDI) in Scales / Guide Tones / Arpeggios mode, they get: (1) **error heatmaps** by exercise type on the lead sheet; (2) an option to **record** a solo and receive a **written transcription** (note list); (3) **AI analysis** of the performance with advice and development suggestions.

## Delivered

### Wave 1: Error Heatmaps (REQ-SBE-06)

- **useStandardsExercise**: Exposed `statsByMeasure: Record<number, { hits, misses }>` and `exerciseType` in the return object.
- **StandardsExerciseHeatmapOverlay**: New component that renders per-measure accuracy overlay (green >80%, amber 50–80%, red <50%) from `statsByMeasure`.
- **useStandardsExerciseHeatmapStore**: Small Zustand store so the Exercises panel can sync heatmap data and Lead Sheet can read it without lifting the hook to the module.
- **StandardsExercisesPanel**: Syncs `statsByMeasure` and `exerciseType` to the heatmap store on change.
- **LeadSheet**: Optional props `showExerciseHeatmap`; when true, reads from heatmap store and renders `StandardsExerciseHeatmapOverlay` per measure instead of `PerformanceHeatmapOverlay`.
- **JazzKillerModule**: Passes `showExerciseHeatmap={showStandardsExercises}` to Lead Sheet; clears heatmap store when Exercises panel is closed.

### Wave 2: Solo Transcription (REQ-SBE-07)

- **useSoloTranscription**: Hook that uses the same ExerciseInputAdapter (mic or MIDI); `startRecording()`, `stopRecording()`, `getTranscription(): TranscriptionEvent[]`, `getNoteListString(): string`, `isRecording`. Captures `midi`, `onsetSeconds`, `measureIndex`, `beat` per note.
- **SoloTranscriptionPanel**: "Record solo" / "Stop" buttons; when stopped, shows written note list (e.g. "C4, E4, G4") and "Copy"; optional `onTranscriptionReady(noteList)` for AI analysis.
- **StandardsExercisesPanel**: Embeds SoloTranscriptionPanel; passes `onTranscriptionReady` to store last transcription for "Analyze performance".

### Wave 3: AI Analysis (REQ-SBE-08)

- **generateStandardsExerciseAnalysis**: New function in `jazzTeacherLogic.ts`; accepts `standardTitle`, `key`, `exerciseType`, `accuracy`, `heatmap` (hits/misses per measure), optional `transcription`; builds prompt with weak measures and optional transcription snippet; asks for strengths, specific advice, development suggestions; returns string (or '' when Gemini Nano unavailable).
- **StandardsExercisesPanel**: "Analyze performance" button; calls `generateStandardsExerciseAnalysis` with current session data (statsByMeasure, accuracy, exerciseType, standardTitle, keySignature, lastTranscription); displays result in a block; disabled when no notes played; graceful message when Nano unavailable.
- **JazzKillerModule**: Passes `standardTitle={selectedSong?.title}` and `keySignature={selectedSong?.key ?? 'C'}` to StandardsExercisesPanel.

### Wave 4: Tests and Verification

- **jazzTeacherLogic.phase15.test.ts**: Tests that `generateStandardsExerciseAnalysis` accepts the expected session shape and returns a string (or empty when Nano unavailable).
- **VERIFICATION.md**: Checklist and deliverables table.

## Files Created

- `src/modules/JazzKiller/components/StandardsExerciseHeatmapOverlay.tsx`
- `src/modules/JazzKiller/state/useStandardsExerciseHeatmapStore.ts`
- `src/modules/JazzKiller/hooks/useSoloTranscription.ts`
- `src/modules/JazzKiller/components/SoloTranscriptionPanel.tsx`
- `src/modules/JazzKiller/ai/jazzTeacherLogic.phase15.test.ts`

## Files Modified

- `src/modules/JazzKiller/hooks/useStandardsExercise.ts` (expose statsByMeasure, exerciseType)
- `src/modules/JazzKiller/components/StandardsExercisesPanel.tsx` (heatmap sync, SoloTranscriptionPanel, AI analysis UI, standardTitle/keySignature)
- `src/modules/JazzKiller/components/LeadSheet.tsx` (showExerciseHeatmap, StandardsExerciseHeatmapOverlay)
- `src/modules/JazzKiller/JazzKillerModule.tsx` (showExerciseHeatmap, clear store, standardTitle/keySignature)
- `src/modules/JazzKiller/ai/jazzTeacherLogic.ts` (generateStandardsExerciseAnalysis)

## Commits

- W1: feat(phase-15): W1 error heatmaps - expose statsByMeasure, overlay, LeadSheet wiring
- W2: feat(phase-15): W2 solo transcription - useSoloTranscription hook, SoloTranscriptionPanel, note list
- W3: feat(phase-15): W3 AI analysis - generateStandardsExerciseAnalysis, Analyze performance UI
