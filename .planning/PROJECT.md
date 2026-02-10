# Project: Semantic AI Mentor (Theory-Augmented Local AI)

## Vision Statement

Evolve the AI integration from a generic text generator into a **local-first Music Theory specialist** used across the app: in **JazzKiller** for song-focused pedagogy and proactive advice, and in **Chord Lab** as a **progression chatbot** that answers questions, suggests continuations/alternatives, and explains harmony. By pre-processing context into structured "Theory Bundles" (or progression summaries) before prompting, Gemini Nano delivers deep, context-aware insights without cloud cost.

## Core Value Proposition

- **High Semantic Density**: Custom Markdown-based "Theory Language" for harmonic maps with minimal token usage.
- **Proactive Pedagogy (JazzKiller)**: AI speaks when the student hits difficult sections (Pivot Points, Secondary Dominants); "Get AI lesson" can drive the app via commands like `[[DRILL:SPOTLIGHT]]`.
- **Chord Lab Chatbot**: Local AI in Chord Lab that:
  - **Answers questions** about the current progression (e.g. "Why does this work?", "What scale over the G7?").
  - **Suggests continuations and alternatives** (e.g. "What could follow this?", "Give me a ii–V in Ab").
  - **Explains** function, voice leading, and common patterns in short, actionable form.
- **Command-Driven UI**: Parse and execute `[[DRILL:...]]`, `[[SET:...]]` so the AI can trigger loops, BPM, key, and drill modes—especially in Practice Studio where "Get AI lesson" currently shows commands as raw text.

## High-Level Requirements

### JazzKiller (existing + drill actions)
- **Augmented Prompting**: AiContextService converts chord progressions into annotated analysis (functional labels, guide tones, tension).
- **Focus-Aware Context**: AI adapts to Lead Sheet vs Drill view.
- **Practice Studio – AI commands**: When "Get AI lesson" returns text containing `[[DRILL:SPOTLIGHT]]` (or `[[SET:BPM:120]]`, etc.), **parse, execute, and strip** so the user sees only the lesson and the app performs the action (e.g. start loop, set BPM). *See milestone: `.planning/milestones/ai-drill-actions/`.*

### Chord Lab (new)
- **Progression context for AI**: Provide the current Chord Lab progression (chord symbols, key, scale, optional Roman numerals) to the local model in a compact format.
- **Chatbot UI**: A conversational panel (sidebar or inline) where the user can ask questions and get answers about the current progression, request continuations/alternatives, or explanations.
- **Local-only**: Same stack as JazzKiller—Gemini Nano / LocalAgentService; no cloud LLM for v1.

## Key Decisions

| Decision | Rationale | Status |
| :--- | :--- | :--- |
| **Data Format** | "Semantic Markdown" (annotated lists) for best token efficiency with Gemini Nano. | [Decided] |
| **Interaction** | JazzKiller: Hybrid (Proactive + Reactive sidebar). Chord Lab: Reactive chatbot focused on progression Q&A and suggestions. | [Decided] |
| **Local-First** | Strictly Gemini Nano to keep zero-cost and low latency. | [Decided] |
| **Drill commands** | Parse/execute in Practice Studio; shared grammar with SmartLessonPane where applicable. | [Decided] |
| **Chord Lab context** | Reuse theory core (Roman numerals, scales, chord tones) and a small "progression bundle" formatter for Chord Lab–specific prompts. | [Decided] |

## Out of Scope

- Cloud-based LLM calls (OpenAI/Anthropic) for this milestone.
- Multi-user "Learning Memory" sync.
- Real-time audio/MIDI analysis in Chord Lab for v1.
