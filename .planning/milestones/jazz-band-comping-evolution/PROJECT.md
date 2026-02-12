# Jazz Band Comping Evolution – Project Vision

## Vision Statement

Evolve the existing pattern library into a **Smart Pattern Engine** using 2026 SOTA: **Markov-Chain Pattern Sequencing** and **Stochastic Groove Injection**. The band should feel human—jitter and drift instead of robotic loops—with procedural lead-ins, meter-independent rhythmic atoms, and real-time response to the student’s playing via a **Rhythmic Density Tracker** and **Markov Bridge**.

## Problem Statement

Static pattern libraries (like early iReal Pro) loop perfectly and sound robotic. Transitions are abrupt or repetitive; energy is constant; drum fills are pre-recorded. The goal is to move from “one pattern for 32 bars” to a **Pattern Transition Matrix** where the engine decides the next vibe based on current state, cadence, and soloist intensity—without deleting the existing pattern library.

## Core Value Proposition

1. **Pattern Transition Matrix (Markov)**: Each pattern is tagged with **Energy Level** (LOW / MEDIUM / HIGH / FILL). The engine uses a Markov chain to choose the next pattern: no instant jump from “Ballad Brush” to “Double Time Bop”; logical steps (e.g. 70% stay LOW, 20% MEDIUM, 10% FILL).
2. **Stochastic Humanization**: Micro-timing offsets (bass “lazy” −5ms to +2ms), velocity blur (±10% Gaussian), ghost-note probability gates (e.g. 60% of the time) so no two bars feel identical.
3. **Procedural Lead-Ins**: The last eighth note of any bar is **procedural**—chromatic or dominant approach to the next chord’s root—not from the pattern, so the bass line connects to the harmony.
4. **Meter Independence**: Store patterns as **rhythmic fragments** (atoms) rather than full bars; recombine (e.g. 5/4 = three “Normal” + two “Syncopated” atoms) to support any meter mathematically.
5. **Student-Responsive Band**: **RhythmicDensityTracker** (SwiftF0 + onset + confidence + RMS, 4s window) feeds **MarkovBridge** to bias the transition matrix by soloist density—shredding → HIGH energy bias; ballad/space → LOW energy bias.

## Target Audience

- **Jazz students** who want a backing band that breathes and responds, not a static loop.
- **Developers** extending the playback engine with Markov selection, humanization, and density-driven vibe.
- **Product** aiming for “Genius Jamtracks / JJazzLab” tier feel without becoming robotic.

## Core Functionality (The ONE Thing)

**The engine does not pick one pattern for 32 bars. It asks every 4–8 bars: “Am I at a cadence? Is the soloist playing intensely?” and uses a Markov transition plus humanization and procedural lead-ins to play a unique performance every time.**

Users must be able to:

- Hear the band **transition** between energy levels (LOW → MEDIUM → HIGH, FILL → groove) in a musically logical way.
- Experience **humanized** timing and velocity (no perfect “and of 2” every bar).
- Hear **procedural** bass/drum lead-ins into the next chord on the last eighth of the bar.
- (Optional) Have the band **respond** to their playing density when soloist-responsive mode is on (RhythmicDensityTracker + MarkovBridge).

## Key Requirements (High-Level)

- **Markov Pattern Engine**: State machine over pattern types (LOW / MEDIUM / HIGH / FILL); transition matrix; `getNextPatternType()` / `getPatternForBar()`; FILL state has 0% self-repeat so fills last one bar only.
- **Pattern Tagging**: Existing (or new) patterns tagged with `type: PatternType` and optional Energy Level (1–5) / Connectivity for future use.
- **Humanization Layer**: Bass micro-timing (−5ms to +2ms); piano velocity Gaussian blur (±10%); ghost-note probability gate (e.g. 60%).
- **Procedural Lead-Ins**: Last eighth of bar: ignore pattern; compute chromatic or dominant approach to next chord root (reuse Functional Decomposition / WalkingBassEngine logic).
- **Meter Independence (v2 or later)**: Atomize patterns into 1-beat fragments; recombination rules for 5/4, 7/8, etc.
- **RhythmicDensityTracker**: Onset history (SwiftF0 + confidence + pitch jump / RMS spike), 4s window; `getDensity()` → 0–1 (notes-per-second–style).
- **MarkovBridge**: `updateBandVibe(tracker, engine)` — density thresholds (e.g. >0.75 → bias HIGH; <0.3 → bias LOW) adjust transition matrix or effective energy passed to engines.

