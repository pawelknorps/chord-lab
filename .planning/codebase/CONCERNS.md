# Concerns & Technical Debt

**Phase 4 (Responsiveness & UX Polish) resolutions**: Horizontal scroll on mobile (Chord Lab Piano/Fretboard and main shell) addressed via `min-w-0`/`max-w-full` on Dashboard outlet and ChordLabDashboard wrapper; lazy-load UX improved with ModuleSkeleton and module-specific fallbacks. See `.planning/phases/04-responsiveness-ux-polish/PRIORITIES.md`.

---

## Dependencies

- **Bleeding Edge**: React 19 and Tailwind 4 are very new. Documentation and community patterns might be scarce or changing.
- **Direct Tone.js Access**: Components might be accessing Tone.js directly instead of through a managed service, leading to potential timing or cleanup issues.

## Architecture

- **Duplication**: `src/modules` contain their own component libraries (`ChordBuildr/components/ui`) which might duplicate `src/components/ui`. This fragmentation makes consistent design updates harder.
- **State Complexity**: Mixing Signals and Zustand is powerful but increases cognitive load. Developers need to know when to use which.
- **Routing & Module Bloat**: The application has a large and growing number of modules (12+). The main router in `App.tsx` handles all of them, which could lead to scalability issues if not managed with deep linking or a more dynamic module loading system.
- **Lazy Loading Strategy**: While lazy loading is used, there is no explicit prefetching strategy for heavy modules, which may lead to noticeable delays when navigating between different labs. *(Phase 4: ModuleSkeleton + module-specific fallbacks added to reduce perceived jank.)*

## Performance

- **3D & Audio**: Combining Three.js (WebGL) with Tone.js (WebAudio) on the main thread can cause jank if not careful.
- **Bundle Size**: `soundfont-player` and `tonejs-instrument-*` are used across many modules. Ensuring shared instances and avoiding duplicate sample loading is critical.

## Maintenance

- **Legacy Structure**: Presence of `src/legacy` (mentioned in conversations) indicates incomplete refactors.
- **Component Bloat**: Some components like `ChordPianoComponent` or `Tonnetz` might be becoming "God Components" with too much responsibility.

## Missing Tests

- **Coverage**: Core logic seems tested, but complex UI interactions in modules (like dragging notes in ChordBuildr) likely lack automated tests.
