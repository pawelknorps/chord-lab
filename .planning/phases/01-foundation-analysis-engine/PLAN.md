---
name: "Phase 1: Foundation & Analysis Engine"
description: "Implement the core logic for detecting jazz concepts (ii-V-I, Secondary Dominants) in chord progressions."
---

# Phase 1 Plan: Foundation & Analysis Engine

This phase focuses on building the `ConceptAnalyzer`, a pure logic service that can take a sequence of chords (from iReal Pro or MIDI) and identify higher-level theoretical structures.

## Objectives
1.  Establish the `ConceptAnalyzer` service structure.
2.  Implement detection logic for **Major ii-V-I** progressions.
3.  Implement detection logic for **Minor ii-V-i** progressions.
4.  Implement detection logic for **Secondary Dominants**.
5.  Integrate this analyzer into the `JazzKiller` (Standards) module to analyze loaded songs.

## Tasks

<task>
    <id>1.1</id>
    <title>Scaffold ConceptAnalyzer Service</title>
    <file_paths>
        <path>src/core/theory/ConceptAnalyzer.ts</path>
        <path>src/core/theory/AnalysisTypes.ts</path>
    </file_paths>
    <description>
        Create the core types and service class.
        - Define `AnalysisResult` interface: `{ concepts: Concept[] }`.
        - Define `Concept` interface with `type`, `range` (start/end indices), and `metadata`.
        - Create `ConceptAnalyzer` class with a `analyze(chords: string[])` method.
    </description>
</task>

<task>
    <id>1.2</id>
    <title>Implement Major ii-V-I Detection</title>
    <file_paths>
        <path>src/core/theory/ConceptAnalyzer.ts</path>
        <path>src/core/theory/ConceptAnalyzer.test.ts</path>
    </file_paths>
    <description>
        Add logic to detect Major ii-V-I sequences.
        - Iterate through chords.
        - Check for root movement: iim7 -> V7 -> Imaj7 (relative).
        - Use `tonal` for interval calculation.
        - Return `Concept` objects for matches.
        - Add unit tests for key progressions (e.g., Dm7-G7-Cmaj7).
    </description>
</task>

<task>
    <id>1.3</id>
    <title>Implement Minor ii-V-i Detection</title>
    <file_paths>
        <path>src/core/theory/ConceptAnalyzer.ts</path>
        <path>src/core/theory/ConceptAnalyzer.test.ts</path>
    </file_paths>
    <description>
        Add logic to detect Minor ii-V-i sequences.
        - Check for: iim7b5 -> V7(alt) -> im7/im6/imMaj7.
        - Add unit tests for minor progressions (e.g., Dm7b5-G7alt-Cm7).
    </description>
</task>

<task>
    <id>1.4</id>
    <title>Implement Secondary Dominant Detection</title>
    <file_paths>
        <path>src/core/theory/ConceptAnalyzer.ts</path>
        <path>src/core/theory/ConceptAnalyzer.test.ts</path>
    </file_paths>
    <description>
        Add logic for Secondary Dominants (V of X).
        - Identify dominant 7th chords that are NOT the primary V7.
        - Check if they resolve correctly a perfect 4th up (or 5th down).
        - Label as `SecondaryDominant` with target (e.g., "V/ii").
    </description>
</task>

<task>
    <id>1.5</id>
    <title>Integrate with JazzKiller Store</title>
    <file_paths>
        <path>src/modules/JazzKiller/store/useJazzStore.ts</path>
        <path>src/modules/JazzKiller/components/StandardView.tsx</path>
    </file_paths>
    <description>
        Connect the analyzer to the UI state.
        - Update `useJazzStore` to run `ConceptAnalyzer.analyze` whenever a standard is loaded.
        - Store the `AnalysisResult` in the store.
        - (Temporary) Log analysis results to console in `StandardView` to verify integration.
    </description>
</task>

## Verification
- Run `npm test src/core/theory/ConceptAnalyzer.test.ts` to ensure all detection logic passes.
- Load "Autumn Leaves" in the app and verify in console that:
    - ii-V-Is in Bb Major (Cm7-F7-Bbmaj7) are detected.
    - ii-V-is in G Minor (Am7b5-D7-Gm) are detected.