## Technical Constraints

- **Do not delete the pattern library.** Evolve it: add tags (type, energy), keep MIDI/data as-is; selection and humanization sit on top.
- **Zero latency**: Markov transition &lt;1ms so it can run on the last beat of the bar without interrupting Tone.Transport.
- **Reuse existing engines**: WalkingBassEngine (approach logic), DrumEngine, RhythmEngine, ReactiveCompingEngine; place-in-cycle and song-style (Phase 18) stay; soloist-responsive (Phase 19) can consume density from RhythmicDensityTracker.
- **SwiftF0 as source** for density: same pipeline as ITM / Innovative Exercises / Soloist-Responsive; no new pitch stack.

## Out of Scope (v1)

- Full re-authoring of all patterns from scratch (tag and wrap only).
- Changing tempo or meter mid-song based on soloist (density/energy only).
- New stem sets or mixer changes beyond humanization and selection logic.

## Success Metrics

- Audibly distinct transitions between LOW / MEDIUM / HIGH / FILL without instant jumps.
- Humanization: no perfectly identical “and of 2” every bar; velocity and timing vary.
- Procedural lead-ins: last eighth of bar clearly leads into next chord (bass/harmony).
- With RhythmicDensityTracker + MarkovBridge: band shifts toward HIGH when student plays busily, toward LOW when student plays sparsely (when soloist-responsive is on).
- No regression when feature is off or when density is not used.

## Key Decisions

| Decision | Rationale |
|----------|------------|
| **Markov over random** | Transitions feel logical (e.g. FILL → groove, not FILL → FILL); energy levels step gradually. |
| **Keep pattern library** | No throw-away; add tags and selection layer; SOTA is “evolve,” not “replace.” |
| **Procedural last 8th** | Removes the most robotic part (bar-to-bar seam); reuses existing harmony/approach logic. |
| **Rhythmic fragments (v2)** | Enables 5/4, 7/8, etc. without hand-authoring every meter; atomize 4/4 into 1-beat atoms first. |
| **SwiftF0 for density** | Same pipeline as rest of app; fast enough for onset counting in 4s window; confidence gate reduces noise. |

## Integration Points

- **JazzKiller / useJazzBand**: Calls Markov engine every 4 or 8 bars (or at beat 0); passes selected pattern type / humanization params to RhythmEngine, DrumEngine, WalkingBassEngine.
- **Pitch**: useITMPitchStore / SwiftF0 → RhythmicDensityTracker (optional); MarkovBridge updates engine matrix or effective energy.
- **Engines**: ReactiveCompingEngine, DrumEngine, WalkingBassEngine, BassRhythmVariator receive pattern type + humanization; procedural lead-in at bar boundary uses WalkingBassEngine / chord approach logic.
- **Pattern library**: Add `type: PatternType` (and optional energy 1–5) to existing pattern entries; no change to MIDI content until humanization layer is applied at playback.

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation phases (ROADMAP.md).
3. Implement Phase 1: Markov Pattern Engine + pattern tagging.
4. Implement Phase 2: Stochastic humanization layer.
5. Implement Phase 3: Procedural lead-ins at bar end.
6. Implement Phase 4 (optional): RhythmicDensityTracker + MarkovBridge.
7. (Later) Meter independence via rhythmic atoms.
