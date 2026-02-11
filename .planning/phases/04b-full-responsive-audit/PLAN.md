---
description: Phase 4b - Full Responsive Audit (Workbench, Standards, All Exercises)
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/components/layout/Dashboard.tsx
  - src/components/ChordLabDashboard.tsx
  - src/modules/ChordLab/ChordLab.tsx
  - src/modules/JazzKiller/JazzKillerModule.tsx
  - src/modules/JazzKiller/components/LeadSheet.tsx
  - src/modules/JazzKiller/components/DrillDashboard.tsx
  - src/modules/JazzKiller/components/BarRangeDrill.tsx
  - src/modules/JazzKiller/components/SmartLessonPane.tsx
  - src/modules/ChordBuildr/ChordBuilderWorkspace.tsx
  - src/modules/FunctionalEarTraining/components/levels/PositionsLevel.tsx
  - src/modules/MidiLibrary/MidiLibrary.tsx
  - .planning/phases/04-responsiveness-ux-polish/AUDIT.md
  - .planning/STATE.md
autonomous: false
---

# Plan: Phase 4b – Full Responsive Audit (Workbench, Standards, All Exercises)

**Roadmap**: Phase 4b (Steps 10b, 10c, 10d)  
**Goal**: Ensure Workbench, Standards (JazzKiller), and every exercise module render well on all screen sizes including mobile. No horizontal scroll at 375px and 320px; all sections usable. REQ-RESP-01–05.

---

## Wave 1: Workbench Audit & Fixes (Step 10b)

<task id="step10b-verify-shell">
Verify main shell constraints:
- Open app at `/` with viewport 375px and 320px.
- Confirm `body` and main content area do not show horizontal scrollbar.
- If scroll appears: ensure `Dashboard` outlet div has `min-w-0` and `overflow-auto`; `App` root has `overflow-hidden`.
- Document in AUDIT.md.
</task>

<task id="step10b-workbench-chordlab">
Audit **Workbench** (Dashboard home, ChordLab at `/`):
- At 375px and 320px: ChordLab layout, chord slots, ProgressionBuilder, Piano, Fretboard.
- If ChordLabDashboard wraps ChordLab: verify wrapper has `min-w-0 max-w-full`; Piano/Fretboard panel uses `overflow-x-auto` so wide content scrolls inside panel.
- Check WorkbenchAiPanel FAB and panel (full-width on mobile) for overflow.
- Fix: add `min-w-0`, `max-w-full`, or `overflow-x-auto` to offending containers.
</task>

<task id="step10b-workbench-nav">
Verify Dashboard sidebar and mobile menu at 375px and 320px:
- Nav items accessible; mobile menu opens/closes; no horizontal overflow from sidebar.
- Language switcher and MidiSettings readable in collapsed/expanded states.
</task>

**Verification (Wave 1)**  
- No horizontal scroll on Workbench at 375px and 320px.  
- ChordLab slots, Piano, Fretboard, Progression Builder visible and usable.  
- AUDIT.md updated with Workbench status.

---

## Wave 2: Standards (JazzKiller) Audit & Fixes (Step 10c)

<task id="step10c-standards-song-list">
Audit JazzKiller song list and main layout at 375px and 320px:
- Song list visible and scrollable (vertical); no horizontal overflow.
- Main content area (lead sheet or empty state) constrained.
- Transpose bar (`overflow-x-auto`) scrolls inside its container, not body.
</task>

<task id="step10c-standards-lead-sheet">
Audit LeadSheet at 375px and 320px:
- `max-w-5xl` centers content; on narrow viewports ensure parent has `min-w-0` and lead sheet scrolls inside (overflow-x-auto) if content is wide.
- Chart/grid readable; no body scroll.
</task>

<task id="step10c-standards-drills">
Audit drill and practice panels (DrillDashboard, BarRangeDrill, PracticeExercisePanel, SmartLessonPane):
- Panels use `w-[calc(100vw-2rem)]` or similar for mobile; verify no overflow.
- SmartLessonPane `w-full lg:max-w-md`; check at 320px for overflow.
- Fix any panel that forces body horizontal scroll.
</task>

**Verification (Wave 2)**  
- Standards fully usable at 375px and 320px.  
- Song list, lead sheet, drill panels accessible without horizontal scroll.  
- AUDIT.md updated with Standards status.

---

## Wave 3: All Exercises Audit & Fixes (Step 10d)

<task id="step10d-exercises-chordbuildr">
Audit ChordBuildr (via deep link or ChordBuilderWorkspace if accessible):
- `overflow-x-auto` + `min-w-max` on inner div: ensure parent has `min-w-0 max-w-full`.
- Piano/guitar layout responsive; fix overflow.
</task>

<task id="step10d-exercises-bitonal-tonnetz-negative">
Audit BiTonalSandbox, Tonnetz, NegativeMirror at 375px and 320px:
- Check for min-width, overflow; apply containment fixes.
- Document in AUDIT.md.
</task>

<task id="step10d-exercises-barry-grips-rhythm">
Audit BarryHarris, GripSequencer, RhythmArchitect at 375px and 320px:
- GripSequencer has `min-w-0` and `overflow-x-auto`; verify.
- RhythmArchitect max-w-* containers; ensure parent min-w-0.
- Document and fix.
</task>

<task id="step10d-exercises-ear-training">
Audit FunctionalEarTraining and all levels at 375px and 320px:
- PositionsLevel `min-w-[800px]`: parent must have `overflow-x-auto` and `max-w-full min-w-0`.
- FretboardLevel, InstrumentMappingLevel: same pattern.
- IntervalsLevel, MelodyStepsLevel, others: check max-w-* and overflow.
- Fix and document.
</task>

<task id="step10d-exercises-circle-midi-progressions">
Audit CircleChords, MidiLibrary, ProgressionsPage at 375px and 320px:
- MidiLibrary `min-w-[300px]` and `min-w-[160px]`: may need responsive breakpoints or min-w-0.
- CircleChords circles use max-w; verify containment.
- Fix and document.
</task>

**Verification (Wave 3)**  
- All 11 exercise modules pass audit at 375px and 320px.  
- AUDIT.md completed with status for each module.

---

## Phase Verification

- **REQ-RESP-01**: All exercises render without horizontal scroll at 320px+.
- **REQ-RESP-02**: Workbench usable on mobile.
- **REQ-RESP-03**: Standards usable on mobile.
- **REQ-RESP-04**: Audit fixes applied (min-w-0, max-w-full, overflow-x-auto).
- **REQ-RESP-05**: Main shell constrains children; no body-level horizontal scroll.

## Next Steps

After execution:
1. Update `.planning/phases/04-responsiveness-ux-polish/AUDIT.md` with final status for all modules.
2. Update `.planning/STATE.md`: set Phase 4b progress, add "Recently Completed" for Steps 10b–10d.
3. Run `/gsd-execute-phase 4b` if not yet executed; or run manual verification (resize browser to 375px and 320px, visit each route).
