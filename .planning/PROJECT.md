# Project: Semantic AI Mentor (Theory-Augmented Local AI)

## Current focus
**Make the Chord Lab AI assistant work**: Ensure the Progression Assistant (local AI chatbot in Chord Lab) is discoverable, reliable, and gives clear UX—e.g. user can open Smart Lesson, use the chat to ask about the progression and get coherent answers; Gemini Nano availability and fallbacks are clear.

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

## Gemini Nano: Contextual Metadata Generator (Not Chat)

To maximize Gemini Nano (window.ai) for the jazz app, **stop treating it as a "chat" interface** and use it as a **Contextual Metadata Generator**. Nano's sequential logic can drift; use it to **"narrate" the hard data** provided by the theory engine (Tonal.js). Tonal.js is the **truth**; Nano is the **teacher** (flavor, pedagogy, mnemonics).

### Optimization: Tonal.js vs Gemini Nano

| Feature | Use Tonal.js (The Truth) | Use Gemini Nano (The Teacher) |
| --- | --- | --- |
| Note Identification | Identifying notes in Ab13(#11). | Explaining why the #11 sounds "shimmery." |
| Transposition | Moving a lick from C to Gb. | Explaining the "fingering hurdles" in Gb. |
| Check Results | Validating if a chord is in key. | Encouraging the student after a 5-song streak. |
| Rhythm Logic | Calculating 16th-note triplets. | Describing the "laid-back" feel of a swing beat. |

### Three-Module Nano Strategy

1. **Progression Builder (Theory Agent)**  
   Student knows what chords they want but not why they work. Nano explains the "Connective Tissue."  
   **Strategy**: Send a **triplet** of chords (Previous → Current → Next) and ask for **Voice Leading Logic**.  
   **Prompt pattern**: *"Given the sequence Dm7→G7→Cmaj7 in C Major, explain the movement of the 7th of G7 (F) to the 3rd of Cmaj7 (E)."*  
   **Nano's role**: Flavor text (e.g. "tension-release moment") so the builder feels like a guided lesson.

2. **Ear Trainer (Contextual Feedback)**  
   Traditional ear trainers say "Right" or "Wrong." This app explains **why** a mistake happened.  
   **Strategy**: When the student misidentifies an interval/chord, pass **Wrong Answer + Correct Answer** to Nano.  
   **Example**: Student said "Major 3rd" over a Minor 3rd. Nano: *"Explain the 'darker' quality of the minor 3rd (Eb) and how it defines the Dorian sound."*  
   **Result**: Mistakes map to harmonic colors; ear development accelerates.

3. **Rhythm Trainer (Descriptive Modeling)**  
   Rhythm is hard to "score" via AI; Nano excels at turning **Rhythmic Feel** into **Practical Imagery**.  
   **Strategy**: Use Nano to generate **Rhythmic Mantras** or **scat phrases** for specific subdivisions.  
   **Workflow**: Student chooses a "Swing" rhythm → Nano returns a 3-word vocalization (e.g. "Doo-dah, doo-dah") → Display above metronome so students internalize the "pocket" through language.  
   **Rhythm Scat Generator**: Complex syncopated rhythm → vocalized scat phrase ("Doo-be-dah") to internalize time.

### Ear Trainer Feedback Loop (Teaching Machine)

Transform the Ear Trainer from a quiz app into a **diagnostic teaching machine**:

- **Diagnose**: When the student is wrong, capture **Aural Distance** (correct vs guess: semitones, overshot/undershot, common confusions e.g. Perfect 4th vs Tritone).
- **Hint (never answer)**: Pass diagnosis to Nano; Nano returns a **1-sentence hint** on the "vibe" or "character" of the correct interval vs their guess.
- **UI**: Play → Guess → "Not quite" + AI Hint (toast/bubble) → Retry (replay) → Success → Update performance heatmap.
- **Aural mnemonics**: Nano can suggest mnemonics (e.g. "The Simpsons theme" for Tritone) based on the specific mistake.
- **Error profiling**: If the student consistently overshoots by a semitone, AI can say: *"I noticed you're hearing everything a bit sharp today. Let's focus on the 'gravity' of the Perfect 4th."*

### Nano Guardrail: Zero-Shot Context Wrapper

To prevent Nano from losing scope, **always wrap calls in a Zero-Shot Context wrapper**. Never assume the model remembers the previous chord.

```js
const askNano = async (context, question) => {
  const session = await window.ai.languageModel.create({
    systemPrompt: "You are a concise Jazz Coach. Limit answers to 15 words."
  });
  // Always re-inject the 'Ground Truth' from Tonal.js
  return await session.prompt(`Context: ${JSON.stringify(context)}. Question: ${question}`);
};
```

---

## Gemini Nano Architecture (Stateless Logic + Prompt Hardening)

To handle Nano's limited context and tendency to "hallucinate" logic, the AI is treated as a **Stateless Logic Function**, not a long-form conversational agent.

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
| **Nano as Metadata Generator** | Use Nano to narrate Tonal.js ground truth (flavor, hints, scat); not as long-form chat. | [Decided] |

## Universal Microphone Handler (New Initiative)

**Goal**: App-wide universal microphone handler that analyses what the student is **playing** (instrument → pitch/notes, rhythm) or **clapping** (hands → beat, tempo, subdivision) so any module can consume live mic input for feedback.

### Vision

A single, app-wide mic pipeline that modules (Chord Lab, JazzKiller, Ear Trainer, Rhythm Architect, BiTonal Sandbox, etc.) can subscribe to. The handler provides **two analysis modes** (or combined): (1) **Playing** — pitch/note onset, optional chord recognition; (2) **Clapping** — beat/tempo, rhythm pattern, subdivision. One permission grant, one stream; multiple consumers via a shared service.

### Value

- **Single permission, single stream**: User grants mic once; all modules use the same handler (no duplicate `getUserMedia` per screen).
- **Reuse existing work**: BiTonal Sandbox already uses `getUserMedia` + pitch (e.g. ml5); extract and generalize into a core service.
- **Rhythm from claps**: Beat/tempo and subdivision from hand claps for Rhythm Architect and metronome alignment.
- **Extensible**: Future modules can request "pitch only", "rhythm only", or "both" without re-opening the mic.

### Scope (High-Level)

- **In scope**: Central mic service (e.g. `MicrophoneService` or `useMicrophone`), permission and stream lifecycle, pitch/note analysis for "playing", beat/onset analysis for "clapping", optional integration in 1–2 modules (e.g. Rhythm Architect for clap-tempo, Ear Trainer or Chord Lab for play-back).
- **Out of scope for v1**: Full chord recognition from mic, multi-instrument classification, recording/playback of mic audio, offline processing.

### Harmonic Mirror: Mic as "Teacher That Listens" (Not Rhythm Judge)

To avoid the messiness of web-based timing, the microphone is used as a **Harmonic Mirror** rather than a rhythm judge. Focus on **frequency accuracy** and **structural milestones** (e.g. "did they hit the 3rd of the chord?") so the app is a teacher that actually listens.

- **Ignore Rhythm rule**: Tell the student: "Don't worry about the beat; just focus on hitting the right notes." This manages expectations regarding web latency. Real-time rhythm grading is deferred; mic v1 is for **Note Accuracy (Pitch)** and optional **Tone Quality (Timbre)**.
- **Pitch-to-Theory Pipe**: Separate physical audio (mic) from musical logic (app). (1) **Ear**: Audio Worklet or AnalyserNode for raw PCM. (2) **Pitch**: YIN or MPM algorithm (e.g. Pitchy, crepe) → frequency. (3) **Brain**: Tonal.js converts frequency to MIDI/note and validates against current chord.
- **useAuralMirror hook** (concept): Handles mic stream; returns the "Live Note" the student is playing. Use clarity threshold (e.g. > 90%) so UI doesn't flicker; optional ~100ms debounce for stable display. Tonal.js `Note.fromFreq(pitch)` for note name; validate against chord tones.

### Pedagogical Modes (Harmonic Mirror)

1. **Guide Tone Spotlight (Active Listening)**  
   App plays Aebersold-style drums and bass; student plays **only the 3rd** of every chord (the key color note).  
   - **Target note**: `Tonal.Chord.get(currentChord).notes[1]` (the 3rd).  
   - **useAuralMirror** detects student pitch; when they hit the 3rd, the bar on the chart **lights up green**.  
   - Trains ear to find the "meat" of the changes, not just scales.

2. **Call and Response (Aural Mimicry)**  
   Simulates a private lesson: master plays a lick, student repeats.  
   - App (Tone.js Sampler) plays a short jazz motif (e.g. 4-note ii–V–I lick).  
   - App goes silent and listens; student plays it back; mic verifies pitches.  
   - **Nano layer**: If student misses a note, Gemini Nano gives a specific tip: e.g. "You missed the b7 on the G7 chord. Listen for that 'bluesy' tension before it resolves."

3. **Smart Implementation Table (Mic Goals)**

| Feature | Tech Used | Pedagogical Goal |
| --- | --- | --- |
| Target Practice | Pitch detection + Tonal.js | Learning chord tones (1, 3, 5, 7) |
| Drone Tuning | Mic input + sine wave | Practicing "straightness" of tone against reference |
| Lick Validation | Pitch buffering | Verifying memory of jazz vocabulary |
| Energy Tracker | Amplitude (RMS) detection | Teaching dynamics—too loud/soft vs track |

### Technical Sanity Rules (Web Mic)

- **Noise gate**: Do not trigger logic if volume is below ~-40 dB; prevents ghost notes from room noise.
- **Live Note indicator**: Always show a small "Live Note" in the corner so the student knows the app is hearing them.
- **Clarity threshold**: Only show/use the detected note when pitch clarity is above ~90% (jazz-ready); avoids flicker from background noise.
- **Visual smoothing**: Optional ~100 ms debounce before updating UI note (stable, tuner-like feel).
- **Latency**: Since we are not grading rhythm, time-delay is ignored; if pitch matches the current bar, count it as success.
- **Tone Quality (v2)**: Use `AnalyserNode.getByteFrequencyData()` for "brightness"; feedback on too thin (lack of low-end) or too harsh (high-end) for jazz sound.

### Key Decisions (To Be Locked in Phase Plan)

| Decision | Options | Status |
| :--- | :--- | :--- |
| **Service shape** | Zustand slice + hook vs React context vs plain singleton. | TBD |
| **Pitch source** | Pitchy / YIN/MPM vs ml5/CREPE (BiTonal) vs Web Audio AnalyserNode. | TBD |
| **Harmonic Mirror first** | Prioritize pitch/note accuracy and Guide Tone + Call & Response; defer rhythm grading. | [Decided] |
| **Rhythm/clap** | Onset detection (Web Audio / energy threshold) vs dedicated beat-tracking lib; secondary to Harmonic Mirror. | TBD |
| **Module consumers** | Guide Tone in JazzKiller/Practice Studio; Call & Response in Ear Trainer or dedicated drill; BiTonal migration. | TBD |

---

## Adaptive Ear Training with MIDI-Supported AI (New Initiative)

**Goal**: Improve all ear training exercises with MIDI-supported AI that learns what the student is doing wrong, proposes areas to focus on, gives more challenging questions when the student is ready, and repeats similar challenges when the student makes many mistakes.

### Vision

Transform the Ear Trainer from a quiz with hints (Phase 7) into an **adaptive teaching machine**:

- **MIDI everywhere**: All applicable ear training levels accept MIDI keyboard input so students can *play* their answer (Intervals, ChordQualities, MelodySteps, Bass, etc.).
- **AI learns mistakes**: Aggregate error profiles (overshoot/undershoot, common confusions like P4 vs tritone) and pass to Nano for diagnostic summaries and focus-area suggestions.
- **Adaptive difficulty**: When success streak and rate exceed thresholds → offer harder questions. When mistake count is high → repeat similar items before introducing new ones.
- **Propose focus areas**: AI suggests, e.g. "Focus on P4 vs Tritone—that's your weak spot" and the app can bias the curriculum accordingly.

### Technical Approach

- **Reuse**: MidiContext/useMidi, earDiagnosis, getEarHint, nanoHelpers.askNano (Phase 7).
- **New**: useEarPerformanceStore (or extend useFunctionalEarTrainingStore) for per-interval/quality success/failure and error diagnosis aggregation.
- **Adaptive logic**: Rule-based (streak, success rate, mistake count thresholds); no ML for v1.
- **Focus-area AI**: Pass aggregate profile to Nano; Nano returns 1–2 sentence suggestion; display in panel/toast.

*Detailed plan: `.planning/milestones/adaptive-ear-midi-ai/`.*

---

## Out of Scope

- Cloud-based LLM calls (OpenAI/Anthropic) for this milestone.
- Multi-user "Learning Memory" sync.
- Real-time audio/MIDI analysis in Chord Lab for v1 (separate from universal mic handler).
