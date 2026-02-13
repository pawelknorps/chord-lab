# Architecture

## High-Level Pattern

**Modular Monolith** inside a React SPA. Features live in `src/modules/`; shared logic and services in `src/core/`. UI is split between module-specific components and shared primitives.

## Layers

1. **Presentation**: React components (`.tsx`).
   - `src/pages/`: Route-level views (ProgressPage, ProgressionsPage, LickFeedPage, LickHubPage, TeacherDashboard, MidiLibraryPage).
   - `src/modules/*/components/`: Feature UI.
   - `src/components/`: Shared layout and UI (Dashboard, ChordLabDashboard, shared components, `components/ui`).
2. **State**:
   - `src/core/store/`: Zustand stores (Session, Mastery, Scoring, Settings, Practice, Solo, SessionHistory, MasteryTree, GuidedPractice).
   - `src/core/state/`: Signals (audioSignals, contextSignals), useInteractionStore, musicalClipboard.
   - Module-level stores: `useITMPitchStore` (ITM), `useDirectorStore` (director), `useProfileStore` (profiles), `useFunctionalEarTrainingStore`, `useEarPerformanceStore` (FunctionalEarTraining), `useStandardsExerciseHeatmapStore` (JazzKiller), `useRhythmStore` (RhythmArchitect), `useIIVIDrillStore` (drills).
   - Component-level `useState` / `useReducer`.
   - Preact Signals for high-frequency audio/playback (e.g. `jazzSignals`, `audioSignals`).
3. **Domain / Logic**:
   - `src/core/theory/`: Music theory (harmony, scales, walking bass, comping, groove, chord DNA, tonality segmentation).
   - `src/core/audio/`: Audio context, pitch detection, SwiftF0, worklets, workers, global audio graph.
   - `src/core/director/`: DirectorService for routines.
   - `src/modules/*/utils/`, `*/core/`: Module-specific engines and calculators.
4. **Services / Integration**:
   - `src/core/services/`: AudioManager, TrendAnalysisService, LocalAgentService, TeacherAnalyticsService, itmSyncService, aiDetection, earFocusService, earHintService, jazzLibrary, noteValidator, progressionContext, rhythmScatService, etc.
   - `src/core/supabase/`: Supabase client and auth.

## Concurrency Model

- **Main thread**: React UI, Zustand, routing.
- **AudioWorklet**: Pitch-processor worklet (MPM or passthrough to PCM); runs in audio thread; writes to SharedArrayBuffer. Requires COOP/COEP (set in Vite server/preview).
- **Workers**: SwiftF0Worker (ONNX pitch), MpmWorker (NSDF fallback), BandWorker, AiWorker. Used for heavy or blocking work off the main thread.
- **Pitch pipeline**: Mic → dedicated AudioContext (not Tone’s) → worklet → SharedArrayBuffer; optional SwiftF0 worker reads PCM SAB and writes refined pitch; UI/useITMPitchStore poll or subscribe to pitch state.

## Data Flow

- **UI**: Unidirectional; props and context.
- **Global actions**: Components call Zustand actions.
- **Reactive signals**: Audio/playback update signals; UI subscribes for smooth visuals without full tree re-renders.

## Entry Points

- **Boot**: `src/main.tsx` → `App.tsx` (StrictMode, no providers in main; App wraps with AuthProvider, AudioProvider, MidiProvider, BrowserRouter).
- **Routing**: `App.tsx` defines `<Routes>`; Dashboard wraps child routes; heavy modules are lazy-loaded with `ModuleSkeleton` fallbacks. ChordLab is eager for LCP.
- **Audio**: `AudioManager` and user gesture (e.g. start button) resume context; pitch pipeline started via `useITMPitchStore` / `useHighPerformancePitch`.
