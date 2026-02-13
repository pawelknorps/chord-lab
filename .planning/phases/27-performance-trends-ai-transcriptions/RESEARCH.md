# Research: Phase 27 - Performance Trends & AI Transcriptions

## Current State Analysis

### 1. Data Source: `useSessionHistoryStore`

- Stores up to 50 `PerformanceSegment` objects.
- Each segment contains `overallScore`, `measures` (with `accuracyScore` and `notes`), `bpm`, `standardId`, and `timestamp`.

### 2. Visualization Requirements

- Need a trend line for Accuracy over time.
- Need a "Heatmap of Progress" (consistency across sessions).
- Candidates for visualization:
  - **Recharts**: Heavy but standard.
  - **Custom SVG**: Light and fits the "Bento Box" aesthetic of the app.
  - **Decision**: Use Custom SVG for better integration with the existing premium design system.

### 3. AI Trend Analysis

- Gemini Nano can now receive multiple session summaries (or just the stats) to identify growth patterns.
- Prompt strategy: "I played 'Blue Bossa' 5 times this week. My accuracy went from 60% to 85%. What changed in my phrasing?"

### 4. AI Transcription Enhancement

- Currently, we capture raw MIDI/Pitch.
- AI can "quantize" and "musicalize" these notes into a lead-sheet format.
- `useSoloTranscription` needs to be linked to the persistent history.

## Implementation Strategy

### Wave 1: Progress Analytics

- Create `ProgressChart.tsx` using SVG to plot accuracy over the last N sessions.
- Filter by Standard (e.g., "See my progress on Giant Steps").

### Wave 2: Trend Insights (AI)

- Add "Trend Analysis" to the `MasteryTreeView` or `ProgressPage`.
- Prompt Gemini Nano with stats from the last 5 sessions of a specific standard.

### Wave 3: Transcription Cleanup

- Use Gemini Nano to detect "Motifs" in the solo transcription.
- Save transcriptions to LocalStorage/Supabase for later review.

## Open Questions

- **Performance**: Does parsing 50 segments in the UI cause lag? (Unlikely, but should memoize).
- **Storage**: Should transcriptions be stored separately? (Yes, they can be large).
