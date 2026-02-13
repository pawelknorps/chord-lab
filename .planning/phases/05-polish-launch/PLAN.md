---
phase: 5
name: Polish, Analytics & Launch
waves: 4
dependencies: ["Phase 4: Cloud & Community"]
files_modified: [
  "src/App.tsx",
  "src/main.tsx",
  "vite.config.ts",
  "package.json",
  "src/core/store/useSettingsStore.ts"
]
files_created: [
  "src/components/ErrorBoundary.tsx",
  "src/core/analytics/eventLog.ts",
  "src/components/Onboarding/OnboardingGate.tsx",
  "src/components/Onboarding/OnboardingFlow.tsx",
  ".planning/phases/05-polish-launch/LAUNCH_RUNBOOK.md"
]
---

# Phase 5 Plan: Polish, Analytics & Launch

Focus: Production readiness, observability, and launch after Cloud & Community.

**Success Criteria**: App is performance-audited, key flows are measurable, and onboarding supports new users; ready for public or classroom rollout.

---

## Wave 1: Performance & Bundle Audit

*Goal: Measure and fix Core Web Vitals and bundle regressions.*

- <task id="W1-T1">Add bundle analyzer (e.g. `rollup-plugin-visualizer` or `vite-plugin-bundle-visualizer`) to `vite.config.ts`; add npm script (e.g. `build:analyze`) and run once to capture baseline; document largest chunks and any duplicate deps.</task>
- <task id="W1-T2">Instrument Core Web Vitals: in `main.tsx` (or App), use `web-vitals` or native PerformanceObserver to report LCP, INP/FID, CLS; log to console in dev and optionally send to analytics in prod.</task>
- <task id="W1-T3">Audit critical path: ensure ChordLab and Dashboard remain eager; confirm no blocking audio init on first paint (defer Tone/Worklet start if needed); fix any LCP/CLS regressions found.</task>
- <task id="W1-T4">Document baseline metrics and any fixes in phase folder (e.g. SUMMARY.md or a short PERF.md).</task>

---

## Wave 2: Analytics & Events

*Goal: Instrument key actions for product and growth decisions (REQ-PL-02).*

- <task id="W2-T1">Create `src/core/analytics/eventLog.ts`: `logEvent(eventName: string, props?: Record<string, unknown>)` that in dev logs to console and in prod can be wired to a provider (Umami, PostHog, or custom). No provider required in Phase 5; stub is enough.</task>
- <task id="W2-T2">Wire events: practice_start / practice_end (JazzKiller or guided session), song_unlock (mastery tree), lick_publish (Lick Feed), teacher_dashboard_view, and module_visit (route change or module open). Use consistent names and minimal payload (e.g. song title, module name).</task>
- <task id="W2-T3">Optional: Add `reportWebVitals` callback that calls `logEvent('web_vitals', { name, value, id })` so CWV can be analyzed later.</task>

---

## Wave 3: Onboarding & First-Run

*Goal: First-time users reach “first value” quickly (REQ-PL-03).*

- <task id="W3-T1">Add onboarding flag: `localStorage` key (e.g. `chord-lab-onboarding-done`) or field in profile/settings store; check on app load to decide whether to show onboarding.</task>
- <task id="W3-T2">Build `OnboardingGate` component: wraps main content; if flag not set, render short `OnboardingFlow` (e.g. 2–3 steps: welcome, instrument or “Try JazzKiller” / “Try a song”, done). On done, set flag and show app.</task>
- <task id="W3-T3">Integrate gate in `App.tsx`: wrap route content (e.g. inside `BrowserRouter`) so first-time users see onboarding before Dashboard/ChordLab.</task>
- <task id="W3-T4">Fire `logEvent('onboarding_complete')` when user completes flow; optionally `onboarding_start` and `onboarding_skip` if skip is allowed.</task>

---

## Wave 4: Launch Readiness

*Goal: Error resilience and deploy/support runbook (REQ-PL-04).*

- <task id="W4-T1">Create `ErrorBoundary` component: class component with `componentDidCatch`; render fallback UI (message + “Reload” or “Go home”); log error (and optionally `logEvent('error_boundary', { message })`).</task>
- <task id="W4-T2">Wrap app: add top-level `ErrorBoundary` in `App.tsx` around main content (inside providers that must stay up, e.g. theme). Optionally wrap lazy route content in boundaries so one module failure doesn’t kill the whole app.</task>
- <task id="W4-T3">Offline/error messaging: when PWA is offline or Supabase/sync fails, show a small banner or inline message (e.g. “You’re offline – progress will sync when back online”). Reuse or extend any existing sync/error state in `useSupabaseProgressSync` or Auth context.</task>
- <task id="W4-T4">Write `LAUNCH_RUNBOOK.md` in phase folder: env vars (Supabase URL/key, optional analytics), deploy steps, how to clear cache / re-register service worker, and where to look for errors (console, Supabase logs).</task>

---

## Verification

- [ ] Bundle analyzer run produces a report; largest chunks documented; no major duplicate deps.
- [ ] Core Web Vitals are reported (dev or prod); LCP/INP/CLS documented or within acceptable targets.
- [ ] At least practice_start/end, song_unlock, lick_publish, and onboarding_complete (and optionally module_visit) are emitted via `logEvent` when user performs those actions.
- [ ] First-time user (clear onboarding flag) sees onboarding flow; on completion, flag set and app shown; `onboarding_complete` event fired.
- [ ] Uncaught React error in a route is caught by ErrorBoundary; fallback UI shown; app recoverable via reload or navigation.
- [ ] Offline or sync failure shows clear user message where applicable.
- [ ] LAUNCH_RUNBOOK.md exists and covers env, deploy, cache, and basic support.
