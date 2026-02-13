# Directory Structure

## Root

- `vite.config.ts`: Vite config, Vitest (`src/**/*.test.{ts,tsx}`), PWA, COOP/COEP headers.
- `package.json`: Scripts (`dev`, `build`, `test`, `test:run`, `lint`, `generate:midi`, `generate:lessons`, etc.).
- `tsconfig.json`: References `tsconfig.app.json`, `tsconfig.node.json`.
- `tsconfig.app.json`: App TS config (ES2022, strict, `src` only; excludes `src/circle-chords-0.1.0`, `src/chord-buildr-4.3`).
- `eslint.config.js`: ESLint flat config (TypeScript, react-hooks, react-refresh).
- `.env.example`, `.env.local`: Env templates; app uses `VITE_*` for Supabase.

## Source (`src/`)

### Core (`src/core/`)

Shared business logic and infrastructure.

- `audio/`: Global audio graph, SwiftF0, CrepeStabilizer, pitch detection, SharedArrayBuffer/PitchMemory, MpmWorker, SwiftF0Worker, AiWorker, BandWorker, MicrophoneService, SwingEngine, globalAudio, sharedAudioContext, instrumentProfiles, frequencyToNote.
- `director/`: DirectorService.
- `drills/`: Practice routines (if present).
- `routing/`: deepLinks and app-level navigation.
- `services/`: AudioManager, TrendAnalysisService, LocalAgentService, CurriculumAnalysisService, etc.
- `store/`: Zustand stores (useScoringStore, useSessionHistoryStore, useMasteryTreeStore, usePracticeStore, useSettingsStore, useSoloStore, etc.).
- `supabase/`: client.ts, auth.ts.
- `theory/`: Harmony, scales, chord parsing, GuideToneCalculator, WalkingBassEngine, DrumEngine, CompingEngine, ReactiveCompingEngine, GrooveManager, JazzMarkovEngine, ChordScaleEngine, TonalitySegmentationEngine, FunctionalLabelingEngine, ChordDna, liveHarmonicGrounding, etc.

### Modules (`src/modules/`)

Feature slices; each has components, hooks, utils or core logic as needed.

- `ChordLab/`: Core chord lab UI.
- `JazzKiller/`: Jazz standards, playback, chart, mixer, AI teacher, lick library, standards exercises, ireal-renderer.
- `ITM/`: ITM pitch store, high-performance pitch, MasteryTree, TrendAnalysis, SegmentBuilder, PerformanceSegment, JazzPitchMonitor, pitch worklet code.
- `InnovativeExercises/`: Ghost note match, intonation heatmap, voice-leading maze, swing pocket, call and response, ghost rhythm; hooks and panels.
- `FunctionalEarTraining/`: Ear training levels and flow.
- `RhythmArchitect/`: Polyrhythm, syncopation.
- `Tonnetz/`, `NegativeMirror/`, `BarryHarris/`, `BiTonalSandbox/`, `GripSequencer/`, `CircleChords/`, `MidiLibrary/`: Additional labs/features.

### UI & Shared

- `pages/`: Route pages (ProgressPage, ProgressionsPage, MidiLibraryPage, TeacherDashboard, LickFeedPage, etc.).
- `components/`: Layout (Dashboard), ChordLabDashboard, shared widgets, SessionHUD, PerformanceMonitor, ModuleSkeleton, GlobalMidiHandler, WorkbenchAiPanel, SendToMenu; `components/ui/`: button, dialog, slider, checkbox, select, badge, command, popover (Radix-based).
- `context/`: AudioContext, MidiContext, AuthContext.
- `hooks/`: usePitchTracker, useSupabaseProgressSync, etc.
- `utils/`: i18n, theoryEngine, polyrhythmEngine, etc.
- `data/`: jjazzlab-style-registry, jjazzlab-drum-patterns, etc.
- `scripts/`: scanIrealChords (and test).

### Assets & Entry

- `index.css`: Global/Tailwind.
- `App.tsx`: Providers, router, lazy routes.
- `main.tsx`: React root.

## Public

- `worklets/pitch-processor.js`: Bundled/copied pitch worklet (or built from ITM worklet code).

## Excluded from App Build

- `src/circle-chords-0.1.0`, `src/chord-buildr-4.3`: Excluded via tsconfig.app.json.
- `legacy_projects/`: Separate legacy apps (e.g. circle-chords-0.1.0, chord-buildr-4.3).

## Naming

- **Components**: PascalCase (e.g. `ChordLabDashboard.tsx`).
- **Stores/hooks**: `use*` for hooks, `use*Store` for Zustand.
- **Theory/audio**: camelCase modules (e.g. `walkingBassEngine.ts`).
