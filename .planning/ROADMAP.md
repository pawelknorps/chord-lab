# Roadmap: Jazz Education Expansion

## Phase 1: Foundation & Analysis Engine
**Goal**: Build the brain that understands jazz concepts in the existing data.
- **Step 1**: Create `ConceptAnalyzer` service in `src/core/theory`.
    - Implement detectors for ii-V-I (Major/Minor).
    - Implement detectors for Secondary Dominants.
- **Step 2**: Integrate `ConceptAnalyzer` with the `JazzKiller` (Standards) module.
- **Step 3**: Define data structures for `AnalysisResult` that map ranges of bars to concepts.

## Phase 2: Visualization (Concept Highlighting)
**Goal**: Show the analysis on the screen.
- **Step 1**: Refactor `JazzKiller` chart renderer to support "Layers" or "Overlays".
- **Step 2**: Implement visual brackets/highlights for the `AnalysisResult` ranges.
- **Step 3**: Create `AnalysisToolbar` to toggle specific concept layers.

## Phase 3: The Learn Panel (Interactive Education)
**Goal**: Explain the concepts to the user.
- **Step 1**: Create `LearnPanel` component shell (Slide-over or resizing sidebar).
- **Step 2**: Create a content registry (Markdown or JSON) with definitions for "ii-V-I", "Secondary Dominant", etc.
- **Step 3**: Implement "Click-to-Inspect": Clicking a highlight updates the `LearnPanel` state.

## Phase 4: Guided Practice Routines
**Goal**: Walk the user through performing the song.
- **Step 1**: Create `PracticeSession` store/state machine (Idle -> Active -> Finished).
- **Step 2**: Implement `PracticeOverlay`: A focused view showing only the current target (e.g., "Play Root for Cm7").
- **Step 3**: Build the "Shells" and "Basslines" routines using the analyzer data (extracting roots/3rds/7ths).
