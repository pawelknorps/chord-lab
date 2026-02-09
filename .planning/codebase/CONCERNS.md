# Concerns & Technical Debt

## Dependencies
- **Bleeding Edge**: React 19 and Tailwind 4 are very new. Documentation and community patterns might be scarce or changing.
- **Direct Tone.js Access**: Components might be accessing Tone.js directly instead of through a managed service, leading to potential timing or cleanup issues.

## Architecture
- **Duplication**: `src/modules` contain their own component libraries (`ChordBuildr/components/ui`) which might duplicate `src/components/ui`. This fragmentation makes consistent design updates harder.
- **State Complexity**: Mixing Signals and Zustand is powerful but increases cognitive load. Developers need to know when to use which.

## Performance
- **3D & Audio**: Combining Three.js (WebGL) with Tone.js (WebAudio) on the main thread can cause jank if not careful.
- **Bundle Size**: `soundfont-player` and `tonejs-instrument-*` can be heavy if large samples are bundled.

## Maintenance
- **Legacy Structure**: Presence of `src/legacy` (mentioned in conversations) indicates incomplete refactors.
- **Component Bloat**: Some components like `ChordPianoComponent` or `Tonnetz` might be becoming "God Components" with too much responsibility.

## Missing Tests
- **Coverage**: Core logic seems tested, but complex UI interactions in modules (like dragging notes in ChordBuildr) likely lack automated tests.
