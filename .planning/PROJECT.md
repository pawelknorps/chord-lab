# Project: Jazz Evolution Sound Engine & Comping Algorithm

## Vision
Transform the existing MIDI-style playback into a premium, interactive "Virtual Jazz Trio" that feels like a real band. The engine will utilize high-quality samples and a complex behavioral algorithm to simulate professional jazz performance (Red Garland, Ron Carter, Nate Smith styles).

## Core Value Proposition
- **Authenticity**: Professional-grade jazz voicings (Rootless, Quartal) and rhythms.
- **Interactivity**: Simulated "listening" between instruments where drum accents respond to piano comping rhythms.
- **Dynamic feel**: Evolution of the performance based on tempo, vibe, and historical styles.

## High-Level Requirements
- **AUD-01**: Support for high-quality multi-sampled Piano and Bass.
- **ALG-01**: Implementation of "Ron Carter" style walking bass (chromatic approaches, scale connectivity, rhythmic variations).
- **ALG-02**: Pro-level Piano comping engine supporting "Red Garland" block chords and "Herbie Hancock" quartal voicings.
- **ALG-03**: Interactive Drum engine that adapts snare/kick accents based on the piano's rhythmic vocabulary.
- **FEEL-01**: Humanization engine (dynamic velocity curves, micro-timing pushes/pulls).
- **ARCH-01**: Preservation of the legacy algorithm as a fallback mode.

## Key Decisions
| Decision | Rationale | Status |
| :--- | :--- | :--- |
| **Rootless Voicings** | Industrial standard for jazz piano to avoid clashing with the bass. | Validated |
| **Interactive Accenting** | Drums responding to piano hits creates the "real band" cohesion. | Validated |
| **Multi-Style Engine** | Allows different standards to trigger historically appropriate comping styles. | Validated |

## Out of Scope
- Real-time user input listening (focus is on backing track generation).
- Multi-track exporting (for now).
