# Directory Structure

## Root
- `vite.config.ts`: Build configuration.
- `package.json`: Dependencies.
- `tsconfig.json`: TypeScript configuration.
- `.eslintrc.cjs` / `eslint.config.js`: Linting rules.

## Source (`src/`)

### Core (`src/core/`)
The heart of the application, independent of specific UI modules.
- `audio/`: Global audio graph setup (Tone.js context).
- `midi/`: MIDI export/import logic.
- `services/`: Singleton services (AudioManager, JazzLibrary).
- `store/`: Global state stores (Zustand).
- `theory/`: Pure functions for harmonic analysis and generation.

### Modules (`src/modules/`)
Vertical slices of functionality. Each folder corresponds to a major feature or "Lab".
- `ChordBuildr/`: Interactive chord construction and discovery.
- `JazzKiller/`: Jazz standard analysis and playback.
- `Tonnetz/`: Isometric grid visualization of harmony.
- `RhythmArchitect/`: Polyrhythm and subdivision tools.
- `FunctionalEarTraining/`: Ear training games.
- `MidiLibrary/`: Browser for MIDI resources.
- `CircleChords/`: Circle of Fifths visualization.
- `GripSequencer/`: Fretboard-based sequencing.
- `BiTonalSandbox/`: Experimentation with bitonality.
- `NegativeMirror/`: Negative harmony visualization.
- `ChordLab/`: Likely the original/main module or a specific lab.

### UI & Shared
- `pages/`: Page components mapped to routes.
- `components/`: Generic UI components (likely ShadCN/Radix wrappers).
- `shared/`: Shared domain components (e.g., Virtual Piano, Fretboard).
- `utils/`: Legacy or general helper functions (`i18n.ts`, `standards.ts`).
- `hooks/`: Custom React hooks (e.g., `useAudio`, `useWindowSize`).

### Assets
- `index.css`: Tailwind imports and global styles.
- `App.tsx`: Main layout and router.
- `main.tsx`: Entry point.
