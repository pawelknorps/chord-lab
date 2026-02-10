# Tech Stack

## Core Framework

- **Runtime**: Node.js (Version defined by environment, likely >=20 for recent tools)
- **Language**: TypeScript (`~5.9.3`)
- **Framework**: React (`^19.2.0`)
- **Bundler**: Vite (`^7.2.4`)

## Styling

- **CSS Engine**: Tailwind CSS 4 (`@tailwindcss/vite`, `^4.1.18`)
- **Animation**: Framer Motion (`framer-motion`, `^12.33.0`)
- **Icons**: FontAwesome (`@fortawesome/*`), Lucide React (`lucide-react`)
- **UI Components**: Radix UI primitives (`@radix-ui/react-*`), custom components in `components/ui` (shadcn/ui style).

## State Management

- **Global Store**: Zustand (`zustand`, `^5.0.11`)
- **Fine-grained Reactivity**: Preact Signals (`@preact/signals-react`, `^3.8.0`)

## Audio & Music Theory

- **Audio Engine**: Tone.js (`tone`, `^15.1.22`)
- **Music Theory**: Tonal.js (`@tonaljs/*`)
- **Notation**: VexFlow (`vexflow`, `^5.0.0`)
- **Instruments**: `soundfont-player`, `tonejs-instrument-*` (Guitar, Harp)
- **MIDI**: `@tonejs/midi`, `@types/webmidi`
- **Chord Libraries**: `@techies23/react-chords`, `@tombatossals/chords-db`

## 3D & Visualization

- **3D Engine**: Three.js (`three`, `^0.182.0`)
- **React Bindings**: React Three Fiber (`@react-three/fiber`, `@react-three/drei`)

## Utilities

- **Machine Learning**: `ml5` (`^1.0.1`)
- **Routing**: React Router DOM (`^7.13.0`)
- **Internationalization**: i18next (`i18next`, `react-i18next`)
- **File Parsing**: `ireal-reader` (iReal Pro files)
- **UI Helpers**: `class-variance-authority`, `tailwind-merge`, `clsx`, `cmdk`
- **Device Detection**: `react-device-detect`
- **Scrolling**: `react-scroll`

## Testing & Linting

- **Test Runner**: Vitest (`vitest`, `^4.0.18`)
- **Linter**: ESLint (`eslint`, `^9.39.1`)
- **Package Fixes**: `patch-package`

## Rationale

The stack leans heavily on modern, performance-oriented libraries.
- **React 19 & Tailwind 4**: Bleeding edge, implying a desire for the latest features and performance optimizations.
- **Zustand + Signals**: A sophisticated hybrid approach. Zustand for coarse global state, Signals for high-frequency updates (critical for audio/music apps to avoid re-renders).
- **Three.js**: Used for visualizations, likely the Tonnetz or specific 3D chord representations.
