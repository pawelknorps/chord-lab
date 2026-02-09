# Project: Advanced Ear Training Levels

## Vision
Expand the **Functional Ear Training** module with advanced music theory exercises. These levels will focus on sophisticated structures like Secondary Dominants, Modal Interchange, and Upper Structure Triads, with a strict adherence to music theory foundations, including pedagogical correctness and enharmonic accuracy.

## Core Value
Provide professional-grade ear training that bridges the gap between basic interval/chord recognition and practical jazz/contemporary theory application.

## Requirements

### Validated
- ✓ Base Functional Ear Training module structure
- ✓ Zustand state management for scoring and difficulty
- ✓ Integration with MIDI for live input
- ✓ Basic levels (Tendency, Modulation, Bass, etc.)

### Active
- [ ] **Level: Secondary Dominants** (V/V, V/ii, V/vi, etc.)
- [ ] **Level: Modal Interchange** (Borrowing from parallel minor/modes)
- [ ] **Level: Upper Structure Triads** (Triads over dominant or tonic shells)
- [ ] **Theory Foundation Overhaul**: Ensure all generated exercises use correctly spelled enharmonics (e.g., C# vs Db depending on functional context).
- [ ] **Dual Input Support**: All new levels must support both UI buttons and MIDI keyboard input for answers.

### out of scope
- [ ] Notation-based input (drawing notes on staff) — keeping it to buttons and MIDI for v1.
- [ ] Advanced Microtonal ear training.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Module Integration | Keep within `FunctionalEarTraining` to leverage existing scoring/UI | — Confirmed |
| Tonal.js | Use for all background theory calculations | — Confirmed |
| Button-First UI | Most accessible for non-piano players while MIDI is optional | — Confirmed |

---
*Last updated: 2026-02-09*
