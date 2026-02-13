# Milestone: JJazzLab Playback Research → JazzKiller Enhancement

## Vision

Use JJazzLab (legacy Java app in `legacy_projects/JJazzLab-master`) as a **design and behavior reference** to improve Chord Lab’s JazzKiller playback: rhythm, harmony, and style (swing, bossa, waltz, etc.) without porting Java or binary formats. Borrow **concepts, algorithms, and feature set** and implement them in our TypeScript/Tone.js stack.

## Core Value

- **Richer style palette**: Named styles (Medium Swing, Bossa, Jazz Waltz, Ballad) that drive bass, drums, and comping in a coherent way.
- **Tighter swing and feel**: Validate and align our tempo–swing correlation and humanization with proven behavior (JJazzLab’s swing ratio and shared bass/drums pipeline).
- **Bass variety**: Two-feel and optional double-time walking alongside current walking bass.
- **Drum variety**: Brushes, intro/ending, and later bossa/waltz patterns, so playback is less “one size fits all.”

## High-Level Requirements (Active)

- Research JJazzLab’s rhythm database, JJSwing (swing), YamJJazz (multi-style), bass/drums generation, and swing/tempo handling.
- Document what to borrow in RESEARCH.md (done).
- Define v1 requirements (style registry, swing validation, two-feel, drum feels, optional Bossa/Waltz) in REQUIREMENTS.md.
- Roadmap and state tracked in ROADMAP.md and STATE.md.

## Out of Scope (This Milestone)

- Porting JJazzLab Java code or reading YJZ/SST files.
- Replacing our algorithmic bass/drums with pre-recorded phrase databases (Wbp/Dp).
- Implementing every YamJJazz style; focus on Swing, Bossa, Waltz, and “place in cycle” (intro/ending).

## Key Decisions

| Decision | Option chosen | Rationale |
|----------|----------------|-----------|
| Style source | Code-defined style registry | No file-based rhythm DB; keep deployment simple. |
| Bass/drums | Algorithmic + optional motifs | Match current architecture; phrase DBs deferred. |
| Swing/tempo | Align with JJazzLab numbers, single pipeline | One swing + humanization for bass and drums. |
| Scope | Swing + two-feel + drum feels first; Bossa/Waltz next | Incremental delivery; research informs order. |
