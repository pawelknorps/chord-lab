# Phase 26 Plan: Mastery Tree & Long-term Progression 🌳

Focus: Implement the persistent storage for performance segments and the visual Mastery Tree. Connect individual practice sessions to a long-term progress map.

## Wave 1: Session History & Persistence

Implement a repository to store `PerformanceSegment` objects for historical analysis and AI memory.

- [ ] **Task 1: Implement Session History Store**
  - Create `src/core/store/useSessionHistoryStore.ts` using Zustand `persist`.
  - Add `addSession` action that appends a `PerformanceSegment` and caps the array at 50 items.
  - Files: `src/core/store/useSessionHistoryStore.ts`

- [ ] **Task 2: Integrated Session Saving**
  - Update `PracticeReportModal.tsx` to call `sessionHistoryStore.addSession` when the session is summarized.
  - Ensure the segment is built and saved correctly.
  - Files: `src/modules/JazzKiller/components/PracticeReportModal.tsx`

## Wave 2: Mastery XP Refinement

Refine the XP calculation logic to be more granular and better aligned with the Mastery Tree.

- [ ] **Task 3: Enhance Curriculum Analysis**
  - Update `CurriculumAnalysisService.ts` to use `PerformanceSegment` data directly.
  - Add specific XP logic for "Roots", "Guide Tones", and "Arpeggios" levels.
  - Files: `src/core/theory/CurriculumAnalysisService.ts`

- [ ] **Task 4: Cascading Unlock Verification**
  - Verify that the `useMasteryTreeStore` correctly unlocks children when a parent node reaches its XP limit.
  - Test the logic with a simulated performance.
  - Files: `src/core/store/useMasteryTreeStore.ts`

## Wave 3: Progress Map UI

Create the visual Mastery Tree to show the user's journey and allow navigation to specific standards.

- [ ] **Task 5: Implement MasteryNode Component**
  - Create a reusable component for tree nodes (locked/unlocked/mastered states).
  - Use `framer-motion` for smooth hover and entrance animations.
  - Files: `src/modules/ITM/components/MasteryNode.tsx`

- [ ] **Task 6: Build Mastery Tree View**
  - Create `src/modules/ITM/components/MasteryTreeView.tsx`.
  - Implement a logical tree layout for the initial 10 nodes.
  - Add a "Details Modal" when clicking a node to show standards and XP progress.
  - Files: `src/modules/ITM/components/MasteryTreeView.tsx`

- [ ] **Task 7: Dashboard Integration**
  - Add the Mastery Tree to the ITM dashboard or a dedicated "Progress" tab.
  - Files: `src/modules/ITM/ITMDashboard.tsx` (or equivalent)

## Verification Criteria

- [ ] Performance segments are persisted and visible in DevTools LocalStorage.
- [ ] XP reached on a "Foundations" node correctly unlocks "The Blues" or "Major ii-V-I".
- [ ] The Mastery Tree visually represents the current state of the `useMasteryTreeStore`.
- [ ] Clicking a node shows associated standards and remaining XP.
