# Phase 4: High-Priority CONCERNS (Step 12)

From [CONCERNS.md](../../codebase/CONCERNS.md). Picked 2–3 user-facing or layout items for this phase.

| Priority | Concern | Source | Status |
|----------|---------|--------|--------|
| 1 | **Horizontal scroll on mobile** (Piano/Fretboard, main shell) | Layout / UX | **Resolved** — ChordLabDashboard wrapper given `min-w-0`/`max-w-full`; Dashboard outlet given `min-w-0`; Piano/Fretboard panel keeps `overflow-x-auto` so wide content scrolls inside the panel. |
| 2 | **Lazy-load jank** (plain "Loading Module..." flash) | Lazy Loading Strategy | **Resolved** — ModuleSkeleton component + module-specific labels for all Suspense fallbacks in App.tsx. |
| 3 | **Direct Tone.js access** (timing/cleanup) | Dependencies | Documented for follow-up; not fixed in Phase 4. |

Resolved items are noted in CONCERNS.md with a "Phase 4" resolution note.
