# Architecture

## High-Level Pattern
The application follows a **Modular Monolith** architecture within a React frontend.
- **Modules**: Features are encapsulated in `src/modules/` (e.g., `ChordBuildr`, `JazzKiller`, `Tonnetz`).
- **Core**: Shared business logic, state, and services reside in `src/core/`.
- **UI**: Components are split between module-specific components and shared primitives.

## Layers
1. **Presentation Layer**: React Components (`.tsx`).
   - `pages/`: Top-level route views.
   - `modules/*/components/`: Feature-specific UI.
   - `shared/components/` & `src/components/`: Reusable UI bricks.
2. **State Management Layer**:
   - `src/core/store/`: Global Zustand stores (Session, Mastery, Settings).
   - Component-level `useState` / `useReducer`.
   - `signals`: For high-frequency audio parameters (e.g. current playback time, volume).
3. **Domain/Logic Layer**:
   - `src/core/theory/`: Music theory engines (Harmony, Scales).
   - `src/core/audio/`: Global audio context and signal chains.
   - `src/modules/*/utils/` or `logic.ts`: Module-specific calculators.
4. **Service/Integration Layer**:
   - `src/core/services/`: Bridges to external libs (Tone.js wrapper, MIDI handlers).

## Data Flow
- **Unidirectional**: React props for UI state.
- **Global Actions**: Components dispatch actions to Zustand stores.
- **Reactive Signals**: Audio engine updates signals; UI subscribes directly to signals to update visuals (e.g. piano key press) without full component re-renders.

## Key Entry Points
- **Application Boot**: `src/main.tsx` -> `src/App.tsx`.
- **Routing**: `src/App.tsx` (likely defines `Routes`).
- **Audio Init**: `src/core/services/AudioManager.ts` (initialized on user interaction).
