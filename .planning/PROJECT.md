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

## Gemini Nano Architecture (Stateless Logic + Prompt Hardening)

To handle Nano’s limited context and tendency to "hallucinate" logic, the AI is treated as a **Stateless Logic Function**, not a long-form conversational agent.

### 1. State-to-Prompt Mapping
- **Do not** ask Nano to "remember" the song. Every call receives the minimum necessary state as a fresh payload.
- **Workflow**: (1) **State slice**: current 4 bars + next 4 bars from Zustand. (2) **Theory grounding**: Tonal.js for intervals, key centers, scale degrees. (3) **Injection**: pass that "ground truth" JSON into the prompt.

### 2. Atomic Prompt Pattern
Use a structured template so the model follows a fixed chain (CONTEXT → TASK → CONSTRAINTS → RESPONSE). Example:
- **CONTEXT**: SONG, KEY, CURRENT CHORD, SCALE DEGREES (from Tonal.js).
- **TASK**: "As a jazz tutor, analyze this specific chord in context."
- **CONSTRAINTS**: e.g. "Answer in 2 short sentences; focus on transition to next chord; use provided SCALE DEGREES only."
- **RESPONSE**: (model fills).

### 3. Few-Shot Prompting
Include 2–3 "perfect response" examples in the system prompt or at the start of the message so Nano mimics format and accuracy (e.g. "Input: Dm7 in C Major → Teacher: This is the ii chord. Aim for F (minor 3rd) to lead into B (3rd of G7).").

### 4. Chain-of-Thought (CoT) for Complex Progressions
For multi-step reasoning, instruct step-by-step: "First, identify the Roman numeral. Second, identify the target note of the resolution. Third, suggest a lick." CoT reduces hallucination and improves theory accuracy.

### 5. Technical Guardrails (2026 / window.ai)
- **temperature**: `0.2` for theory (reduce creative hallucinations).
- **topK**: `3` so the model picks among the most probable (accurate) tokens.
- **Session reset**: Call `session.destroy()` periodically; fresh sessions avoid context drift. Prefer one-shot prompts with full context over long-lived sessions.

### 6. Validator Pattern
Nano can still suggest wrong notes. Use **Tonal.js as validator**: if the model suggests a note (e.g. "Play C#") that Tonal.js says is not in the current scale/chord, do **not** display that suggestion. Code provides the truth; AI provides the flavor.

## Key Decisions

| Decision | Rationale | Status |
| :--- | :--- | :--- |
| **Data Format** | "Semantic Markdown" (annotated lists) for best token efficiency with Gemini Nano. | [Decided] |
| **Interaction** | JazzKiller: Hybrid (Proactive + Reactive sidebar). Chord Lab: Reactive chatbot focused on progression Q&A and suggestions. | [Decided] |
| **Local-First** | Strictly Gemini Nano to keep zero-cost and low latency. | [Decided] |
| **Drill commands** | Parse/execute in Practice Studio; shared grammar with SmartLessonPane where applicable. | [Decided] |
| **Chord Lab context** | Reuse theory core (Roman numerals, scales, chord tones) and a small "progression bundle" formatter for Chord Lab–specific prompts. | [Decided] |
| **Stateless AI** | Every Nano call gets fresh state slice (e.g. 4+4 bars) and theory grounding; no reliance on conversation history for correctness. | [Decided] |
| **Validator** | Tonal.js validates AI-suggested notes; suggestions outside scale/chord are not shown. | [Decided] |

## Out of Scope

- Cloud-based LLM calls (OpenAI/Anthropic) for this milestone.
- Multi-user "Learning Memory" sync.
- Real-time audio/MIDI analysis in Chord Lab for v1.
