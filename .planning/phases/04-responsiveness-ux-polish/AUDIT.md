# Phase 4: Layout Audit Checklist (Step 10)

Target viewport: 375px and 320px (mobile). Check: overflow-x, min-width on wide content, flex/grid forcing horizontal scroll.

## Main Sections (REQ-RESP-02, REQ-RESP-03)

| Section | Scope | Horizontal scroll? | Note |
|---------|-------|--------------------|------|
| **Workbench** | Dashboard + ChordLab (default home) | Fixed | min-w-0 on Dashboard main; ChordLab root containment; ChordLabDashboard min-w-0 max-w-full; Piano/Fretboard overflow-x-auto. Phase 4b Wave 1. |
| **Standards** | JazzKiller (`/jazz-standards`) | Fixed | min-w-0 on root + main content; LeadSheet overflow-auto, min-w-0; DrillDashboard/BarRangeDrill use w-[calc(100vw-2rem)]. Phase 4b Wave 2. |

## All Exercises (REQ-RESP-01)

| Module / Page | Horizontal scroll issue? | Note |
|---------------|--------------------------|------|
| ChordLab | Fixed | Phase 4 + 4b: ChordLabDashboard min-w-0 max-w-full; Piano/Fretboard overflow-x-auto. |
| ChordBuildr | Fixed | min-w-0, max-w-full on root; overflow-x-auto max-w-full on Piano container. Phase 4b. |
| BiTonalSandbox | Fixed | min-w-0 on root. Phase 4b. |
| GripSequencer | OK | Already has min-w-0, overflow-x-auto. Phase 4b verified. |
| Tonnetz | Fixed | min-w-0 on root. Phase 4b. |
| NegativeMirror | Fixed | min-w-0 on root. Phase 4b. |
| BarryHarris | Fixed | min-w-0 on root. Phase 4b. |
| RhythmArchitect | Fixed | min-w-0 on root, main, max-w-6xl. Phase 4b. |
| FunctionalEarTraining | Fixed | min-w-0 on root; PositionsLevel overflow-x-auto max-w-full; inner px-4. Phase 4b. |
| CircleChords | Fixed | min-w-0 w-full max-w-full on root. Phase 4b. |
| MidiLibrary (page) | Fixed | min-w-0 on root + inner; min-w-[200px] on search. Phase 4b. |
| JazzKiller (Standards) | Fixed | Wave 2: min-w-0, LeadSheet overflow-auto. |
| ProgressionsPage | Fixed | min-w-0 on both view containers. Phase 4b. |

**Shell**: App.tsx and Dashboard.tsx — main content area given `min-w-0` and `overflow-hidden` so child modules cannot force body scroll. Outlet wrapper has `overflow-auto` and `min-w-0`.

**Phase 4**: Piano/Fretboard in Chord Lab and main shell constraints applied.  
**Phase 4b**: Full audit of Workbench, Standards, and all exercises per REQ-RESP-01–05; resize to 375px and 320px, fix overflow, document completion.
