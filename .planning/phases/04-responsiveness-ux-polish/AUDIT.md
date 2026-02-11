# Phase 4: Layout Audit Checklist (Step 10)

Target viewport: 375px and 320px (mobile). Check: overflow-x, min-width on wide content, flex/grid forcing horizontal scroll.

## Main Sections (REQ-RESP-02, REQ-RESP-03)

| Section | Scope | Horizontal scroll? | Note |
|---------|-------|--------------------|------|
| **Workbench** | Dashboard + ChordLab (default home) | To verify | Nav, slots, Piano, Fretboard, Progression Builder, WorkbenchAiPanel at 375px/320px. |
| **Standards** | JazzKiller (`/jazz-standards`) | To verify | Song list, lead sheet, practice studio, drill panels, Smart Lesson. |

## All Exercises (REQ-RESP-01)

| Module / Page | Horizontal scroll issue? | Note |
|---------------|--------------------------|------|
| ChordLab | Yes (Piano/Fretboard row) | Container had min-w-max; fixed with max-w-full + overflow-x-auto on wrapper, min-w-0 on flex child. |
| ChordBuildr | To verify | Has own piano/fretboard; may need same pattern. |
| BiTonalSandbox | To verify | |
| GripSequencer | To verify | |
| Tonnetz | To verify | |
| NegativeMirror | To verify | |
| BarryHarris | To verify | |
| RhythmArchitect | To verify | |
| FunctionalEarTraining | To verify | |
| CircleChords | To verify | |
| MidiLibrary (page) | To verify | |
| JazzKiller (Standards) | To verify | |
| ProgressionsPage | To verify | |

**Shell**: App.tsx and Dashboard.tsx — main content area given `min-w-0` and `overflow-hidden` so child modules cannot force body scroll. Outlet wrapper has `overflow-auto` and `min-w-0`.

**Phase 4**: Piano/Fretboard in Chord Lab and main shell constraints applied.  
**Phase 4b**: Full audit of Workbench, Standards, and all exercises per REQ-RESP-01–05; resize to 375px and 320px, fix overflow, document completion.
