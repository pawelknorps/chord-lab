# Coding Conventions

## File Naming
- **Components**: PascalCase (e.g., `ChordPianoComponent.tsx`, `Tonnetz.tsx`).
- **Logic/Utilities**: camelCase (e.g., `tonnetzLogic.ts`, `chordManager.ts`).
- **Stores/Hooks**: `use` prefix + PascalCase (e.g., `useSessionStore.ts`).
- **Styles**: PascalCase matches component (e.g., `Layout.css`), though newer code uses Tailwind.

## Component Structure
- **Functional Components**: React Functional Components with Hooks.
- **Props Interface**: Defined usually above the component or imported types.
- **Colocation**: Module-specific components stay within `src/modules/<ModuleName>/components`.

## Styling
- **Tailwind CSS**: The primary direction (v4).
- **CSS Modules/Files**: Legacy usage exists (`.css` files in modules), but new development prefers utility classes.
- **Radix UI**: Used for complex interactives (Dialog, Slider, Popover).

## State Management
- **Zustand**: Preferred for global app state (user session, global settings).
- **Signals**: Used for performance-critical mutable state (audio playback head, visualizers).
- **Context**: Used sparingly, mostly for dependency injection or theming.

## Type Safety
- **Strict Mode**: TypeScript strict mode seems enabled.
- **Interfaces**: Used for defining data shapes (Chords, Scales, UserSettings).

## Audio
- **Tone.js**: The standard for all synthesis and scheduling.
- **User Interaction**: Audio context must resume on first user interaction. Usually handled by an overlay or start button.
