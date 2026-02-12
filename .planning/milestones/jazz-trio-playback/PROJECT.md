# Creative Jazz Trio Playback – Project Vision

## Vision Statement

Push the limits of **creatively modelling jazz trio playing** in the playback engine: the rhythm section adapts to **place in the cycle**, **song type**, **inter-instrument interaction**, and **space for the soloist** (especially in ballads).

## Problem Statement

The current JazzKiller band (useJazzBand) already uses tension, activity, ballad mode, and reactive comping, but:

- **Place in the cycle** is implicit (tune progress only). The band does not distinguish intro vs head vs solo choruses vs out head vs ending, so it cannot “play the head sparsely” or “leave space in the last chorus.”
- **Song type** is mostly ballad vs not. Latin, Bossa, Waltz, Medium Swing, and Up-tempo do not drive distinct comping, bass, and drum styles.
- **Interaction** is partly there (piano density → drums simplify; activity → bass variation). We want more: piano responding to bass/drums, bass responding to comping density, and a coherent “conversation.”
- **Soloist space** is only partly addressed (ballad first cycle half-time bass). In ballads and during “solo” sections, the band should leave clear space: sparser comping, longer sustains, fewer hits, optional bass pedal or sparse walking.

## Core Value Proposition

**“A trio that breathes with the tune and leaves room for the soloist.”**

1. **Place in cycle**: Band knows “intro / head / solo chorus 1..N / out head / ending” and adjusts density and style (e.g. head = lighter, solo = leave space, last chorus = can build).
2. **Song type**: Each style (Ballad, Medium Swing, Up-tempo, Latin, Bossa, Waltz) has a defined comping/bass/drum character so the accompaniment fits the song.
3. **Interaction**: Piano, bass, and drums react to each other (density, hits, variation) so the trio feels like a unit, not three independent loops.
4. **Soloist space**: In ballads and in solo sections, the band deliberately leaves space (lower comping density, more sustain, less bass variation, optional pedal).

## Target Audience

- **Jazz students** practicing with the JazzKiller trio and expecting realistic, responsive accompaniment.
- **Teachers** using the app for repertoire that varies by style and form (ballads, Latin, waltzes).
- **Developers** extending a single, coherent “trio model” (place in cycle, style, interaction, space).

## Core Functionality (The ONE Thing)

**The rhythm section adapts to where it is in the tune, what kind of tune it is, and leaves space when the soloist is in the foreground.**

Students must be able to:

- Hear the band “play the head” differently from “solo choruses” and “out head.”
- Hear distinct trio behavior for Ballad vs Medium Swing vs Latin/Bossa/Waltz.
- Feel the band leave space in ballads and during solo sections (sparser comping, more sustain).
- Perceive coherent interaction (e.g. when piano gets busy, drums simplify; when comping is sparse, bass can add color).

## Key Requirements (High-Level)

- **Place-in-cycle**: Resolver that maps (loopCount, section index, measure index, section labels) → role: e.g. `intro` | `head` | `solo` | `out head` | `ending`. Band density and style are influenced by this role.
- **Song-style matrix**: Song metadata (Rhythm, CompStyle, Tempo) maps to a style tag (Ballad, Medium Swing, Up-tempo, Latin, Bossa, Waltz, etc.). Each style has rules for comping density, bass feel (walking vs pedal vs sparse), and drum set (ride vs brushes, density).
- **Soloist space**: In “ballad” style and/or “solo” place-in-cycle, apply a “space” policy: cap comping density, bias toward sustain patterns, reduce bass variation probability, optionally bass pedal or half-time feel.
- **Interaction**: Existing signals (piano density, activity) extended and used consistently: e.g. piano density → drums simplify; comping sparse → bass can use more variation; place-in-cycle “solo” → all three reduce density together.

## Technical Constraints

- Changes are confined to the JazzKiller playback stack: **useJazzBand.ts**, **ReactiveCompingEngine**, **RhythmEngine**, **DrumEngine**, **WalkingBassEngine** / **BassRhythmVariator**, and shared signals (activityLevelSignal, tuneProgressSignal, etc.).
- Reuse existing song structure: **JazzStandard**, **JazzSection** (Label), **playbackPlan**, **loopCount**, **getSongAsIRealFormat** (style, compStyle). Add or derive place-in-cycle and style tag; no change to lead sheet data model beyond optional metadata.
- No new UI for v1 beyond existing style/tempo; “space for soloist” can be automatic when style is Ballad or place-in-cycle is solo.

## Out of Scope (v1)

- Full “AI soloist” that the band follows (focus on band behaviour given fixed form).
- User-editable “band personality” sliders (can be v2).
- Separate stem mixes per style (reuse existing mixer).

## Success Metrics

- For a tune with sections (e.g. AABA with repeats), band density/style differ measurably between “head” and “solo” and “out head.”
- For Ballad vs Medium Swing, comping and bass feel are audibly distinct (e.g. ballad = more sustain, less hits; medium = more quarter-note walk, lighter comping).
- In ballad or solo section, comping density is capped and sustain bias is higher (measurable in pattern choice).
- One coherent place-in-cycle resolver and one style matrix used by piano, bass, and drums.

## Key Decisions

| Decision | Rationale |
|----------|------------|
| **Place-in-cycle resolver** | Form-aware behaviour (head vs solo vs out) is essential for “real trio” feel. |
| **Song-style matrix** | Different tunes need different accompaniment character; style drives all three instruments. |
| **Soloist space policy** | Ballads and solo sections should leave room; explicit policy avoids “wall of comping.” |
| **Reuse existing signals** | activityLevel, tuneProgress, section labels already exist; extend rather than replace. |

## Integration Points

- **JazzKiller**: useJazzBand.ts (place-in-cycle, style tag, space policy, cross-instrument signals).
- **Song data**: JazzStandard.Sections[].Label, Rhythm, CompStyle, Tempo → style tag and playback plan → place-in-cycle.
- **Engines**: RhythmEngine (pattern choice by style + place + space), DrumEngine (density by style + piano), WalkingBassEngine / BassRhythmVariator (feel and variation by style + place + space), ReactiveCompingEngine (target density by place + space).

## Next Steps

1. Define detailed requirements (REQUIREMENTS.md).
2. Plan implementation phases (ROADMAP.md).
3. Implement Phase 1: place-in-cycle resolver and style tag; wire into band loop.
4. Implement Phase 2: song-style matrix (Ballad, Medium, Latin, etc.) and engine rules.
5. Implement Phase 3: soloist-space policy and interaction refinements.
