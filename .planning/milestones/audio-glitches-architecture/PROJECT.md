# Fix Audio Glitches Forever – Critical Feasibility & Architecture Expansion

## Vision Statement

Eliminate audio dropouts and glitches in the ITM PWA by **enforcing strict thread isolation** and **documenting the feedback-loop architecture**. This milestone addresses the convergence of real-time audio (SwiftF0), local LLM (Gemini Nano), and generative playback (Jazz Trio) so that resource contention in the browser never blocks the audio path.

## Problem Statement

- **Constraint**: PWA (browser-based) execution environment; JavaScript is single-threaded for main and (in many engines) audio worklets share or contend with playback.
- **Risk**: Running Tone.Transport, SwiftF0 inference, and Gemini Nano simultaneously causes **audio dropouts (glitches)** if heavy work runs on the audio thread or blocks the main thread during buffer submission.
- **Root cause** (see `../audio-glitch-diagnosis/ROOT_CAUSE.md`): Heavy pitch work (MPM autocorrelation / NSDF) was previously on the **audio rendering thread** (worklet). Moving MPM to a Web Worker and keeping the worklet to copy + downsample + SAB write removes that source of glitches. This milestone **locks in** that architecture and extends it with explicit **isolation rules** and **data flow** so future features (e.g. more AI, more DSP) cannot regress.

## Core Value Proposition

1. **Strict isolation**: Four clear boundaries—Main (UI/state), AudioWorklet (DSP/playback only), Worker A (analysis: SwiftF0/MPM), Worker B (AI: Gemini Nano). No heavy work on the audio thread; no blocking of Tone.Transport from the main thread by inference.
2. **Latency budget**: The real-time feedback loop (mic → pitch → UI) targets **&lt;10 ms**. Gemini Nano inference can take **seconds**—it must never block the audio or scoring path. AI feedback is **post-phrase or post-segment**; real-time feedback is **algorithmic** (pitch/timing/intonation).
3. **Memory awareness**: Document and guard against loading large assets (stems, LLM weights, WASM) in ways that risk mobile browser caps (e.g. iOS Safari); optional lazy-load and budget checks.

## Target Audience

- **Developers** implementing or refactoring audio, pitch, or AI features.
- **Architects** ensuring the ITM 2026 stack (SwiftF0 + Nano + Trio) remains feasible in-browser.

## Core Functionality (The ONE Thing)

**Define and enforce an architecture where the audio thread never does heavy work, the main thread never blocks playback scheduling, and AI critique is strictly asynchronous—so that audio glitches are eliminated and never reintroduced.**

## High-Level Requirements

| Area | Goal | Out of Scope |
|------|-----|--------------|
| Thread isolation | Main / AudioWorklet / Worker A (analysis) / Worker B (AI) documented and enforced | Moving to native app or separate process |
| Audio thread | Worklet: copy, downsample, SAB write only; no MPM/SwiftF0/CREPE in worklet | Moving Tone.js to Worker (major refactor) |
| Latency | &lt;10 ms for audio processing path; AI feedback async only | Sub-millisecond guarantees |
| Data flow | Document SAB layout, who writes/reads what, and message boundaries | New binary protocols |
| Memory | Document budgets and risks; optional guards for mobile | Full memory profiler |

## Architectural Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| **Thread contention** | Strict isolation: Tone.Transport + mixer on main/audio; SwiftF0 + MPM in Worker A; Gemini in Worker B. |
| **Latency budget** | Real-time feedback = algorithmic (pitch/timing). AI critique = post-phrase/post-segment only; never block &lt;10 ms path. |
| **Memory limits** | Document stem/LLM/WASM load order and sizes; optional lazy-load and “low memory” mode for mobile. |

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Four-way isolation | Main (React/Zustand), AudioWorklet (DSP/scheduling), Worker A (SwiftF0/MPM), Worker B (Gemini). Clear ownership avoids regression. |
| AI feedback async only | Gemini Nano is pedagogical/structural; real-time feedback is pitch/intonation/timing from existing pipeline. |
| Document, then verify | Before adding features, check against isolation and data-flow spec; add tests or guards where possible. |
| Reuse ROOT_CAUSE fix | MPM already in MpmWorker; worklet already light. This milestone formalizes and extends. |

## Success Metrics

- No audio dropouts when mic + playback + (optional) SwiftF0 + (optional) Nano are active.
- Documented architecture (data flow, SAB layout, thread ownership) in this milestone.
- Requirements (REQ-IDs) traceable to isolation and async feedback; at least one verification path (manual or automated).

## Integration Points

- **pitch-processor.js**: Must remain “copy + downsample + SAB write” only.
- **MpmWorker.ts** / **SwiftF0Worker.ts**: All pitch inference off audio thread.
- **useITMPitchStore** / **useHighPerformancePitch**: Consumers of SAB; no blocking calls into workers.
- **jazzTeacherLogic** / **generateStandardsExerciseAnalysis**: Trigger Gemini asynchronously; never block transport or pitch loop.
- **Tone.Transport** / **globalAudio**: Scheduling and playback; never blocked by inference or LLM.

## Out of Scope

- Rewriting Tone.js or moving Transport into a Worker.
- Changing SwiftF0 or Gemini model architecture.
- Native or non-PWA deployment.

## Next Steps

1. Detail requirements with REQ-IDs (REQUIREMENTS.md).
2. Add data flow and technical spec (RESEARCH.md or SPECS.md in this milestone).
3. Plan verification waves (ROADMAP.md, STATE.md).
4. Execute verification and document; update main ROADMAP/STATE as needed.
