# Tech Stack

## Core Framework

- **Runtime**: Node.js (build/dev); Browser (ES2022 target)
- **Language**: TypeScript (`~5.9.3`)
- **Framework**: React (`^19.2.0`)
- **Bundler**: Vite (`^7.2.4`)
- **Package name**: `pawelsonik` (private; project is Chord Lab / ITM)

## Styling

- **CSS Engine**: Tailwind CSS 4 (`@tailwindcss/vite`, `^4.1.18`)
- **Animation**: Framer Motion (`framer-motion`, `^12.33.0`)
- **Icons**: FontAwesome (`@fortawesome/*`), Lucide React (`lucide-react`)
- **UI Components**: Radix UI primitives (`@radix-ui/*`), custom components in `src/components/ui` (shadcn-style).

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
- **Pitch**: `pitchy` (^4.1.0), SwiftF0 via ONNX (`onnxruntime-web`, `^1.24.1`)

## 3D & Visualization

- **3D Engine**: Three.js (`three`, `^0.182.0`)
- **React Bindings**: React Three Fiber (`@react-three/fiber`, `@react-three/drei`)

## Utilities

- **Machine Learning**: `ml5` (`^1.0.1`)
- **Routing**: React Router DOM (`^7.13.0`)
- **Internationalization**: i18next (`i18next`, `react-i18next`, `i18next-browser-languagedetector`)
- **File Parsing**: `ireal-reader` (iReal Pro files)
- **UI Helpers**: `class-variance-authority`, `tailwind-merge`, `clsx`, `cmdk`
- **Device Detection**: `react-device-detect`
- **Scrolling**: `react-scroll`
- **Spaced Repetition**: `ts-fsrs` (^5.2.3)
- **DnD**: `@dnd-kit/core`, `@dnd-kit/utilities`

## Testing & Linting

- **Test Runner**: Vitest (`vitest`, `^4.0.18`) — `src/**/*.test.{ts,tsx}`, jsdom, no React Testing Library in package.json
- **Linter**: ESLint 9 flat config (`eslint.config.js`), TypeScript ESLint, react-hooks, react-refresh
- **Package Fixes**: `patch-package`

## Rationale

- **React 19 & Tailwind 4**: Modern stack for performance and latest features.
- **Zustand + Signals**: Coarse global state (Zustand) plus high-frequency updates (Signals) to avoid re-renders in audio/visualizers.
- **Three.js**: Used for visualizations (e.g. Tonnetz).
- **SwiftF0 + Worklets**: Pitch detection off main thread; SharedArrayBuffer requires COOP/COEP headers (configured in Vite server/preview).
