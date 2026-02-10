# HD Jazz Playback - Project Vision

## Vision Statement

Refine the **HD jazz playback** engine so the rhythm section feels authentic and predictable: the **double bass plays primarily quarter notes** (walking bass), with rhythmic variations that are **infrequent** and **always tied to band tension intensity**.

## Problem Statement

The current HD jazz band (JazzKiller `useJazzBand`) already uses tension and activity to vary bass rhythm, but:
- Quarter-note feel is not the **dominant** default; eighth-note variations can appear too often in mid-tension and mid-activity contexts.
- The rule “variations only when tension is high and the whole band is intense” is not explicit or strict enough.

## Core Value Proposition

**“Walking bass by default, color when the band burns.”**

1. **Default**: Double bass plays **four quarter notes per bar** (walking bass), with note choice driven by harmony (existing `JazzTheoryService.getNextWalkingBassNote`).
2. **Variations**: Occasional eighth-note hits or extra attacks only when **band tension intensity** is clearly high; otherwise the bass stays in quarter-note time.
3. **Consistency**: Same tension/activity signals that drive piano and drums drive bass variation decisions, so the whole band breathes together.

## Target Audience

- **Jazz students** practicing with the HD backing band (JazzKiller).
- **Teachers** using the app for realistic, non-distracting accompaniment.
- **Developers** maintaining a single, clear rule set for bass rhythm.

## Core Functionality (The ONE Thing)

**Double bass plays primarily quarter notes; variations are rare and only at high band tension.**

Students must be able to:
- Hear a stable, quarter-note walking bass in normal and low-tension sections.
- Hear occasional bass variation only when the band (tension + activity) is clearly intense.
- Rely on the same “band intensity” concept for bass, piano, and drums.

## Key Requirements (High-Level)

- **Bass default**: Rhythm pattern is `[0, 1, 2, 3]` (one note per quarter) for the majority of bars.
- **Tension gate**: Non–quarter-note patterns (e.g. `[0, 0.66, 1, 2, 3]`, `[0, 1, 1.5, 3]`, `[0, 1, 2, 2.66, 3]`) are only allowed when a **band tension intensity** value is above a defined threshold.
- **Rarity**: When allowed, variations are chosen with a low probability (e.g. well below 50%) so quarter-note remains the norm.
- **Single source of truth**: Band tension intensity is derived from existing signals (e.g. `currentTension`, `activityLevelSignal`) so bass, piano, and drums stay aligned.

## Technical Constraints

- Changes are confined to the HD jazz engine: **`useJazzBand.ts`** (and optionally shared tension/activity helpers if we extract them).
- Reuse existing `bassRhythmPatternRef`, `JazzTheoryService.getNextWalkingBassNote`, and Tone.js scheduling.
- No change to sample set or mix; only rhythm pattern selection and gating logic.

## Out of Scope (v1)

- Changing walking bass **note choice** (that stays in `JazzTheoryService`).
- New UI controls for “bass complexity” (can be v2).
- Other instruments’ phrasing (piano/drums) except insofar as they share the same tension/activity concept.
- Non–HD playback (e.g. `globalAudio` or `useJazzPlayback` simple bass) unless we explicitly add a follow-up task.

## Success Metrics

- In normal/low-tension sections, bass uses quarter-note pattern in ≥ ~90% of bars (measurable in code or by listening tests).
- Variations occur only when band tension intensity is above a configured threshold.
- One clear place in code that encodes: “quarter notes by default; variations rare and tension-gated.”

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **Quarter-note default** | Authentic walking bass; students and teachers expect steady time. |
| **Tension-gated variations** | Keeps bass aligned with band energy; avoids random busyness. |
| **Rare variations** | “Not often” per user; quarter-note remains the primary feel. |
| **Reuse existing signals** | No new state; same “band intensity” drives all rhythm section. |

## Integration Points

- **JazzKiller**: `useJazzBand.ts` (bass rhythm selection on beat 0).
- **Jazz theory**: `JazzTheoryService.getNextWalkingBassNote` (unchanged for note choice).
- **State**: `activityLevelSignal`, tension derived from song/position (e.g. `currentTension` in the loop).

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation phases (ROADMAP.md).
3. Implement Phase 1: bass rhythm rules (quarter-note default, tension gate, rarity).
