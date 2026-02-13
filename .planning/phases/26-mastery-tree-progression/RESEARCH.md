# Research: Phase 26 - Mastery Tree & Long-term Progression

## Current State Analysis

### 1. Mastery Tree Store (`useMasteryTreeStore.ts`)

- **Persistence**: Uses `zustand/middleware/persist` with name `itm-mastery-tree`.
- **Logic**: Handles `addNodeXP`, `unlockNode`, and cascading unlock logic (children unlock only if all parents are mastered).
- **Schema**: Nodes have `id`, `label`, `description`, `parentIds`, `requiredPoints`, `unlockStatus`, `category`, and `standards`.

### 2. Curriculum Analysis Service (`CurriculumAnalysisService.ts`)

- **Mapping**: Maps `ConceptType` (MajorII-V-I, etc.) to Mastery Tree Node IDs.
- **XP Calculation**: Uses `heatmap` and `detectedPatterns` to calculate XP contributions.
- **Status**: Functional but can be expanded to use more granular data from `PerformanceSegment` (like pitch dev).

### 3. Missing Infrastructure

- **Session History**: We have no store for saving individual `PerformanceSegment` objects. This is critical for REQ-MT-02 (Show progress over time).
- **Visuals**: No tree or graph visualization component exists.
- **Integration**: The connection between `PerformanceSegment` and `MasteryTree` is currently indirect through the `PracticeReportModal`.

## Implementation Strategy

### 1. Wave 1: Session Persistence

- Implement `useSessionHistoryStore` to store the last ~50 `PerformanceSegment` objects.
- This will allow the AI to "remember" previous sessions during analysis.

### 2. Wave 2: XP & Unlock refinement

- Update `CurriculumAnalysisService` to provide more nuanced XP based on the detailed `accuracyScore` in each measure of the `PerformanceSegment`.
- Ensure that "Roots", "Guide Tones", and "Arpeggios" results impact the Mastery Tree specifically.

### 3. Wave 3: Mastery Tree UI

- Create a visual tree using `framer-motion` and `lucide-react`.
- Design: A vertical or horizontal tree layout with "locked", "unlocked", and "mastered" states.
- Modal detailing each node's requirements and associated standards.

## Open Questions

- **Persistence Limit**: Should we use IndexedDB for larger session histories (transcriptions)? For now, LocalStorage (via the store) with a 50-session cap is enough.
- **Graph Layout**: Should the tree be interactive? (Yes, clicking a node should show relevant exercises/standards).
