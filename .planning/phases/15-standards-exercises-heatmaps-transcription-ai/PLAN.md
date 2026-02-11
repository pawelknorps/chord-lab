---
phase: 15
name: Standards Exercises — Error Heatmaps, Transcription & AI Analysis
waves: 4
dependencies: ["Phase 13: Standards-Based Exercises", "Phase 1: Feedback Engine (heatmap + AI critique)", "JazzKiller + useStandardsExercise"]
files_modified: [
  "src/modules/JazzKiller/hooks/useStandardsExercise.ts",
  "src/modules/JazzKiller/components/StandardsExercisesPanel.tsx",
  "src/modules/JazzKiller/ai/jazzTeacherLogic.ts"
]
files_created: [
  "src/modules/JazzKiller/components/StandardsExerciseHeatmapOverlay.tsx",
  "src/modules/JazzKiller/components/SoloTranscriptionPanel.tsx",
  "src/modules/JazzKiller/hooks/useSoloTranscription.ts"
]
---

# Phase 15 Plan: Standards Exercises — Error Heatmaps, Transcription & AI Analysis

**Focus**: Extend Phase 13 so that when the user plays over a standard (mic or MIDI) in Scales / Guide Tones / Arpeggios mode, they get: (1) **error heatmaps** by exercise type; (2) an option to **record** a solo and receive a **written transcription**; (3) **AI analysis** of the performance with advice and development suggestions.

**Success Criteria**:
- REQ-SBE-06: Error heatmap visible on lead sheet or dedicated panel; per measure (and optionally per chord); filter by exercise type (Scales, Guide Tones, Arpeggios).
- REQ-SBE-07: "Record solo" captures timestamped notes (mic or MIDI); written transcription (note list and/or notation) produced at end of recording; tied to standard and transport.
- REQ-SBE-08: Post-session (or on demand) AI analysis: input heatmap, optional transcription, accuracy, exercise type, standard, key; output advice and development suggestions (Gemini Nano or API).

---

## Context (Existing Assets)

- **Phase 13**: `useStandardsExercise` returns `accuracy`, `hits`, `misses`, `accuracyLast4`, `hitsLast4`, `missesLast4`; internally maintains `statsByMeasure: Record<number, { hits: number; misses: number }>` but does not expose it. StandardsExercisesPanel shows real-time feedback; same standard picker, chart, playback.
- **Heatmap pattern**: `useScoringStore` has `heatmap` (measureIndex → points) and `measureTicks` (measureIndex → ticks); `PerformanceHeatmapOverlay` renders per-measure color on lead sheet. PracticeReportModal uses heatmap + measureTicks for `generatePerformanceCritique`.
- **AI**: `jazzTeacherLogic.ts` has `generatePerformanceCritique(sessionData)` (songTitle, key, score, grade, perfectNotesCount, totalNotesCount, heatmap, measureTicks) → string. Uses Gemini Nano (Chrome Prompt API or window.ai).

---

## Wave 1: Error Heatmaps for Standards Exercises

*Goal: Expose per-measure hit/miss from useStandardsExercise; render heatmap on lead sheet or in panel; filter by exercise type.*

- <task id="W1-T1">**Expose statsByMeasure from useStandardsExercise**  
  In `useStandardsExercise.ts`, add to the returned object: `statsByMeasure: Record<number, { hits: number; misses: number }>` (and optionally `exerciseType` so consumers know which mode the heatmap reflects). No change to scoring logic; just expose existing state.</task>

- <task id="W1-T2">**StandardsExerciseHeatmapOverlay component**  
  Create `StandardsExerciseHeatmapOverlay.tsx` (or extend PerformanceHeatmapOverlay with a variant). For a given measure index, read from the exercise hook’s `statsByMeasure[measureIndex]`; compute accuracy = hits / (hits + misses); color: green (>80%), amber (50–80%), red (&lt;50%). If no data for measure, transparent. Props: measureIndex, statsByMeasure (or consume hook in parent and pass down). Reuse same visual style as PerformanceHeatmapOverlay (absolute overlay, pointer-events-none).</task>

- <task id="W1-T3">**Wire heatmap to Lead Sheet in Exercises mode**  
  When Standards Exercises panel is open and a session has run, show the exercise heatmap on the lead sheet (each measure cell gets StandardsExerciseHeatmapOverlay). Ensure the overlay reflects the **current** exercise type (Scales / Guide Tones / Arpeggios) so the user sees which mode the heatmap is for. Optional: toggle "Show heatmap" in StandardsExercisesPanel.</task>

- <task id="W1-T4">**Optional: Dedicated heatmap panel**  
  In StandardsExercisesPanel (or a subview), add an optional "View heatmap" section: bar chart or grid of measures (x = measure index, y = accuracy or color strip). Filter by exercise type so user can compare Scales vs Guide Tones vs Arpeggios. Can reuse same statsByMeasure data.</task>

---

## Wave 2: Record Written Transcription of Solo

*Goal: "Record solo" mode captures timestamped notes (mic or MIDI); produce written transcription at end.*

