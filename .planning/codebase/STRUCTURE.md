# Directory Structure

## Root

- `vite.config.ts`: Build configuration.
- `package.json`: Dependencies.
- `tsconfig.json`: TypeScript configuration.
- `.eslintrc.cjs` / `eslint.config.js`: Linting rules.

## Source (`src/`)

### Core (`src/core/`)

The heart of the application, independent of specific UI modules.

The heart of the application, independent of specific UI modules.

- `audio/`: Global audio graph setup (Tone.js context).
- `drills/`: Logic for practice routines and exercises.
- `midi/`: MIDI export/import logic.
- `profiles/`: User profile and mastery data management.
- `routing/`: Application-level navigation logic.
- `services/`: Singleton services (AudioManager, JazzLibrary).
- `state/`: Global state management utilities.
- `store/`: Global state stores (Zustand).
- `theory/`: Pure functions for harmonic analysis and generation.

### Modules (`src/modules/`)

Vertical slices of functionality. Each folder corresponds to a major feature or "Lab".

Vertical slices of functionality. Each folder corresponds to a major feature or "Lab".

- `BarryHarris`: Chromatic approach notes and scale-of-6th concepts.
- `BiTonalSandbox/`: Experimentation with bitonality.
- `ChordBuildr/`: Interactive chord construction and discovery.
- `ChordLab/`: Likely the original/main module or a specific lab.
- `CircleChords/`: Circle of Fifths visualization.
- `FunctionalEarTraining/`: Ear training games.
- `GripSequencer/`: Fretboard-based sequencing.
- `JazzKiller/`: Jazz standard analysis and playback.
- `MidiLibrary/`: Browser for MIDI resources.
- `NegativeMirror/`: Negative harmony visualization.
- `RhythmArchitect/`: Polyrhythm and subdivision tools.
- `tonnetz/`: Isometric grid visualization of harmony.

### UI & Shared

- `pages/`: Page components mapped to routes.

- `pages/`: Page components mapped to routes.
- `components/`: Generic UI components (likely ShadCN/Radix wrappers).
- `shared/`: Shared domain components (e.g., Virtual Piano, Fretboard).
- `context/`: React Context providers for Audio and MIDI.
- `utils/`: Legacy or general helper functions (`i18n.ts`, `standards.ts`).
- `hooks/`: Custom React hooks (e.g., `useAudio`, `useWindowSize`).

### Assets
- `index.css`: Tailwind imports and global styles.
- `App.tsx`: Main layout and router.
- `main.tsx`: Entry point.
