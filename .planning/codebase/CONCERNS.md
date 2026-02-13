# Concerns & Technical Debt

## Code Quality

- **TODOs in code**: `ChordScaleEngine.ts` — "TODO: Fix mood type" (`'cool' as any`). `theoryEngine.ts` — "TODO: Implement calculation". Worth resolving to improve type safety and completeness.
- **Legacy exclusions**: `src/circle-chords-0.1.0` and `src/chord-buildr-4.3` are excluded from app build; clarify long-term plan (remove, migrate, or document as legacy).

## Dependencies

- **Bleeding edge**: React 19 and Tailwind 4 — docs and patterns still evolving.
- **Direct Tone.js usage**: Some components may touch Tone.js directly instead of a single service; risk of timing/cleanup issues if not centralized.

## Architecture

- **Duplication**: Some modules have local UI or components that overlap with `src/components/ui`; can make design system updates harder.
- **State complexity**: Zustand + Signals is powerful but requires clear rules (when to use which) to avoid confusion.
- **Routing**: Many lazy routes in `App.tsx`; consider deep linking and dynamic module loading as the app grows.
- **Lazy loading**: ModuleSkeleton and fallbacks improve perceived performance; no explicit prefetch strategy for heavy modules.

## Performance

- **3D + Audio**: Three.js and Tone.js on the main thread can cause jank; keep heavy work in workers/worklets (as with SwiftF0 and pitch worklet).
- **Bundle/samples**: Shared use of `soundfont-player` and `tonejs-instrument-*`; ensure shared instances and avoid duplicate sample loads.

## Environment

- **Supabase env vars**: Code expects `VITE_SUPABASE_ANON_KEY`; `.env.example` shows `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`. Align naming and docs so new setups work without guesswork.

## Testing

- **No RTL**: No React Testing Library; component and integration UI tests are minimal.
- **E2E**: No E2E framework; critical user flows are not automated.

## Security

- **Secrets**: No secrets should live in repo; Supabase anon key is public by design but must remain in env (e.g. `.env.local`), not committed. Security scan run before commit (see workflow).

## Resolved / Mitigated (from prior planning)

- **Phase 4 (Responsiveness & UX)**: Horizontal scroll on mobile addressed (e.g. `min-w-0`/`max-w-full` on Dashboard outlet); ModuleSkeleton and module fallbacks improve lazy-load UX.
- **Pitch/audio isolation**: Dedicated pitch AudioContext and workers keep heavy pitch work off main and Tone’s context to reduce glitches.
