# Project: The Incredible Teaching Machine (ITM) 2026

## Vision Statement

Transition from a music theory prototype to a full-scale "Incredible Teaching Machine" by perfecting the **Feedback Loop**—the dynamic cycle where the student plays, the app listens, and the AI corrects. ITM aims to facilitate true mastery through guided routines, active scoring, and AI-powered performance critique.

## Core Value Proposition

- **Adaptive Pedagogy**: Real-time AI analysis (Gemini Nano) that identifies specific student weaknesses and adapts the routine.
- **Measurable Progress**: A gamified "Mastery Tree" that enforces standards and skill acquisition (BPM, Accuracy, Key Cycles).
- **Immersive Performance**: Studio-quality stems and visual feedback that bridge the gap between "practice" and "performance."
- **Social Connectivity**: A shared ecosystem for students and teachers to track progress and share knowledge.

## Key Pillars

### 1. The "Feedback" Engine (Refining Core Logic)

- **Concept**: Solidifying the connection between student instrument and AI.
- **Goal**: Real-time correction and structured guided sessions.
- **Tech**: Pitch detection logic, Gemini Nano for performance analysis, Zustand for scoring state.

### 2. The "Mastery Tree" (Progressive Curriculum)

- **Concept**: A logical, standardized learning path for over 1,300 standards.
- **Goal**: Prevent student overwhelm and ensure deep internalization (Sonny Rollins routine).
- **Tech**: Skill-based tagging, visual progress tree (Duolingo style), unlock milestones.

### 3. The "Sonic" Layer (High-Fidelity Experience)

- **Concept**: Moving from "playable" to "immersive."
- **Goal**: Provide the best-in-class practice environment with high-fidelity stems and visual cues.
- **Tech**: 3-track Dynamic Mixer, Visual Transcription (Note Waterfall), Tone Matching.

### 4. Cloud & Community (The Ecosystem)

- **Concept**: Moving from a local tool to a shared platform.
- **Goal**: Teacher-student synchronization and community lick sharing.
- **Tech**: Supabase for progress tracking, PWA for offline/mobile use.

### 5. Walking Bass Engine (Target & Approach)

- **Concept**: Teleological walking bass—every bar asks "Where is the next chord, and how do I get there smoothly?"
- **Goal**: Beat 4 as chromatic or dominant approach into the next bar’s root; Beat 1 anchor, Beats 2–3 bridge.
- **Tech**: WalkingBassEngine (tonal.js), 4-note line per bar, E1–G3 range.

### 6. Standards-Based Exercises (JazzKiller module)

- **Concept**: New **module inside JazzKiller** that runs timed exercises over the standards—scales, guide tones, arpeggios—in sync with playback and the chart.
- **Goal**: Student picks a standard (same JazzKiller library), chooses exercise type, plays in time; real-time evaluation; works for both mic and MIDI input.
- **Tech**: ChordScaleEngine, GuideToneCalculator, unified input adapter, StandardsExerciseEngine; JazzKiller chart + playback + standard picker (exercises as a view/panel/tab within JazzKiller).
- **Phase 15 extension**: **Error heatmaps** (per measure, per exercise type: Scales • Guide Tones • Arpeggios) on the lead sheet or dedicated panel; option to **record** a solo and get a **written transcription**; **AI analysis** of performance with advice and development suggestions (Gemini Nano / API).

### 7. Voice & Percussion Interactive (Sing & Clap)

- **Concept**: Hands-free interactive loops for Ear Training and Rhythm.
- **Goal**: Enable students to sing scale degrees/intervals and clap complex rhythms for real-time validation.
- **Tech**: SwiftF0 onset detection, frequency-to-degree mapping, low-latency mic stream integration in Functional Ear Training and Rhythm Architect.

### 8. Innovative Interactive Exercises (Ear + Rhythm)

- **Concept**: A **new module** of exercises that leverage sub-cent pitch, millisecond timing, and functional harmony to teach harmonic anticipation, expressive intonation, and micro-timing feel.
- **Ear (Pitch-Centric)**: Ghost Note Match (fill missing note → ghost becomes pro sample); Intonation Heatmap (drone + scale → green/blue/red by tuning); Voice-Leading Maze (ii–V–I guide tones only, track mutes until correct).
- **Rhythm (Micro-Timing)**: Swing Pocket Validator (swing ratio + Pocket Gauge + Push/Lay Back ms feedback); Call and Response Rhythmic Mimicry (RMS overlay vs pro waveform); Ghost Rhythm Poly-Meter (3-over-4 with 5-cent pitch-stability win).
- **Tech**: SwiftF0/MPM + frequencyToNote, GuideToneCalculator, onset/RMS and high-resolution time; heatmap and waveform overlay UI.
- **Milestone**: `.planning/milestones/innovative-exercises/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

### 9. Dynamic Meter Change Playback

- **Concept**: Support **meter changes mid-song** (e.g. 4/4 → 3/4 at bar 17) so the player goes beyond a single time signature per tune.
- **Goal**: Time map (`meterChanges`: bar → signature), Transport scheduling at bar boundaries, walking bass and drums adapting to current meter (e.g. waltz feel in 3/4), and lead sheet with variable bar width and meter markers.
- **Tech**: Optional `meterChanges` in song data, `Tone.Transport.schedule` for signature at `${bar-1}:0:0`, meter-for-bar resolution in playback loop and UI, `meterTranslator` extended for per-bar meter.
- **Milestone**: `.planning/milestones/dynamic-meter-playback/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

