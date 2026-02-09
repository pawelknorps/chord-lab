# Project Vision: Chord Lab - Jazz & Education Expansion

## Vision Statement
To transform Chord Lab from a set of isolated tools into a cohesive **Jazz Education Platform** that not only analyzes music but teaches users *how* to understand and play it through interactive concept highlighting and guided practice routines.

## Core Value Proposition
- **Contextual Learning**: Users learn theory (e.g., "tritone substitution") by seeing it highlighted in the actual songs they are studying, rather than in abstract isolation.
- **Guided Mastery**: Instead of open-ended exploration, "Guided Practice" provides structured routines (e.g., "First, play the basslines") to build skills progressively.
- **Interactive Theory**: "Learn Panels" offer just-in-time theoretical explanations relevant to the current musical context.

## High-Level Requirements

### 1. Jazz Integration: Concept Highlighting
- **Dynamic Analysis**: The system must analyze loaded jazz standards (from iReal or MIDI) and identify theoretical concepts.
- **Visual Overlays**: Users can toggle overlays to see specific concepts (e.g., "Show all ii-V-Is", "Highlight Secondary Dominants") directly on the chord chart.
- **Click-to-Learn**: Clicking a highlighted concept opens a detail view explaining *why* it fits that category.

### 2. Educational: Learn Panels
- **Context-Aware Sidebar**: A persistent side panel that updates based on the currently selected chord, progression, or song section.
- **Content**: Explanations of harmonic function, scale choices, and voice-leading opportunities.
- **Rich Media**: diagrams and mini-examples embedded in the text.

### 3. Guided Practice Routines
- **Step-by-Step Mode**: A "Practitioner" mode that restricts the UI to focus on a single task.
- **Routine Types**:
    - **Basslines**: Play only roots/fifths.
    - **Shell Voicings**: 3rds and 7ths.
    - **Guide Tones**: Voice leading lines.
    - **Full Comping**: Rhythmic chord placement.
- **Feedback**: Visual or audio feedback on accuracy (if MIDI input is verified).

## Out of Scope (for this Milestone)
- **Gamification Mechanics**: XP, levels, and leaderboards (unless simple "complete" ticks).
- **Social Features**: Sharing progress or collaborating.
- **Advanced Improvisation AI**: Generating solos (focus is on *comping* and *understanding* first).

## Key Decisions
| Decision | Rationale |
| :--- | :--- |
| **Augment Existing Viewer** | We will enhance the existing `JazzKiller` or `ChordLab` viewer rather than building a new visualizer to save time. |
| **Static + Dynamic Analysis** | We will use `tonal` for real-time analysis but allow manual "overrides" or "curated" analyses for popular standards. |
| **Module-Based** | This work will largely happen within `JazzKiller` (renamed to `JazzLab`?) and shared educational components. |
