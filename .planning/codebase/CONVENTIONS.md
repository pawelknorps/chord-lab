# Coding Conventions

## ⚛️ React Patterns
- **Functional Components**: All UI is built using functional components and hooks.
- **Lazy Loading**: Use `React.lazy` for module boundaries to maintain performance.
- **Provider Pattern**: Use context for cross-cutting concerns like Audio and MIDI.

## 💾 State Management
- **Zustand Preferred**: Use Zustand for feature-level state that needs to persist across component re-renders but doesn't need to be in the main DOM tree.
- **Context for Services**: Use React Context for singleton service-like providers.

## 🎨 CSS & Styling
- **Tailwind Utility First**: Use Tailwind for 90% of styling.
- **CSS Variables**: Define design tokens (colors, spacing) in `src/index.css` using CSS variables.
- **Framing**: Use `Framer Motion` for all interactive element animations.

## 🎹 Music Theory
- **Tonal.js Integration**: Always use `Tonal.js` for note, chord, and scale calculations rather than manual mapping where possible.
- **Enharmonic Correctness**: Note naming should be context-aware (e.g., Bb in F Major), often handled by a centralized `midiToNoteName` utility.

## 📜 Code Style
- **TypeScript**: Strictly use TS interfaces/types for all component props and state.
- **ESM**: The project is configured as `"type": "module"`. Use ESM imports correctly.
- **Naming**:
    - Components: PascalCase (`ChordLab.tsx`).
    - Hooks: camelCase starting with `use` (`useAudioContext.ts`).
    - Modules: PascalCase directories.
