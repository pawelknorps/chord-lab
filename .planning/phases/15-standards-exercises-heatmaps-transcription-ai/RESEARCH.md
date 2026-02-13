# Phase 15 Research: Error Heatmaps, Transcription & AI Analysis

## What We Need to Know to Plan This Phase Well

### 1. Existing Heatmap Pattern (Feedback Engine)

- **useScoringStore**: `heatmap: Record<number, number>` (measureIndex → sum of correctness points), `measureTicks: Record<number, number>` (measureIndex → sample count). Accuracy per measure = `points / (ticks * 1.2)` (capped at 1).
- **PerformanceHeatmapOverlay**: Single-measure overlay; reads from useScoringStore; colors: green >80%, amber 50–80%, red &lt;50%; `absolute inset-0 z-0 pointer-events-none`.
- **LeadSheet.tsx**: Renders each measure cell with `<PerformanceHeatmapOverlay measureIndex={index} />` at line 127. No props today to switch heatmap source; LeadSheet does not receive exercise state.
- **Phase 15 implication**: Exercise heatmap uses **hits/(hits+misses)** per measure (no "points" scale). We need either (a) optional props on LeadSheet for `exerciseStatsByMeasure` + show StandardsExerciseHeatmapOverlay when provided, or (b) a context/store that LeadSheet reads to decide which overlay to show when in Exercises mode.

### 2. AI Critique Pattern (jazzTeacherLogic)

- **generatePerformanceCritique(sessionData)**: Takes songTitle, key, score, grade, perfectNotesCount, totalNotesCount, heatmap (points), measureTicks. Uses `createGeminiSession(JAZZ_TEACHER_SYSTEM_PROMPT, { temperature: 0.2, topK: 3 })`. Builds prompt with weak measures (accuracy &lt; 60%), mastery ratio; asks for Sandwich Technique (strength, improvement, next step). Returns string; empty if Nano unavailable.
- **Phase 15 implication**: New `generateStandardsExerciseAnalysis(sessionData)` should take exerciseType, accuracy, heatmap as `Record<number, { hits, misses }>`, optional transcription string. Derive per-measure accuracy as hits/(hits+misses); same session creation and low temperature; prompt should ask for strengths, specific advice, and development suggestions (e.g. bars to focus, next exercise type).

### 3. Transcription Data and Output

- **Input pipeline**: Same as Phase 13—ExerciseInputAdapter (mic via useITMPitchStore → freq → Note.fromFreq → midi, or MIDI lastNote). We need **timestamped** events: for each note onset, record midi, transport seconds, and measure/beat from jazzSignals.
- **Tonal.js**: `Note.fromMidi(midi)` → note name (e.g. "C4"); use for note list. Duration/rhythm from delta between onsets and BPM (optional for Phase 15).
- **Output formats**: (1) Note list: "C4, E4, G4, Bb4, ..." — sufficient for REQ-SBE-07. (2) Optional: rhythm (quarter, eighth) from onset deltas. (3) ABC/MusicXML: defer or minimal; no library required for note list.
- **Phase 15 implication**: Store `TranscriptionEvent[]` with midi, onsetSeconds, measureIndex, beat; produce note list via Tonal; display in SoloTranscriptionPanel. Copy/export = string to clipboard.

### 4. Where Exercise UI Lives

- **StandardsExercisesPanel**: Exercise type (Scales / Guide Tones / Arpeggios), input (Mic / MIDI), latency, real-time feedback (accuracy, hits/misses, last result). Rendered inside JazzKiller when user opens Exercises (same standard, chart, playback).
- **LeadSheet**: Used inside JazzKillerModule; receives song, filteredPatterns, onChordClick. To show **exercise** heatmap, JazzKillerModule must pass exercise stats into LeadSheet when Exercises panel is open and useStandardsExercise has run (e.g. optional prop `exerciseStatsByMeasure` and `showExerciseHeatmap`).
- **PracticeReportModal**: Post-session modal with score, grade, heatmap, AI critique (generatePerformanceCritique). Phase 15 adds similar "Analyze performance" for Standards Exercises, using generateStandardsExerciseAnalysis; can be a new modal or expandable section in StandardsExercisesPanel.

### 5. Dependencies and Risks

- **Phase 13**: useStandardsExercise already maintains statsByMeasure; only need to expose it. No new scoring logic.
- **Gemini Nano**: Same availability as PracticeReportModal; graceful fallback ("AI analysis unavailable") when not present.
- **Transcription timing**: Mic latency may shift transcribed onsets; acceptable for note list; optional latency offset can be applied to onsetSeconds when displaying measure/beat.

---

## Summary

- Reuse PerformanceHeatmapOverlay **pattern** (per-measure overlay, green/amber/red) with **exercise** data (statsByMeasure → accuracy = hits/(hits+misses)). LeadSheet needs optional props or context to show exercise heatmap when in Exercises mode.
- Reuse createGeminiSession + Sandwich-style prompt for **generateStandardsExerciseAnalysis**; input = exerciseType, accuracy, heatmap (hits/misses), optional transcription.
- Transcription = capture note onsets (midi, transport time, measure/beat) via same adapter as exercises; output note list with Tonal.js; optional rhythm later.