- <task id="W2-T1">**Solo recording state and pipeline**  
  Define a "solo over standard" mode: user starts "Record solo" (button in Standards Exercises or dedicated control); app records from the same input as exercises (ExerciseInputAdapter: mic or MIDI). Capture each note with: pitch (MIDI or note name), onset time (transport seconds or measure/beat), optional duration/offset. Store in a list: `TranscriptionEvent[] = { pitch, midi?, onsetSeconds, measureIndex?, beat?, durationSeconds? }`. Stop recording on "Stop" or when playback stops.</task>

- <task id="W2-T2">**useSoloTranscription hook**  
  Create `useSoloTranscription.ts`: `startRecording()`, `stopRecording()`, `getTranscription(): TranscriptionEvent[]`, `isRecording`. Uses same adapter as useStandardsExercise (getCurrentNote or getNotesInWindow); on each new note, push event with current transport time and measure/beat from jazzSignals. Optional: debounce or merge repeated same pitch into one event with duration.</task>

- <task id="W2-T3">**Written transcription output**  
  From `TranscriptionEvent[]`, produce: (1) **Note list**: e.g. "C4, E4, G4, Bb4, ..." (Tonal.js note names from MIDI). (2) Optional: **Rhythm-aware** format (e.g. quarter, eighth) from delta times and BPM. (3) Optional: ABC or internal notation format for future display. Display in a simple read-only view (SoloTranscriptionPanel or modal).</task>

- <task id="W2-T4">**SoloTranscriptionPanel UI**  
  Create `SoloTranscriptionPanel.tsx` (or section inside StandardsExercisesPanel): "Record solo" button (start/stop); when stopped, show "Transcription" with note list (and optional rhythm). Tie to current standard and key for context. Optional: "Copy" or "Export" for note list.</task>

---

## Wave 3: AI Analysis of Performance (Advice & Development Suggestions)

*Goal: After a Standards Exercise session (or on demand), call AI with heatmap + optional transcription + accuracy + exercise type; return advice and development suggestions.*

- <task id="W3-T1">**generateStandardsExerciseAnalysis in jazzTeacherLogic**  
  Add `generateStandardsExerciseAnalysis(sessionData: { standardTitle: string; key: string; exerciseType: 'scale'|'guideTones'|'arpeggio'; accuracy: number; heatmap: Record<number, { hits: number; misses: number }>; transcription?: string; })`. Build a prompt that includes: exercise type, overall accuracy, per-measure accuracy (from heatmap), optional transcription snippet. Ask the model for: (1) brief summary of strengths/weaknesses, (2) specific advice (e.g. "Work on guide tones in the bridge"), (3) development suggestions (e.g. "Practice this tune in 3 keys", "Focus on arpeggios in bars 17–24"). Reuse `createGeminiSession` and same fallback (Gemini Nano or API). Return string.</task>

- <task id="W3-T2">**Wire analysis to Exercises UI**  
  In StandardsExercisesPanel (or a post-session modal): add "Analyze performance" (or show automatically after stop). Call `generateStandardsExerciseAnalysis` with current session data: statsByMeasure (as heatmap), accuracy, exerciseType, standard title, key; optional: last recorded transcription if user had "Record solo" on. Display result in a modal or expandable section (same style as PracticeReportModal critique).</task>

- <task id="W3-T3">**Optional: Persist and compare**  
  Optional: persist last exercise session (standard, exercise type, heatmap, accuracy, transcription) in local state or Supabase so user can compare over time. Deferred if out of scope for Phase 15.</task>

---

## Wave 4: Tests and Verification

*Goal: Unit tests for transcription and analysis; verification checklist.*

- <task id="W4-T1">**Unit tests**  
  Add tests for: (1) TranscriptionEvent building from mock note stream and transport times. (2) generateStandardsExerciseAnalysis: mock session or skip if LLM required; at least test that the function accepts the expected shape and returns a string (or empty when Nano unavailable).</task>

- <task id="W4-T2">**Verification checklist**  
  - Heatmap: Run Scales exercise over a standard; stop; lead sheet shows green/amber/red per measure; switch to Guide Tones, run again; heatmap updates for that type.  
  - Transcription: Start "Record solo", play a few notes (mic or MIDI), stop; transcription shows note list aligned with what was played.  
  - AI analysis: After a session, click "Analyze performance"; AI returns advice and development suggestions (or graceful message if Nano unavailable).  
  - Update STATE.md and phase SUMMARY.md when complete.</task>

---

## Implementation Notes

- **Heatmap data shape**: Use `Record<number, { hits: number; misses: number }>` for exercise heatmap to match statsByMeasure; for AI, derive per-measure accuracy as hits/(hits+misses) per measure.
- **Transcription**: Prefer simple note list first; rhythm and notation (ABC/MusicXML) can be Phase 15 optional or follow-up.
- **AI**: Reuse JAZZ_TEACHER_SYSTEM_PROMPT or extend with exercise-specific instructions; keep temperature low (0.2) for consistent pedagogical tone.
