# Guitar Progression Generator

[RU](./README.ru.md)

Live: https://circle-chords.malikov.tech/

A React + TypeScript app that generates chord progressions, visualizes them on the circle of fifths and guitar fretboards, and plays audio examples. The app is fully data-driven via JSON configs and supports English/Russian UI.

## Tech & Structure
- Stack: Vite, React 18, TypeScript, TailwindCSS, i18next, soundfont-player.
- Key paths:
  - `src/` – app code: `App.tsx`, `pages/ChordExplorer.tsx`, `components/*`, `lib/*` (theory, types, config loader, audio).
  - `public/config/` – musical data: `scales.json`, `chords.json`, `progressions.json`, `circleOfFifths.json` (fetched at runtime by `src/lib/config.ts`).
  - `i18n/languages.json` – translations used by `src/i18n.ts`.

## Getting Started
Requirements: Node 18 or 20.
- Install: `npm install`
- Dev server: `npm run dev` (Vite)
- Build: `npm run build` → `dist/`
- Preview build: `npm run preview`
- Tests: `npm run test` (Vitest + jsdom)
- Lint/format: `npm run lint` / `npm run lint:fix` / `npm run format:fix`

## How It Works
- Theory: `src/lib/theory.ts` computes scales, chords, and generates progressions from `public/config` data.
- UI: `src/components/*` and `src/pages/ChordExplorer.tsx` render progressions, chord diagrams, fretboards, and the interactive circle.
- Audio: `src/lib/audio-sf.ts` (soundfont-player) provides reliable mobile playback; a Tone.js engine (`src/lib/audio.ts`) exists but is not the default.

## Configuration
All musical data lives in `public/config/` and is hot‑reloaded on refresh. Update JSON to add scales, chord patterns, fingerings, or progressions. See [CONFIG_GUIDE.md](./CONFIG_GUIDE.md).

## Deployment
GitHub Pages workflow: `.github/workflows/static.yml`. Vite `base: './'` is set in `vite.config.ts` so the app runs under a subpath. CI runs tests, builds, and publishes `dist/`.
