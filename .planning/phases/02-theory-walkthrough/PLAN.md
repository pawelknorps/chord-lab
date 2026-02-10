# Phase 2: The Methodical Walkthrough (The "Teaching Machine")

## Goal
Transform the raw `AnalysisResult` into an interactive, step-by-step narrative that guides the student through the song's harmonic structure. This creates the "Teaching Machine" experience where the user is *shown* why the song works, rather than just seeing a chart.

## Implementation Steps

### Step 1: The Narrative Engine (State & Logic)
**Target**: `src/core/theory/WalkthroughEngine.ts`
- **Action**: Create a service that converts `AnalysisResult` into a linear list of `WalkthroughStep` objects.
- **Logic**:
    1.  **Intro Step**: "This song is in {Key}. It has {BarCount} bars." based on `JazzStandard` metadata.
    2.  **Structural Steps**: Iterate through detected `MajorII-V-I` and `MinorII-V-i` patterns. Group contiguous ones if possible.
    3.  **Color Steps**: Iterate through `SecondaryDominant` and `TritoneSubstitution` events.
    4.  **Outro Step**: "Now let's practice the whole form."
- **Output**: `WalkthroughSession` object containing the steps and current index.

### Step 2: The Walkthrough UI Component
**Target**: `src/modules/JazzKiller/components/TheoryWalkthrough/WalkthroughPanel.tsx`
- **Action**: Create a new panel that replaces or sits alongside the `PracticeTips`.
- **UI Elements**:
    - **Step Counter**: "Step 3 of 12"
    - **Narrative Text**: "Here we see a classic ii-V-I in F Major, leading us to the IV chord."
    - **Navigation**: Prev/Next buttons.
    - **Focus Controls**: "Loop This Section" button (sets loop points in `useJazzPlayback`).

### Step 3: Concept Cards (The "Why")
**Target**: `src/modules/JazzKiller/components/TheoryWalkthrough/ConceptCard.tsx`
- **Action**: A reusable card to display specific theoretical concepts.
- **Props**: `concept: Concept`, `explanation: string`.
- **Content**: Roman Numerals (e.g., `V7/ii`), Chord Symbols (`A7`), and a brief text explanation of the function.

### Step 4: Interactive Chart Integration
**Target**: `src/modules/JazzKiller/components/LeadSheet.tsx`
- **Action**: Highlighting support for the *current walkthrough step*.
- **Logic**: When the walkthrough is active, dim the rest of the chart and highlight only the bars relevant to the current step.

### Step 5: "Lesson Mode" Toggle
**Target**: `src/modules/JazzKiller/JazzKillerModule.tsx`
- **Action**: Add a "Start Lesson" button that initializes the `WalkthroughEngine` and opens the `WalkthroughPanel`.

## Outcome
A user can load "Autumn Leaves", click "Start Lesson", and be guided:
1.  "Welcome to Autumn Leaves. Key of Gm."
2.  "The A Section starts with a ii-V-I in Bb Major (the relative major)." [Chart highlights bars 1-4]
3.  "Then it moves to a ii-V-i in G Minor." [Chart highlights bars 5-8]
4.  user clicks "Loop This" to practice just those 4 bars.