### 10. Creative Jazz Trio Playback Modelling

- **Concept**: Push the limits of **creatively modelling jazz trio playing** in the playback engine: band behavior adapts to **place in the cycle**, **song type**, **inter-instrument interaction**, and **space for the soloist** (especially in ballads).
- **Goal**: Rhythm section that feels like a real trio: different playing styles per song type (ballad vs medium swing vs Latin); explicit place-in-cycle (intro / head / solo choruses / out head / ending) driving density and space; more interaction (piano responds to bass/drums, drums to piano, bass to comping); in ballads and solo sections, leave clear space for the soloist (sparser comping, longer sustains, fewer hits).
- **Tech**: Place-in-cycle resolver (loop + section + measure → role); song-style matrix (Ballad, Medium Swing, Up-tempo, Latin, Bossa, Waltz) driving RhythmEngine/DrumEngine/WalkingBassEngine and ReactiveCompingEngine; “soloist space” mode (density cap, sustain bias, bass pedal/sparse options); cross-instrument signals (e.g. piano density → drums simplify, bass variation probability) in useJazzBand.
- **Milestone**: `.planning/milestones/jazz-trio-playback/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

### 11. SwiftF0 Pitch Analysis Speed Optimization

- **Concept**: Make SwiftF0 pitch analysis **a little bit faster** so real-time feedback feels snappier and the system stays within a sub-10 ms latency budget.
- **Goal**: Reduce per-frame inference time and pipeline cost (preprocessing, tensor lifecycle, worker scheduling) without changing model accuracy or instrument profiles.
- **Tech**: Optional timing baseline; zero allocations in inference hot path; preprocessing cost reduction; poll interval aligned with inference; SwiftF0Worker, useHighPerformancePitch, useITMPitchStore unchanged from consumer perspective.
- **Milestone**: `.planning/milestones/swiftf0-speed/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

### 12. Soloist-Responsive Playback (Call-and-Response)

- **Concept**: **Experimental feature** (toggle): the playback engine **listens** to the soloist via SwiftF0 and **adjusts** in real time—more space when the user plays more and faster, more backing when the user plays less.
- **Goal**: Band breathes with the soloist: soloist activity derived from mic/SwiftF0 drives band density/space; toggle off = current Phase 18 behaviour; toggle on = call-and-response feel.
- **Tech**: Toggle (default off); soloist activity from useITMPitchStore / useHighPerformancePitch (onset + pitch presence → 0–1); useJazzBand reads soloist activity when on and drives effective activity/density; same trio engines (ReactiveCompingEngine, DrumEngine, BassRhythmVariator) receive effective activity.
- **Milestone**: `.planning/milestones/soloist-responsive-playback/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md).

## Key Decisions

| Decision | Rationale | Status |
| :--- | :--- | :--- |
| **Zustand for Scoring** | Centralized, performant state management for real-time microphone analysis. | [Decided] |
| **Local-First AI** | Use Gemini Nano for instantaneous narration and performance critique feedback. | [Decided] |
| **PWA over Native** | Maximize accessibility on iPads and phones without app store friction. | [Decided] |
| **SwiftF0 (2026 SOTA)** | Use Neural Pitch detection (SwiftF0) for jazz-proof overtone handling and ultra-low latency. | [Decided] |
| **Audio Worklets** | Decouple pitch math from the UI thread using SharedArrayBuffer for 120Hz smoothness. | [Decided] |
| **Supabase for Backend** | Reliable, real-time database for teacher dashboards and lick sharing. | [Proposed] |
| **Template-Based Comping** | Switch from mathematical voicing generation to Grip-Libraries and Phrase-Templates for musicality. | [Decided] |

## Out of Scope

- Direct VR/AR implementation (focus on PWA first).
- Professional DAW integration (keep it a teaching/practice tool).
- Multitrack recording/exporting (focus on real-time feedback).
