---
phase: 1
name: The Feedback Engine
waves:
  - name: Infrastructure & Scoring Logic
    description: Connecting CRM (Continuous Real-time Microphones) to Scoring State.
  - name: Heatmap Visualization
    description: Visual feedback on performance quality per measure.
  - name: Guided Practice Engine
    description: Routine management and automated practice stages.
  - name: AI Performance Critique
    description: Gemini Nano analysis of student accuracy.
---

# Phase 1: The Feedback Engine

## Goals
Turn the app into an active listener that provides real-time scoring and periodic AI-driven feedback.

## Wave 1: Infrastructure & Scoring Logic
In this wave, we bridge `useAuralMirror` (microphone) to `useScoringStore`.

<task id="FB-STORE-SYNC" status="todo">
Implement a scoring bridge in `JazzKillerModule` or a dedicated hook.
- Listen to `midi` from `useAuralMirror`.
- Call `useScoringStore.processNote(midi, currentChord, currentMeasureIndex)`.
- Ensure this only happens during playback and when scoring is active.
</task>

<task id="FB-SESSION-UPGRADE" status="todo">
Upgrade `useScoringStore` to handle session management.
- Add `currentSessionId` or similar to group notes.
- Track "Perfect Notes" vs "Diatonic Notes" vs "Wrong Notes".
</task>

## Wave 2: Heatmap Visualization
Show the student where they are succeeding on the lead sheet.

<task id="FB-HEATMAP-UI" status="todo">
Create `PerformanceHeatmapOverlay.tsx`.
- Maps `heatmap` data from `useScoringStore` to measure coordinates.
- Colors: Green (High accuracy), Amber (Mixed), Red (Struggling).
- Integrate into `LeadSheet.tsx`.
</task>

## Wave 3: Guided Practice Engine
The "Incredible Teaching Machine" starts here with structured routines.

<task id="FB-GUIDED-ENGINE" status="todo">
Create `GuidedPracticeStore.ts` and `GuidedPracticePane.tsx`.
- Track routine stages: 
  1. **Scaling** (5m): Focus on hitting all scale tones.
  2. **Guide Tones** (5m): Focus on 3rds and 7ths.
  3. **Soloing** (5m): Free play with focus on accuracy.
- Implement a countdown timer for each stage.
</task>

<task id="FB-GUIDED-UI" status="todo">
Implement the UI for Guided Practice.
- Visual progress bar for the 15-minute routine.
- Voice-overs or text-to-speech cues (optional/text labels primarily) for stage transitions.
</task>

## Wave 4: AI Performance Critique
Close the loop with AI feedback.

<task id="FB-NANO-CRITIQUE" status="todo">
Add `generatePerformanceCritique` to `jazzTeacherLogic.ts`.
- Input: Session accuracy, heatmap data, hotspots.
- Prompt Nano to provide a "sandwich" feedback (Strengths - Weaknesses - Next Steps).
</task>

<task id="FB-REPORT-UI" status="todo">
Create a "Practice Session Summary" modal/panel.
- Shows total score, grade (S to F), and the AI critique.
- Triggered automatically after a guided session or manually.
</task>

## Verification
- [ ] Playing a C on a Cmaj7 chord during scoring increases the accuracy score.
- [ ] Measure backgrounds change color based on successful note attacks.
- [ ] The 15-minute routine timer correctly triggers state changes.
- [ ] Post-practice report shows a coherent analysis from Gemini Nano (e.g., "You nailed the ii-Vs but missed the bridge resolution").
