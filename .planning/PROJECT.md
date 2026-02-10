# Project Milestone: Semantic AI Mentor (Theory-Augmented Gemini Nano)

## Vision Statement
To evolve the AI integration from a generic text generator into a **local-first Music Theory specialist**. By pre-processing songs into structured "Theory Bundles" before prompting, we empower Gemini Nano to offer deep, context-aware pedagogical insights that were previously only possible with large cloud models.

## Core Value Proposition
- **High Semantic Density**: Using a custom Markdown-based "Theory Language" to feed the AI complex harmonic maps with minimal token usage.
- **Proactive Pedagogy**: The AI "speaks" when the student enters a difficult section (Pivot Points, Secondary Dominants).
- **Interactive Refinement**: A "Deep Search" mode for AI where the user can drill down into specific measures for tailored advice.

## High-Level Requirements
- **Augmented Prompting**: A service that converts raw chord progressions into annotated analysis (Functional labels, Guide Tones, Tension scores).
- **Focus-Aware Context**: The AI adapts its window based on whether the user is viewing the Lead Sheet (overview) or a Drill (precision).
- **Command-Driven UI**: Extension of the current `[[COMMAND]]` system to allow more granular app control.

## Key Decisions
| Decision | Rationale | Status |
| :--- | :--- | :--- |
| **Data Format** | "Semantic Markdown" (annotated lists) for best token efficiency with Gemini Nano. | [Decided] |
| **Interaction** | Hybrid (Proactive triggers + Reactive sidebar). | [Decided] |
| **Local-First** | Strictly Gemini Nano to maintain zero-cost/low-latency. | [Decided] |

## Out of Scope
- Cloud-based LLM calls (OpenAI/Anthropic).
- Multi-user "Learning Memory" sync.
