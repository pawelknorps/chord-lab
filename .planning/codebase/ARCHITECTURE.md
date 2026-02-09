# System Architecture

## 🏛️ Design Pattern
- **Modular Monolith**: The application is organized into independent "Modules" under `src/modules/`. Each module encapsulates its own logic, state, and UI.
- **Shell & Dashboard**: `src/components/layout/Dashboard.tsx` serves as the main navigation shell, hosting individual modules within a router-based layout.

## 🔄 Data Flow
- **Global Context Providers**: `AudioProvider` and `MidiProvider` (in `src/context/`) wrap the entire application to provide shared access to the Web Audio engine (Tone.js) and MIDI input/output devices.
- **Module-specific Stores**: Most modules use **Zustand** stores (`use...Store.ts`) to manage their internal state and side effects.
- **Lazy Loading**: Heavy modules are lazily loaded in `App.tsx` using `React.lazy` to optimize initial bundle size and LCP.

## 🌊 Audio Engine
- **Tone.js Centralization**: Many modules utilize a central `AudioProvider` to ensure single-instance audio context management, though some specialized modules manage their own Tone.js instances for complex scheduling.
- **Rhythm Engine**: A shared utility `src/utils/rhythmEngine.ts` provides timing logic used by sequencers and ear training exercises.

## 🎹 MIDI Integration
- **Global MIDI Handler**: `src/components/GlobalMidiHandler.tsx` listens for system-wide MIDI events and broadcasts them to the active module.
- **Context-Aware Mapping**: Modules detect active keys and scales to translate raw MIDI notes into musically relevant notations (using `Tonal.js`).

## 🗺️ High-Level Entry Points
- `src/main.tsx`: Application bootstrap.
- `src/App.tsx`: Routing and Global Providers.
- `src/modules/ChordLab/ChordLab.tsx`: The primary entry module for chord exploration.
