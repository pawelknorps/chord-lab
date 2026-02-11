# Research: Phase 4b – Full Responsive Audit (Workbench, Standards, All Exercises)

**Roadmap**: Phase 4b (Steps 10b–10d)  
**Goal**: Ensure Workbench, Standards (JazzKiller), and every exercise module render well on all screen sizes including mobile (375px, 320px). REQ-RESP-01–05.

---

## What We Need to Know to Plan This Phase Well

### 1. Shell & Constraint Patterns

- **App.tsx**: Root has `overflow-hidden`; routes render inside `div.flex-1.min-h-0.overflow-hidden`.
- **Dashboard.tsx**: `main` has `flex-1 flex flex-col ... overflow-hidden`; outlet wrapper has `flex-1 min-w-0 overflow-auto`. `min-w-0` prevents flex children from forcing horizontal scroll. Sidebar auto-collapses at 1024px; mobile menu (`mobileOpen`) for nav.
- **Pattern**: To prevent body-level horizontal scroll, every scrollable content chain needs `min-w-0` on flex children and `overflow-x-auto` (or `overflow-auto`) on the scroll container. Wide content (Piano, Fretboard, tables) should scroll **inside** a panel, not at body level.

### 2. Known Problem Areas (from grep and AUDIT)

| Area | Issue | Fix Pattern |
|------|-------|-------------|
| **ChordBuildr** | `ChordBuilderWorkspace`: `overflow-x-auto` + `min-w-max` on inner div → may cause page scroll if parent lacks `min-w-0`. | Ensure wrapper has `max-w-full min-w-0`; inner `overflow-x-auto` keeps scroll inside. |
| **PositionsLevel** (Ear Training) | `min-w-[800px]` on inner content. | Parent already has `overflow-x-auto no-scrollbar`; verify parent has `max-w-full min-w-0`. |
| **FretboardLevel** | Similar: `overflow-x-auto no-scrollbar` on parent. | Same check. |
| **InstrumentMappingLevel** | `overflow-x-auto no-scrollbar` present. | Verify containment. |
| **MidiLibrary** | `min-w-[300px]`, `min-w-[160px]` on layout. | At 320px these may cause overflow; use `min-w-0` or responsive breakpoints. |
| **ChordLab** | Piano/Fretboard row; Phase 4 partially fixed via ChordLabDashboard wrapper. | Re-verify at 375px and 320px. |
| **JazzKiller** | LeadSheet `max-w-5xl`, transpose bar `overflow-x-auto`; DrillDashboard/BarRangeDrill use `w-[calc(100vw-2rem)]` (mobile-friendly). | Song list + lead sheet + practice panels need audit at 320px. |
| **PracticeTips** (ChordLab) | `fixed left-0` panel `max-w-xs md:max-w-sm`; may overlap on very narrow. | Check visibility and tap targets. |
| **SmartLessonPane** | `w-full lg:max-w-md`; full-width on mobile. | Verify no horizontal overflow. |

### 3. Breakpoints & Targets

- **Tailwind**: sm 640px, md 768px, lg 1024px, xl 1280px.
- **Target viewports**: 320px (narrow phones), 375px (iPhone SE), 768px (tablet).
- **Success**: No `overflow-x: scroll` on `body` or main content at 320px and 375px; all controls readable and tappable (min 44px touch target where possible).

### 4. Module Entry Points (for audit order)

| Route | Module | Key Components |
|-------|--------|-----------------|
| `/` | Workbench (ChordLab default) | ChordLab.tsx, ChordLabDashboard (if used), ProgressionBuilder, UnifiedPiano, UnifiedFretboard, WorkbenchAiPanel |
| `/jazz-standards` | Standards (JazzKiller) | JazzKillerModule, LeadSheet, PracticeExercisePanel, DrillDashboard, BarRangeDrill, SmartLessonPane |
| `/progressions` | ProgressionsPage | ProgressionsPage |
| `/bi-tonal` | BiTonalSandbox | BiTonalSandbox |
| `/tonnetz` | Tonnetz | Tonnetz |
| `/negative-harmony` | NegativeMirror | NegativeMirror |
| `/circle-chords` | CircleChords | CircleChordsModule |
| `/functional-ear-training` | FunctionalEarTraining | FunctionalEarTraining + levels |
| `/rhythm-architect` | RhythmArchitect | RhythmArchitect + SubdivisionPyramid, etc. |
| `/barry-harris` | BarryHarris | BarryHarris |
| `/grips` | GripSequencer | GripSequencer |
| `/midi-library` | MidiLibrary | MidiLibrary |
| ChordBuildr | (separate route if exists) | ChordBuilderWorkspace, ChordBuildrModule |

### 5. ChordLabDashboard vs ChordLab

- **ChordLabDashboard** (`src/components/ChordLabDashboard.tsx`): Wrapper used when ChordLab is rendered as default Workbench view. Phase 4 fix: `min-w-0`/`max-w-full` on wrapper; Piano/Fretboard panel `overflow-x-auto`.
- **ChordLab** (`src/modules/ChordLab/ChordLab.tsx`): Main Chord Lab UI; contains slots, ProgressionBuilder, etc. Renders inside Dashboard outlet.

### 6. JazzKiller Layout Structure

- Song list (left or top on mobile?)
- Lead sheet (center; `max-w-5xl`; may need scroll)
- Practice studio / drill panels (overlays: DrillDashboard, BarRangeDrill, PracticeExercisePanel)
- SmartLessonPane (slide-in panel `w-full lg:max-w-md`)

At 320px: song list + lead sheet layout must stack or collapse; overlays must not force body scroll.

### 7. Shared Components

- **UnifiedPiano**, **UnifiedFretboard**: Used in ChordLab (and possibly ChordBuildr). Both can be wide; must live in a container with `overflow-x-auto` and `max-w-full`.
- **ModuleSkeleton**: Already used for lazy-load fallbacks; no layout impact.

---

## Summary

1. **Shell**: Dashboard outlet already has `min-w-0 overflow-auto`; verify no module overrides this.
2. **Workbench**: ChordLab + ChordLabDashboard; re-verify Piano/Fretboard, ProgressionBuilder, WorkbenchAiPanel FAB at 375px and 320px.
3. **Standards**: JazzKiller; audit song list, lead sheet, drill panels, SmartLessonPane.
4. **Exercises**: Systematic visit of each route at 375px and 320px; apply `min-w-0`, `max-w-full`, `overflow-x-auto` (inside panels) where overflow occurs.
5. **Fixed min-widths**: PositionsLevel `min-w-[800px]`, ChordBuildr `min-w-max`, MidiLibrary `min-w-[300px]` — contain in scrollable wrappers, never let them expand body.
