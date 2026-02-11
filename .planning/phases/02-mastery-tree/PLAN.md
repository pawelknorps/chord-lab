---
phase: 2
name: The Mastery Tree
waves:
  - name: Curriculum Engine
    description: Persistent storage and node-based progression logic.
  - name: Interactive Tree UI
    description: Visual node-graph explorer for the curriculum.
  - name: Progression Bridge
    description: Linking performance scores to curriculum advancement.
  - name: Content Unlock System
    description: Restricting/highlighting songs based on tree position.
---

# Phase 2: The Mastery Tree

## Goals
Transform the practice session into a permanent, gamified curriculum where students advance through 1,300+ standards by mastering specific musical concepts.

## Wave 1: Curriculum Engine
Build the underlying logic for the tree-based progression.

<task id="MT-STORE-DATA" status="todo">
Refine `useMasteryTreeStore.ts` with comprehensive initial data.
- Define at least 10 core "Foundational" nodes (Blues, ii-V-I, Rhythm Changes).
- Implement topological sorting to handle multi-parent unlocks if needed.
</task>

<task id="MT-ANALYSIS-BRIDGE" status="todo">
Create `CurriculumAnalysisService.ts`.
- Maps identified patterns (from `usePracticeStore`) to Tree Node IDs.
- E.g., if a song has 4 "Secondary Dominant" patterns, it contributes XP to the `secondary-dominants` node.
</task>

## Wave 2: Interactive Tree UI
Visualize the progression so the student knows where they are.

<task id="MT-VISUAL-GRAPH" status="todo">
Create `MasteryTreeView.tsx` using `framer-motion`.
- Render nodes as interactive circles with progress rings.
- Use SVG paths to draw connections (dependency lines) between nodes.
- Color coding: Locked (Grey), Unlocked (Purple), Mastered (Gold).
</task>

<task id="MT-NODE-MODAL" status="todo">
Create `MasteryNodeDetail.tsx` modal.
- Shows requirements, associated songs, and current XP.
- "Start Lesson" button that loads a specific song with that concept.
</task>

## Wave 3: Progression Bridge
Automatically advance the student based on their actual performance.

<task id="MT-XP-SYNC" status="todo">
Update `PracticeReportModal.tsx` to award Curriculum XP.
- When a session finishes, calculate XP based on `score` and `matchingNotesCount`.
- Dispatch XP to the relevant node in `useMasteryTreeStore`.
</task>

<task id="MT-LEVEL-UP-UI" status="todo">
Implement "Node Mastered" celebratory animation.
- Triggers when a node reaches 100% XP.
- Confetti effect and unlock sound.
</task>

## Wave 4: Content Unlock System
Contextualize the song library using the student's mastery.

<task id="MT-LIBRARY-TAGS" status="todo">
Update `JazzKillerModule` search/grid UI.
- Tag songs by their curriculum node (e.g., "🎯 Next Step" for unlocked nodes).
- Dim out songs that are too advanced (locked nodes) with a tooltip explaining why.
</task>

## Verification
- [ ] Completing a song with "Autumn Leaves" provides XP to the "ii-V-I" node.
- [ ] The Mastery Tree UI correctly draws lines from "Foundations" to "Secondary Dominants".
- [ ] Mastering a node unlocks the next tier of songs in the Library.
