# Phase 27 Plan: Performance Trends & AI Transcriptions 📈

Focus: Transform persistent session data into actionable analytics and refined transcriptions. Help the user see their growth and study their own playing.

## Wave 1: Progress Visualization

Visualize the user's growth over time using the data in `useSessionHistoryStore`.

- [ ] **Task 1: Create ProgressTrendChart Component**
  - Implement a premium SVG-based line chart.
  - Features: Accuracy trend, consistency shading, and tooltips.
  - Files: `src/modules/ITM/components/ProgressTrendChart.tsx`

- [ ] **Task 2: Integrate Trends into ProgressPage**
  - Add the trend chart to the `ProgressPage`.
  - Add filters for "All Standards" vs specific songs.
  - Files: `src/pages/ProgressPage.tsx`

## Wave 2: AI Trend Analysis

Use Gemini Nano to analyze growth patterns across multiple sessions.

- [ ] **Task 3: Implement Trend Analysis Service**
  - Create logic to gather stats from the last 5-10 sessions.
  - Build a prompt for Gemini Nano focused on "Long-term Phrasing Growth."
  - Files: `src/core/services/TrendAnalysisService.ts`, `src/core/audio/AiWorker.ts`

- [ ] **Task 4: AI Trend UI in Progress Dashboard**
  - Add a "Sensei's Observation" card that shows the long-term trend analysis.
  - Files: `src/modules/ITM/components/TrendAnalysisView.tsx`

## Wave 3: Transcription Musicalization

Refine raw solo captures into readable notation snippets using AI assistance.

- [ ] **Task 5: Implement Solo Transcription Storage**
  - Create `useSoloStore` to persist recorded solos with timestamps and standards.
  - Files: `src/core/store/useSoloStore.ts`

- [ ] **Task 6: AI Transcription Polishing**
  - Update `jazzTeacherLogic` to include a "Musicalizer" task.
  - This turns raw note arrays into structured "Licks" with suggested rhythms/articulations.
  - Files: `src/modules/JazzKiller/ai/jazzTeacherLogic.ts`

## Verification Criteria

- [ ] Line chart accurately reflects the accuracy scores in `useSessionHistoryStore`.
- [ ] AI Trend Analysis identifies at least one "improvement" or "stagnation" point.
- [ ] Recorded solos are persisted and can be "Musicalized" into a lick format.
- [ ] Switching between standards in the trend view updates the chart correctly.
