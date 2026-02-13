# Phase 25 Plan: Advanced AI Interaction 🧠

Focus: Connect the high-speed audio pipeline to the AI pedagogical layer. Implement the JSON-to-Critique pipeline using Gemini Nano for deep performance synthesis.

## Wave 1: Performance Synthesis Engine

Implement the aggregator that turns raw pitch/time data into `PerformanceSegment` JSON.

- [ ] **Task 1: Extend AiWorker Analysis**
  - Update `src/core/audio/AiWorker.ts` to perform deeper frequency analysis.
  - Identify specific "Target Tone" misses based on chord metadata.
  - Calculate "Consistency" and "Tension" metrics from the note stream.
  - Files: `src/core/audio/AiWorker.ts`

- [ ] **Task 2: Implement ITM Segment Builder**
  - Create a utility hook or service that collects session data from `useScoringStore` and `usePracticeStore`.
  - Map the real-time `heatmap` and `playedNotes` into a valid `PerformanceSegment`.
  - Files: `src/modules/ITM/services/SegmentBuilder.ts`

## Wave 2: Local AI Pedagogical Layer

Implement prompt templates for Gemini Nano that consume performance data and output structured critique.

- [ ] **Task 3: Structured Pedagogical Prompts**
  - Update `LocalAgentService.ts` to use a more sophisticated system prompt.
  - Refine `AiWorker.ts` `generatePrompt` to request structured output (JSON or Bulleted).
  - Incorporate "Barry Harris" terminology as defined in `REQUIREMENTS.md`.
  - Files: `src/core/services/LocalAgentService.ts`, `src/core/audio/AiWorker.ts`

## Wave 3: Interactive Teacher UI

Create the "Post-Session Review" dashboard where AI feedback is visualized alongside the performance heatmap.

- [ ] **Task 4: AI-Driven Practice Report**
  - Update `PracticeReportModal.tsx` to use `localAgent.analyzePracticeSession`.
  - Implement a "Loading Phase" visualization for the AI worker.
  - Add "Recommended Practice" buttons based on AI suggestions.
  - Files: `src/modules/JazzKiller/components/PracticeReportModal.tsx`

- [ ] **Task 5: Persistent Session History (Optional/Stretch)**
  - Store `PerformanceSegment` in a simple local storage or store for "Progress Map" visualization.
  - Files: `src/core/store/usePracticeStore.ts`

## Verification Criteria

- AI critique is generated asynchronously without blocking the playback or UI.
- The critique identifies specific measures (e.g. "Focus on bar 16") correctly.
- Tone of the AI matches the "Jazz Mentor" persona defined in requirements.
- The `PerformanceSegment` contains all required fields for future Mastery Tree integration.
