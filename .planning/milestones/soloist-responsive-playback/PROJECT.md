# Soloist-Responsive Playback – Project Vision

## Vision Statement

Add an **experimental feature** (toggle) so the playback engine **listens to the soloist** via SwiftF0 pitch detection and **adjusts in real time**: more space when the user plays more and faster, more backing when the user plays less—true call-and-response behaviour.

## Problem Statement

The JazzKiller band (useJazzBand) already adapts to **place in cycle**, **song style**, and a **soloist-space policy** (Phase 18), but:

- **Activity** is driven by the BPM slider and tune intensity, not by whether the user is actually playing.
- The band does not react to **soloist input**: no “listening” to mic/SwiftF0 to detect when the user is playing or resting.
- Call-and-response today is band-internal (QuestionAnswerCoordinator); there is no **soloist-driven** call-and-response.

## Core Value Proposition

**“The band breathes with the soloist.”**

1. **Soloist activity from SwiftF0**: Use existing SwiftF0 (or high-performance pitch) to detect when the user is playing (onset + sustained pitch) vs silent.
2. **Real-time adaptation**: When the user is playing more and faster → band gives more space (lower comping density, sparser bass, lighter drums). When the user is resting or playing sparsely → band fills more (normal or slightly increased density).
3. **Experimental toggle**: Feature is off by default; a UI toggle enables “Soloist-Responsive” mode so users can opt in.
4. **Call-and-response feel**: The rhythm section responds to the soloist’s activity level and density, not just to place-in-cycle and song style.

## Target Audience

- **Jazz students** who want the band to “listen” and leave space when they solo, and fill when they rest.
- **Teachers** who want to demonstrate call-and-response with a backing track that reacts to the student.
- **Developers** extending the playback engine with a new signal: soloist activity derived from mic/SwiftF0.

## Core Functionality (The ONE Thing)

**When the toggle is on, the band’s density and “space” are influenced by real-time soloist activity from SwiftF0: more space when the user plays more/faster, more backing when the user plays less.**

Users must be able to:

- Turn on “Soloist-Responsive” (or “Call-and-Response”) in JazzKiller (e.g. Mixer or band settings).
- Play into the mic and hear the band leave more space when they play busily, and fill more when they stop or play sparsely.
- Use the same SwiftF0 pipeline already used for ITM scoring and Innovative Exercises (no new pitch stack).

## Key Requirements (High-Level)

- **Toggle**: A persistent setting (signal or preference) that enables/disables soloist-responsive mode. Default off.
- **Soloist activity signal**: Derive from SwiftF0 (or useITMPitchStore / useHighPerformancePitch): e.g. onset rate, “is playing” (pitch present + confidence), optional “density” (notes per bar or per beat). Output a 0–1 “soloist activity” value consumed by the band loop.
- **Band reaction**: When soloist-responsive is on, combine (or override) the existing activity/density inputs to the comping, bass, and drums with the soloist-activity signal: high soloist activity → more space (cap density, sparse comping, lighter drums/bass); low soloist activity → normal or slightly increased backing.
- **Integration**: useJazzBand (or a shared band loop) reads the soloist-activity signal when the toggle is on and passes it into the existing trio context (density cap, sustain bias, variation probability) so behaviour is consistent with Phase 18 soloist-space logic.

## Technical Constraints

- Reuse **SwiftF0** and **useITMPitchStore** / **useHighPerformancePitch**; no new pitch detector. Optionally use onset stream for “notes per bar” or “is playing” windows.
- Changes are confined to: **JazzKiller** (toggle UI, wiring), **jazzSignals** or equivalent (new signal for toggle + optional soloist activity), **useJazzBand** (read soloist activity when enabled and drive density/space), and a small **soloist-activity** module (derive activity from pitch store).
- Mic must be available when the toggle is on; graceful fallback when mic is not present (e.g. treat as “low activity” or ignore and use existing activity only).
- Experimental: no commitment to default-on; can be refined (e.g. sensitivity, smoothing) in a later iteration.

## Out of Scope (v1)

- Changing tempo or bar structure based on soloist (focus on density/space only).
- Full “AI follows soloist’s notes” (only activity level, not pitch content).
- New stem sets or mixer changes beyond one toggle and one derived signal.

## Success Metrics

- With toggle on and user playing busily, comping density and drum/bass activity decrease measurably vs toggle off.
- With toggle on and user silent or playing sparsely, band density is at least as high as baseline (normal or slightly higher).
- Toggle is discoverable (e.g. Mixer or band panel) and persists for the session or user preference.
- No regression when toggle is off (behaviour unchanged from current Phase 18).

## Key Decisions

| Decision | Rationale |
|----------|------------|
| **SwiftF0 as source** | Already used for ITM and Innovative Exercises; single pipeline for “what the user is playing.” |
| **Activity-level only** | Keeps v1 simple: “how much / how busy” not “which notes”; avoids harmony logic in this milestone. |
| **Experimental toggle** | Allows safe rollout and A/B behaviour; default off preserves current experience. |
| **Reuse trio context** | Phase 18 already has density cap, sustain bias, soloist space; soloist activity becomes another input to that policy. |

## Integration Points

- **JazzKiller**: useJazzBand (read soloist activity when toggle on; drive density/space); Mixer or band UI (toggle).
- **Pitch**: useITMPitchStore / useHighPerformancePitch (getLatestPitch, onset); optional small bridge that computes “soloist activity” (e.g. rolling onset count or “has pitch” windows).
- **Signals**: New `soloistResponsiveEnabledSignal` (boolean); new `soloistActivitySignal` (0–1) or equivalent ref updated from pitch/onset.
- **Engines**: Same as Phase 18—ReactiveCompingEngine, DrumEngine, BassRhythmVariator, RhythmEngine receive effective activity/density; when soloist-responsive is on, that effective value is influenced by soloist activity.

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation phases (ROADMAP.md).
3. Implement Phase 1: Toggle + soloist-activity derivation from SwiftF0.
4. Implement Phase 2: Wire soloist activity into useJazzBand and trio density/space.
5. Implement Phase 3: UI, persistence, and verification.
