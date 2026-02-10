# Research: Phase 1 (Foundation)

## UI Strategy
- **Framework**: Standardizing on **Radix UI** primitives wrapped in Tailwind 4 classes.
- **Location**: `src/components/ui` will follow the standard ShadCN/UI structure.
- **Migration**: `ChordBuildr` already has these; they will be the base for the rest of the application.

## Audio Strategy
- **The Problem**: Currently, `AudioManager` loads Piano and EPiano on init. If a module needs a Harp or Guitar, it might be loading it independently or `AudioManager` grows too large.
- **The Solution**: `InstrumentService` will use a "Load-on-Demand" pattern. Modules will request an instrument by key (e.g., `piano-standard`, `guitar-nylon`). 
- **Sample Management**: High-quality samples should be hosted on a CDN (currently using `tonejs.github.io/audio/salamander/`) or served from `/public/audio/`.

## Performance Monitoring
- **Metrics**:
    - **Re-renders**: Use a wrapper that increments a Signal on every render cycle.
    - **Audio Latency**: Tone.js provides some timing info, but primarily we want to monitor `cpuUsage`.
- **UI**: A small floating HUD in the bottom-right corner of the development build.

## Expected Challenges
- **Import Hell**: Moving `ui` components will require updating many relative paths in `ChordBuildr`.
- **Tone.js Lifecycle**: Ensuring `InstrumentService` correctly disposes of instruments when no modules are using them to free up memory.
