# Coding Conventions

## File Naming

- **Components**: PascalCase (e.g. `ChordLabDashboard.tsx`, `MasteryTreeView.tsx`).
- **Logic/utilities**: camelCase (e.g. `jazzTeacherLogic.ts`, `meterTranslator.ts`).
- **Stores/hooks**: `use` prefix + PascalCase (e.g. `useITMPitchStore.ts`, `useJazzBand.ts`).
- **Styles**: Component-matched names; Tailwind preferred; some CSS modules (e.g. `NoteWaterfall.module.css`).

## Component Structure

- **Functional components**: React function components with hooks.
- **Props**: Interfaces above or beside the component or imported from types.
- **Colocation**: Module UI lives under `src/modules/<ModuleName>/components/`.

## Styling

- **Tailwind CSS 4**: Primary styling (utility-first).
- **CSS modules**: Used where needed (e.g. NoteWaterfall).
- **Radix UI**: Dialogs, sliders, popovers, checkbox, select, etc.

## State Management

- **Zustand**: Global app state (session, scoring, mastery, settings, practice, solo, session history, mastery tree, guided practice); module stores in `modules/*/state/` or `core/state/`, `core/director`, `core/profiles`, `core/drills`.
- **Signals**: High-frequency or audio-driven state (playback, visualizers) in `core/state/` (audioSignals, contextSignals).
- **Context**: Auth, Audio, MIDI providers; used for injection and cross-cutting concerns.

## Type Safety

- **TypeScript**: Strict mode; `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`, `erasableSyntaxOnly`.
- **Types**: Interfaces for data shapes; types in `modules/*/types` or next to modules.
- **Escapes**: Some `as any` and `@ts-expect-error` remain (see CONCERNS.md); prefer proper types where possible.

## Linting

- **ESLint**: Flat config (`eslint.config.js`): `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.
- **Script**: `npm run lint` runs ESLint on the project.

## Audio

- **Tone.js**: Synthesis and transport/scheduling.
- **User gesture**: Audio context resumed on first user interaction (overlay or start button).
- **Pitch**: Dedicated AudioContext for mic (not Tone’s); worklets + workers; SharedArrayBuffer where used.
