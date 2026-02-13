# Testing Strategy

## Framework

- **Runner**: Vitest (`vitest`, `^4.0.18`).
- **Config**: In `vite.config.ts`: `include: ['src/**/*.test.{ts,tsx}']`, `globals: true`, `environment: 'jsdom'`.
- **No React Testing Library**: Not in package.json; tests are unit/integration style with Vitest + jsdom.

## Test Locations

- **Co-located**: Tests sit next to source (`*.test.ts`, `*.test.tsx`) under `src/`.
- **Count**: ~28 test files under `src/` (theory, audio, services, modules/JazzKiller, InnovativeExercises, scripts, utils). Legacy projects have additional tests under `legacy_projects/`.
- **Examples**: `core/theory/GrooveManager.test.ts`, `RhythmEngine.test.ts`, `DrumEngine.test.ts`, `WalkingBassEngine.test.ts`, `CompingEngine.test.ts`, `TonalitySegmentationEngine.test.ts`, `FunctionalLabelingEngine.test.ts`, `liveHarmonicGrounding.test.ts`, `BassRhythmVariator.test.ts`, `ConceptAnalyzer.test.ts`; `core/audio/SwiftF0Worker.test.ts`, `swiftF0Inference.test.ts`, `CrepeStabilizer.test.ts`, `PitchMemory.test.ts`, `sharedAudioContext.test.ts`, `audioGlitchDiagnosis.test.ts`; `modules/InnovativeExercises/hooks/useVoiceLeadingMaze.test.ts`, `core/SwingAnalysis.test.ts`; `modules/JazzKiller/hooks/useJazzPlayback.test.ts`, `useJazzBand.playback.test.ts`, `StandardsExerciseEngine.test.ts`, `trioContext.test.ts`, `meterTranslator.test.ts`, `jazzTeacherLogic.phase15.test.ts`; `scripts/scanIrealChords.test.ts`; `utils/theoryEngine.test.ts`; `core/services/aiDetection.test.ts`; `core/theory/chordDetection.test.ts`.

## Coverage

- **Unit**: Strong in `core/theory` and `core/audio`; engines and pure logic are primary targets.
- **Hooks/modules**: Some hook and module tests (e.g. JazzKiller, InnovativeExercises).
- **Component tests**: Sparse; no RTL, so UI is mostly untested.
- **E2E**: No Playwright/Cypress config in root.

## Scripts

- `npm run test`: Vitest watch.
- `npm run test:run`: Vitest single run.
- `npm run scan:chords`: `vitest run --run src/scripts/scanIrealChords.test.ts`.

## Mocking

- **Audio/Tone**: Tests that touch Tone or Web Audio may need mocks or stubs; no global test setup file in root — consider a `vitest.setup.ts` if needed for Tone/audio.
- **Browser globals**: Some tests stub `globalThis.window` (e.g. aiDetection.test.ts) or use fake constructors (e.g. sharedAudioContext.test.ts).
