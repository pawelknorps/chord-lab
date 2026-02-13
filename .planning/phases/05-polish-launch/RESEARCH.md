# Research: Phase 5 – Polish, Analytics & Launch

**Roadmap**: Phase 5: Polish, Analytics & Launch  
**Goal**: App is performance-audited, key flows are measurable, and onboarding supports new users; ready for public or classroom rollout.

---

## What We Need to Know to Plan This Phase

### 1. Current Performance & Bundle

- **Build**: Vite + React; `vite build` produces production bundle. No `rollup-plugin-visualizer` or bundle analyzer in `vite.config.ts`; add for audit.
- **Lazy loading**: Heavy modules (JazzKiller, BiTonalSandbox, GripSequencer, Tonnetz, etc.) are already lazy-loaded via `React.lazy`; ChordLab and Dashboard are eager for LCP.
- **Core Web Vitals**: Not instrumented; no `reportWebVitals` or LCP/FID/CLS reporting. Phase 5 should add minimal CWV reporting (e.g. in `main.tsx` or App) and fix any regressions found.
- **Audio**: Tone.js, worklets, SharedArrayBuffer; critical path for JazzKiller. Ensure first paint isn’t blocked by audio init.

### 2. Analytics & Events

- **Existing**: No app-wide analytics. ChordBuildr’s `VersionModal` mentions “umami for analytics” in legacy/changelog context only; no active analytics SDK in main app.
- **Options**: Umami (self-hosted/privacy), PostHog, Vercel Analytics, or a minimal custom event layer (e.g. `logEvent(name, props)` that can be wired to a provider later).
- **Key events** (REQ-PL-02): practice_start, practice_end, song_unlock, lick_publish, teacher_dashboard_view, module_visit. Prefer small, consistent event names and optional payload (song title, module name).

### 3. Onboarding & First-Run (REQ-PL-03)

- **Current**: No dedicated first-run flow. Default route is Dashboard → ChordLab. JazzKiller has a “hint animation for onboarding” comment; no app-level “first time” gate.
- **Storage**: Use `localStorage` (e.g. `chord-lab-onboarding-done`) or profile/settings store to mark completion. Keep flow short: instrument pick (if needed), “Try one song” or “Try JazzKiller” CTA to reach first value quickly.

### 4. Error Handling & Launch Readiness (REQ-PL-04)

- **Error boundaries**: No `ErrorBoundary` in `src`; a single React error can take down the whole app. Add at least one top-level boundary (e.g. around main route content) and optional per-module boundaries for lazy chunks.
- **Offline/errors**: Phase 4 PWA will cache shell; Phase 5 should add user-facing messaging when offline or when sync/auth fails (e.g. banner or inline message), and a minimal runbook for deploy/support (env vars, Supabase, how to clear cache).

### 5. Dependencies

- **Phase 4**: Should be complete or near-complete (Supabase, Teacher Dashboard, Lick Feed, PWA). Phase 5 assumes cloud and PWA are in place so analytics and onboarding can rely on auth/session where needed.
- **No hard dependency** on Phase 4 for performance audit or error boundaries; those can start in parallel. Analytics and onboarding may optionally use Supabase profile (e.g. “has completed onboarding” in profile).

---

## Summary

- **Performance**: Add bundle analyzer and CWV reporting; fix regressions; keep ChordLab/Dashboard eager, rest lazy.
- **Analytics**: Introduce a small event API and wire key actions; choose provider (Umami/PostHog/custom) and keep it switchable.
- **Onboarding**: Short first-run flow (localStorage or profile flag) with instrument + “try one song/lick” to first value.
- **Launch**: Top-level (and optionally module-level) ErrorBoundary; offline/error messaging; minimal deploy/support runbook.
