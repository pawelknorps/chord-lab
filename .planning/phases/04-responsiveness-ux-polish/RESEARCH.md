# Research: Phase 4 – Responsiveness & UX Polish

## What we need to know to plan this phase well

### Layout & mobile (Step 10)

- **Breakpoints**: App uses Tailwind; default breakpoints (sm/md/lg/xl) are sufficient. Target 375px (iPhone SE) as minimum width for "no horizontal scroll."
- **Piano/Fretboard**: `UnifiedPiano` and `UnifiedFretboard` live in `src/components/shared/`. They may have fixed min-widths or internal overflow; fix at container level (max-w-full, overflow-x-auto) or scale content for small viewports.
- **12 modules**: Dashboard routes load one module per route; each module is responsible for its own layout. Audit = open each route at 375px and 768px and note overflow.

### Lazy loading (Step 11)

- **Current**: `App.tsx` uses `React.lazy()` and `<Suspense fallback={<LoadingScreen label="..." />}>`. Replacing the fallback with a skeleton component is sufficient; no change to lazy boundaries unless we add prefetch.
- **Flash**: Optional minimum display time (e.g. 150ms) for skeleton avoids flicker on fast loads; can be added later.

### CONCERNS.md (Step 12)

- **High-priority for UX**: Horizontal scroll (Step 10), lazy-load jank (Step 11), any user-facing crash or audio glitch. Lower priority for this phase: duplication, state complexity, missing tests (defer to Phase 5 or later).
- **Tone.js / WebAudio**: If CONCERNS mention "Direct Tone.js Access" or cleanup issues, prioritize one module (e.g. ChordLab or JazzKiller) for suspend/cleanup on route change.

## Summary

- Use 375px as mobile target; fix overflow at shell and Piano/Fretboard first.
- Skeleton = new shared component + swap Suspense fallback in App.tsx.
- Resolve 1–2 high-priority CONCERNS (layout/audio) and document the rest.
