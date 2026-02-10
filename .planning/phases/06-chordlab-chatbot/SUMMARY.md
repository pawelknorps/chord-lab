# Phase 6 – Chord Lab Progression Chatbot: Summary

## Goal (from ROADMAP)
Local AI in Chord Lab as a chatbot that answers questions about progressions, suggests continuations/alternatives, and explains.

## What Was Done

### Wave 1: Progression context and prompt layer
- **Task 1.1**: Added `src/core/services/progressionContext.ts` with `buildProgressionBundle(chordSymbols, key, scale)` – compact markdown (Key, Scale, Chords, RN, optional Concepts) using RomanNumeralAnalyzer and ConceptAnalyzer.
- **Task 1.2**: `buildChordLabPrompt(bundle, userMessage, history?)` – builds full prompt with Chord Lab persona hint, current progression, optional last 2 Q&A pairs, and user message for `localAgent.ask()`.
- **Task 1.3**: `stripCommandTokens(text)` – strips `[[DRILL:...]]`, `[[SET:...]]`, `[[UI:...]]` from AI responses so they are not shown in Chord Lab chat.

### Wave 2: Chatbot UI and integration
- **Task 2.1**: Chord Lab SmartLessonPane now has chat state (`chatMessages`, `chatInput`, `isChatThinking`) and a **Progression Assistant** section: scrollable message list, text input, send button. Hint: "Ask about this progression, request continuations or substitutes, or get explanations."
- **Task 2.2**: On send: build bundle from `progressionChords`, `key`, `scale`; build prompt with `buildChordLabPrompt`; call `localAgent.ask(prompt)`; strip commands; append user and assistant messages. Added optional `scale` prop to SmartLessonPane; ChordLab passes `selectedScale`.
- **Task 2.3**: Loading state ("Thinking...") while agent responds; on error, assistant message shows friendly error. Copy and accessibility in place.

## Commits
- `f0601f1`: feat(Chord Lab): progression context and prompt layer (Phase 6 Wave 1) – `progressionContext.ts`
- `48c7866`: feat(Chord Lab): Progression Chat UI and LocalAgentService wiring (Phase 6 Wave 2) – SmartLessonPane.tsx, ChordLab.tsx

## Verification
- Progression bundle: key, chords, RN, concepts (when present).
- Prompt includes bundle and user message; optional history for multi-turn.
- Chat: messages list, input, send; loading and error handling; no raw `[[...]]` in bubbles.
- Q&A, continuations, alternatives supported via natural language in the chat.

## Files Touched
- **New**: `src/core/services/progressionContext.ts`
- **Modified**: `src/modules/ChordLab/components/SmartLessonPane.tsx`, `src/modules/ChordLab/ChordLab.tsx`

## Later integration (Phase 4)
- Chord Lab Progression Assistant chat responses now pass through `validateSuggestedNotes` (Tonal.js validator) so out-of-scale note suggestions are sanitized before display.
