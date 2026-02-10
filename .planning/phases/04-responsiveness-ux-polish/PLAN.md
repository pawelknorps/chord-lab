---
description: Phase 4 - Responsiveness & UX Polish (Steps 10–12)
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/components/layout/Dashboard.tsx
  - src/index.css
  - src/modules/ChordLab/ChordLab.tsx
  - src/components/shared/UnifiedPiano.tsx
  - src/components/shared/UnifiedFretboard.tsx
  - .planning/STATE.md
autonomous: false
---

# Plan: Phase 4 – Responsiveness & UX Polish

**Roadmap**: Phase 4 (Steps 10–12)  
**Goal**: Layout audit for all modules, fix mobile horizontal scrolling (especially Piano/Fretboard), smooth lazy-loading with skeleton loaders, resolve high-priority CONCERNS.md items.

## Phase Scope (from ROADMAP.md)

- **Step 10**: Layout audit for all 12 modules. Fix horizontal scrolling on mobile (especially for Piano/Fretboard).
- **Step 11**: Smooth out lazy-loading transitions with module-specific skeleton loaders.
- **Step 12**: Resolve high-priority bugs identified in CONCERNS.md.

---

## Wave 1: Layout audit & mobile horizontal scroll (Step 10)

<task id="step10-audit">
Audit layout and overflow for all 12 modules:
- List: ChordLab, ChordBuildr, BiTonalSandbox, GripSequencer, Tonnetz, NegativeMirror, BarryHarris, RhythmArchitect, FunctionalEarTraining, CircleChords, MidiLibrary (page), JazzKiller, ProgressionsPage.
- For each, check: `overflow-x`, `min-width` on wide content, flex/grid that forces horizontal scroll on narrow viewports.
- Document findings in a short checklist (module name, issue yes/no, note).
</task>

<task id="step10-piano-fretboard">
Fix horizontal scrolling for Piano and Fretboard in Chord Lab (called out in roadmap):
- Ensure `UnifiedPiano` and `UnifiedFretboard` (or equivalent in ChordLab) use responsive width (e.g. `max-w-full`, `overflow-x-auto` with constrained container, or scale down on small screens).
- Verify ChordLab layout (slots, piano, fretboard) does not cause page-level horizontal scroll on mobile (e.g. 375px width).
</task>

<task id="step10-dashboard-app">
Review `Dashboard.tsx` and `App.tsx` for viewport and overflow:
- Ensure main content area and route outlet are constrained (e.g. `min-w-0`, `overflow-hidden` where appropriate) so child modules cannot force body scroll.
- Add or adjust global utility (e.g. `.no-horizontal-scroll`) if needed and apply to main shell.
</task>

**Verification (Wave 1)**  
- No horizontal scroll on 375px viewport when Chord Lab is open with Piano and Fretboard visible.  
- Audit checklist completed and at least Piano/Fretboard fixes applied.

---

## Wave 2: Lazy-loading skeleton loaders (Step 11)

<task id="step11-skeleton-component">
Create a reusable skeleton loader component (e.g. `src/components/shared/ModuleSkeleton.tsx`):
- Simple placeholder: logo/title area + subtle pulse animation, optional module-specific label.
- Use existing design tokens (e.g. `--bg-panel`, `--text-muted`) so it matches the app.
</task>

<task id="step11-suspense-fallbacks">
Replace generic "Loading Module..." text in `App.tsx` Suspense fallbacks with module-specific skeletons:
- Pass a label or use `ModuleSkeleton` with the route name (e.g. "Jazz Standards", "Chord Lab", "Ear Training").
- Ensure fallback is visible for at least 100–200ms to avoid flash (optional delay or minimum display time).
</task>

**Verification (Wave 2)**  
- Every lazy route shows a skeleton (or branded placeholder) instead of plain "Loading Module...".  
- No layout shift when the real module mounts if possible.

---

## Wave 3: High-priority CONCERNS (Step 12)

<task id="step12-prioritize">
From CONCERNS.md, pick 2–3 high-priority items that are bugs or user-facing regressions (not only tech debt). Examples: direct Tone.js access causing timing/cleanup issues, horizontal scroll, or a specific module crash. Document in this phase dir as `PRIORITIES.md` (short list with link to CONCERNS).
</task>

<task id="step12-fix">
Implement fixes for the chosen high-priority items:
- Prefer one fix per concern (e.g. one PR for Tone cleanup, one for a layout fix).
- Update CONCERNS.md to mark resolved items or add "Phase 4" resolution note.
</task>

**Verification (Wave 3)**  
- PRIORITIES.md exists and lists 2–3 items.  
- At least one high-priority concern is resolved and noted in CONCERNS.md.

---

## Phase verification

- **Step 10**: Layout audit done; Piano/Fretboard and main shell do not cause horizontal scroll on mobile.
- **Step 11**: All lazy-loaded modules use a skeleton (or equivalent) fallback.
- **Step 12**: At least one high-priority CONCERNS.md item resolved; rest documented for follow-up.

## Next steps

After execution, update `.planning/STATE.md`: set Phase 4 progress, add "Recently Completed" for Steps 10–12, and move "Currently Working On" to Phase 5 or next milestone.
