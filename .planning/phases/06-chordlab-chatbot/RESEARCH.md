# Research: Phase 6 – Chord Lab Progression Chatbot

## What do we need to know to plan this phase well?

### 1. Existing Chord Lab & AI surface
- **Chord Lab** (`src/modules/ChordLab/ChordLab.tsx`) holds: `progression` (array of `ChordInfo | null`), `selectedKey`, `selectedScale`, `selectedVoicing`, `bpm`. ChordInfo has `root`, `quality`, `bass`, `midiNotes`, `notes`, `roman`, `degree`.
- **SmartLessonPane** (Chord Lab) already has "Ask Local Agent": one-shot call to `generateJazzLesson(song, 'improvisation')` with a minimal song object built from `progressionChords` and `key`. No message history; no progression-specific prompt.
- **JazzKiller** SmartLessonPane has a chat-style input (`userMessage`, `handleAskAgent(customTask)`) and parses/strips `[[DRILL:...]]` / `[[SET:...]]`. Chord Lab SmartLessonPane does not expose a free-form chat input; it only has a single "Ask Local Agent" button.

### 2. Theory and context services
- **AiContextService** (`src/core/services/AiContextService.ts`): Built for *songs* (title, key, measures, sections). `generateBundle(song, transpose)` → `SemanticBundle`; `toMarkdown(bundle)` → string. Uses ConceptAnalyzer, RomanNumeralAnalyzer, GuideToneCalculator, ChordScaleEngine. Input expects `song.music.measures` (array of { chords }).
- **Chord Lab progression** is a flat list of chords (no measure structure). We can either:
  - **Option A**: Add a static helper on AiContextService, e.g. `buildProgressionBundle(chordSymbols: string[], key: string)` that returns a compact markdown string (chords + RN + optional concepts), or
  - **Option B**: New small module `ChordLabContextService` (or `progressionContext.ts`) that reuses RomanNumeralAnalyzer, ConceptAnalyzer, ChordScaleEngine on a flat chord list and outputs a short "progression bundle" string for the prompt.
- **ConceptAnalyzer.analyze(chords, key)** and **RomanNumeralAnalyzer** work on chord symbol strings; Chord Lab can derive symbols from ChordInfo via `${c.root}${quality}${c.bass ? '/' + c.bass : ''}` (already done when passing `progressionChords` to SmartLessonPane).

### 3. Local AI usage
- **LocalAgentService** (`src/core/services/LocalAgentService.ts`): Singleton, single session, system prompt "You are a jazz mentor. Provide concise, actionable advice for improvisation." Method `ask(question: string)` → appends to session. No way to pass per-request context or change persona.
- **jazzTeacherLogic** (`src/modules/JazzKiller/ai/jazzTeacherLogic.ts`): Uses `createGeminiSession(systemPrompt, opts)` per call (or cached), then `session.prompt(task)`. Builds rich context (e.g. AiContextService.toMarkdown(bundle) + practice context). So JazzKiller creates a *dedicated* session with a song-specific prompt.
- **Implication for Chord Lab**: To get progression-focused answers (Q&A, continuations, alternatives), we should either:
  - **Option A**: Prepend progression context to every user message and call `LocalAgentService.ask(...)`. Simple; works with existing singleton; model sees "jazz mentor" + user message containing context. Slight persona mismatch but acceptable for v1.
  - **Option B**: Chord Lab–specific session (e.g. `createGeminiSession(chordLabSystemPrompt)` when opening the chatbot) and send progression context + message history in each prompt. Cleaner persona; requires managing a session (create on open, dispose on close) and passing current progression + last N turns in each prompt so context stays correct when the user edits the progression.

Recommendation: **Option A for v1** (prepend progression bundle to user message, use `localAgent.ask()`); optionally **Option B** in a later iteration (dedicated Chord Lab session and multi-turn history in prompt).

### 4. UI placement and patterns
- Chord Lab layout: Dashboard (key, scale, voicing, style, BPM), ProgressionBuilder (slots), Piano/Fretboard, Presets, SmartLessonPane (slide-over). SmartLessonPane is a full-screen overlay on large screens (`lg:max-w-md`), with static lesson content + single "Ask Local Agent" and one response bubble.
- **Chatbot UI** options: (a) Extend SmartLessonPane with a chat area (message list + input) below or above the existing lesson content; (b) New collapsible "Progression Assistant" panel (sidebar or bottom sheet); (c) Dedicated tab/section inside Chord Lab. Requirement REQ-CL-AI-02 says "sidebar or inline". Easiest: **extend SmartLessonPane** with a "Chat" section (message history + input) so one surface has both precomputed lesson and AI chat. Alternative: add a floating "Ask about this progression" button that opens a small chat drawer. We'll specify "Chat section inside SmartLessonPane or a dedicated collapsible panel" in the plan.

### 5. Token and safety
- Gemini Nano has limited context. Progression bundle should be **short**: e.g. key, scale, chord list with RN, optional one-line concepts. No need for full AiContextService table for a single progression; a few lines of markdown suffice.
- Avoid injecting raw `[[COMMAND]]` in Chord Lab chat responses for v1 (or strip them if we reuse a prompt that mentions commands). REQ: "no raw [[...]] in Chord Lab chat (or define a minimal command set later)."

### 6. Dependencies
- **Depends on**: Existing theory core (RomanNumeralAnalyzer, ConceptAnalyzer, ChordScaleEngine), LocalAgentService, Chord Lab state (progression, selectedKey, selectedScale).
- **No dependency on**: Phase 5 (AI Drill Actions); can be implemented in parallel.
- **Shared with JazzKiller**: None required for v1; optional later: shared "progression bundle" formatter if we want JazzKiller to also show progression-only context in some view.

---

## Summary
- Build a **short progression bundle** (chords + key + scale + RN) using existing theory; add a small helper (e.g. on AiContextService or new file) that accepts chord symbols + key and returns markdown.
- Use **LocalAgentService.ask()** with progression context prepended to the user message for v1.
- Add **chatbot UI** in Chord Lab: message history (array of { role, content }) + input; on submit, build bundle, prepend to message, call localAgent.ask(), append response to history.
- **System prompt**: Either keep global jazz mentor or add a Chord Lab–specific path (e.g. when opening Chord Lab chat, init a session with "You are a chord progression mentor. Answer questions about the given progression, suggest continuations and alternatives, and explain harmony briefly."). Plan will choose prepend-context + existing LocalAgent for v1.
