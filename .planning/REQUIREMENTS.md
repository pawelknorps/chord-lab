# Requirements: Codebase Health & Scalability

### v1 Milestone: The Pre-Baked Intelligence (AOT)

#### AI Pipeline (AOT)
- **REQ-AI-01**: Create a Node.js script `scripts/generate-lessons.js` to iterate through all 1,300 standards.
- **REQ-AI-02**: Implement LLM prompting logic (using temporary API key) to analyze each song:
    - Identify ii-V-I hotspots.
    - Suggest "Avoid Notes".
    - Provide "Pro-Level" substitutions.
    - Generate "Golden Lick" (ABC/MIDI).
- **REQ-AI-03**: Output valid JSON files to `public/lessons/{songId}.json` (target ~10MB total compressed).

#### Lesson Player UI
- **REQ-UI-01**: Create a `SmartLessonPane` component in `ChordLab` to display the specific lesson data.
- **REQ-UI-02**: Implement "Harmonic Roadmap" visualization (highlighting analysis on the timeline).
- **REQ-UI-03**: Interactive "Spotlight Drill": Button to auto-loop specific sections (e.g., "Practice the Turnaround").

#### Performance
- **REQ-PERF-01**: Use dynamic imports (`await import(...)`) for fetching lesson JSONs to avoid bundling them.
- **REQ-PERF-02**: Ensure Gzip/Brotli compression is active for `.json` assets in Vercel config.

### v1.5 Milestone: The Local Agent (Window AI)

#### Browser Integration
- **REQ-AGENT-01**: Implement `window.ai` capability check (`canCreateTextSession`).
- **REQ-AGENT-02**: Create `LocalAgentService` to abstract the `window.ai` interaction.
- **REQ-AGENT-03**: Fallback strategy: If `window.ai` is unavailable, rely solely on AOT JSONs.

#### Interactive Drills
- **REQ-DRILL-01**: "Blindfold Challenge": Agent can hide chord symbols for specific sections.
- **REQ-DRILL-02**: "Variable Accompaniment": Agent can mute specific tracks (piano/bass) to force ear training.


## v1.1 Milestone: Chord Lab UX Refinement

- **REQ-CL-01**: Toggles for hide/show Piano & Fretboard in Chord Lab.
- **REQ-CL-02**: Legato Visuals in Chord Lab (visuals persist until next chord).
- **REQ-CL-03**: Persist visualization preferences in global settings.
- **REQ-CL-04**: Guided Practice Mode - Visuals synced to progression slots rather than raw audio triggers for maximum clarity.
- **REQ-CL-05**: Color-coded chord tone visualization (Root=Blue, 3rd=Green, 5th=Yellow, 7th=Red, Extensions=Purple).
- **REQ-CL-06**: Interactive Chord Builder - Click piano keys/frets to build custom chords and add to progression.
- **REQ-CL-07**: Chord tone labels on all keys/frets showing their function (R, 3, 5, 7, 9, 11, 13).

## v2 / Deferred

- **REQ-EXT-01**: Full E2E regression suite using Vitest + Playwright.
- **REQ-EXT-02**: Dynamic Plugin Routing (loading modules from dedicated JSON manifests).

## Out of Scope

- Redesigning the core navigation dashboard.
- Modifying the iReal Pro parsing logic.
