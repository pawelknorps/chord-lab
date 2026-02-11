# Phase 15 Verification: Standards Exercises — Error Heatmaps, Transcription & AI Analysis

## Success Criteria (from ROADMAP)

- [x] **Error heatmaps**: When playing over a standard (mic or MIDI), user can view error heatmaps by exercise type (Scales, Guide Tones, Arpeggios) on the lead sheet.
- [x] **Record solo & transcription**: Option to record a solo and get a written transcription (note list); works for both mic and MIDI.
- [x] **AI analysis**: After a session (or on demand), receive AI analysis with advice and development suggestions (or graceful message if Nano unavailable).

## Verification Checklist

### REQ-SBE-06: Error Heatmaps

- [x] **Expose statsByMeasure**: `useStandardsExercise` returns `statsByMeasure` and `exerciseType`.
- [x] **StandardsExerciseHeatmapOverlay**: Component renders per-measure overlay (green >80%, amber 50–80%, red <50%) from `statsByMeasure`.
- [x] **Lead Sheet wiring**: When Standards Exercises panel is open (`showExerciseHeatmap={showStandardsExercises}`), Lead Sheet shows exercise heatmap instead of scoring heatmap; data comes from `useStandardsExerciseHeatmapStore` (panel syncs stats on change).
- [x] **Clear on close**: When Exercises panel is closed, heatmap store is cleared so lead sheet does not show stale data.

### REQ-SBE-07: Record Written Transcription

- [x] **TranscriptionEvent type**: `useSoloTranscription` captures `midi`, `onsetSeconds`, `measureIndex`, `beat`.
- [x] **useSoloTranscription hook**: `startRecording()`, `stopRecording()`, `getTranscription()`, `getNoteListString()`, `isRecording`; uses same ExerciseInputAdapter (mic or MIDI).
- [x] **Note list output**: Tonal.js `Note.fromMidi(midi)` for display; note list string e.g. "C4, E4, G4".
- [x] **SoloTranscriptionPanel**: "Record solo" / "Stop" buttons; when stopped, shows transcription and "Copy" button; optional `onTranscriptionReady` for AI analysis.
- [x] **Integration**: SoloTranscriptionPanel embedded in StandardsExercisesPanel; same input source as exercises.

### REQ-SBE-08: AI Analysis

- [x] **generateStandardsExerciseAnalysis**: In `jazzTeacherLogic.ts`; accepts `standardTitle`, `key`, `exerciseType`, `accuracy`, `heatmap` (Record<number, { hits, misses }>), optional `transcription`; returns string (or '' when Nano unavailable).
- [x] **Prompt**: Includes exercise type, overall accuracy, weak measures (accuracy < 60%), optional transcription snippet; asks for strengths, specific advice, development suggestions.
- [x] **UI**: "Analyze performance" button in StandardsExercisesPanel; disabled when no notes played or when loading; displays result in expandable block; graceful message when Nano unavailable.
- [x] **Props**: StandardsExercisesPanel receives `standardTitle` and `keySignature` from JazzKillerModule (selectedSong.title, selectedSong.key).

### Wave 4: Tests

- [x] **jazzTeacherLogic.phase15.test.ts**: Tests that `generateStandardsExerciseAnalysis` accepts session data and returns a string (or empty when Nano unavailable); accepts optional transcription.

## Manual Verification (optional)

1. **Heatmap**: Open JazzKiller → pick a standard → open Standards Exercises → select Scales → start playback → play scale notes (mic or MIDI) → stop → lead sheet shows green/amber/red per measure; switch to Guide Tones and run again to see heatmap update.
2. **Transcription**: In Standards Exercises → "Record solo" → play a few notes → "Stop" → transcription shows note list; "Copy" copies to clipboard.
3. **AI analysis**: After playing (or without), click "Analyze performance" → if Nano available, see advice and suggestions; if not, see "AI analysis requires Gemini Nano...".

## Deliverables

| Item | Status |
|------|--------|
| useStandardsExercise: statsByMeasure, exerciseType | Done |
| StandardsExerciseHeatmapOverlay | Done |
| useStandardsExerciseHeatmapStore | Done |
| LeadSheet: showExerciseHeatmap, StandardsExerciseHeatmapOverlay | Done |
| JazzKillerModule: showExerciseHeatmap, clear store on close | Done |
| useSoloTranscription hook | Done |
| SoloTranscriptionPanel | Done |
| generateStandardsExerciseAnalysis | Done |
| "Analyze performance" UI + standardTitle/keySignature | Done |
| Unit tests (generateStandardsExerciseAnalysis) | Done |
