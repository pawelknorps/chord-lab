# Research: Phase 25 - Advanced AI Interaction

## Current State Analysis

### 1. AI Infrastructure

- **LocalAgentService**: A singleton that manages Gemini Nano (window.ai) and a background `AiWorker`.
- **AiWorker**: A basic worker that currently prepares a prompt string for the main thread.
- **jazzTeacherLogic**: Contains `generatePerformanceCritique`, which currently runs on the main thread and uses a simplified heuristic to identify "weak measures".

### 2. Performance Data

- **PerformanceSegment**: A TypeScript interface exists for structured session data.
- **ScoringStore**: Maintains real-time heatmap and accuracy data during a session.
- **PracticeReportModal**: Visualizes the grade, accuracy, and AI critique, but the AI path is currently blocking-ish and doesn't leverage the full `PerformanceSegment` structure.

## Technical Goals

### 1. Asynchronous Aggregation (The Brain)

- Move the analysis of "Weak Measures" and "Hotspots" into `AiWorker.ts`.
- Instead of simple heuristics, the worker should look at intervals, targeting of chord tones (3rds/7ths), and rhythmic consistency if available.
- The UI should trigger `localAgent.analyzePracticeSession(segment)` which handles the worker hop.

### 2. Structured Prompting (Pedagogical Depth)

- Refine the `generatePrompt` in the worker to include more "Jazz Pedagogy" context.
- Target REQ-FB-07: AI output should be JSON-like or clearly structured to allow UI highlights (e.g. "Focus on Bar 12").

### 3. Interactive Teacher UI

- The `PracticeReportModal` should be more than a static text box.
- It should allow clicking on a "Weak Measure" mentioned in the critique to highlight it on the chart (future integration).
- Persistence: Storing these segments for historical analysis (REQ-MT-02).

## Open Questions

- **Worklet -> Worker hop**: How to efficiently move the high-frequency pitch data into the `PerformanceSegment` without flooding the main thread? (Already addressed in Phase 23 by using AiWorker).
- **Nano Constraints**: How to keep the context window small while providing deep analysis? (Answer: Use `PerformanceSegment` summary instead of raw samples).
