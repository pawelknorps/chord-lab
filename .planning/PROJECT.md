# Project Milestone: The Incredible Teaching Machine (AI-Powered Jazz Mentor)

## Vision Statement
To transform the Chord-Lab from a practice tool into an intelligent, proactive jazz mentor. By leveraging a hybrid **Local-First AI** and **Ahead-of-Time (AOT)** architecture, we will deliver personalized, deep harmonic analysis and interactive guidance without incurring real-time API costs. The goal is to democratize high-level jazz education using the browser's built-in capabilities (Gemini Nano) and pre-computed intelligence.

## Core Value Proposition
- **Zero-Cost Intelligence**: No per-token fees for the user or developer. Uses `window.ai` (local Gemini Nano) or pre-baked JSON lessons.
- **Deep Harmonic Context**: "Agents" that understand voice leading, avoid notes, and common improv traps, not just chord symbols.
- **Interactive Pedagogy**: The Agent allows tailored practice routines (Spotlight Drills, Blindfold Challenges) that manipulate the app's state.
- **Instant Availability**: "Pre-baked" lessons for 1,300+ standards ensure immediate, high-quality analysis even without a powerful local GPU.

## Key Targets
1. **AOT Lesson Vault**: A Node.js pipeline to pre-generate "Pro-Level" analysis for all 1,300 standards using high-end LLMs (Claude 3.5/Gemini 1.5 Pro).
2. **Local Agent Interface**: A `window.ai` integration to provide real-time, context-aware advice ("Bridge Theory") directly in the browser.
3. **Smart Lesson Player**: A UI that fetches and displays the "Harmonic Roadmap" (hooks, traps, analysis) seamlessly.
4. **Agent-Driven UX**: The ability for the Agent to control the app (looping sections, muting tracks, hiding chords).

## Architectural Decisions
- **Hybrid AI Strategy**:
    - **Tier 1 (Instant/Low-End)**: Fetch statically generated `public/lessons/{id}.json`.
    - **Tier 2 (High-End/Future)**: Use `window.ai` for conversational, ad-hoc coaching.
- **Data persistence**: `IndexedDB` (via `dexie.js`) for storing user progress and interaction history.
- **Deployment**: Static export (Vercel) with efficient data compression (Brotli/Gzip) for the JSON vault.

## Out of Scope
- Real-time cloud LLM API calls (unless user provides own key, but focus is on free/local).
- Social features or backend user accounts (Local-First philosophy).

