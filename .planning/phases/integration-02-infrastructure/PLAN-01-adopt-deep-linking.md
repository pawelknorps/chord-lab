---
wave: 1
dependencies: [integration-01-shared-components]
files_to_modify:
  - src/modules/ChordLab/ChordLab.tsx
  - src/modules/FunctionalEarTraining/FunctionalEarTraining.tsx
  - src/core/routing/deepLinks.ts
estimated_time: 2-3 hours
---

# Plan: Adopt Deep Linking & Musical Clipboard in Core Modules [✓ Complete]

## Context

We have the infra for deep linking (`deepLinks.ts`) and a musical clipboard (`musicalClipboard.ts`), but modules are not fully utilizing them. This prevents seamless transitions like "Send to Ear Training" because the target module doesn't pull the data on mount.

## Goal

Make `ChordLab` and `FunctionalEarTraining` fully reactive to:
1.  **URL Search Parameters** (Deep Links)
2.  **Musical Clipboard** (Navigation State)

## Tasks

### Task 1: Update ChordLab to read SearchParams

<task>
<description>
Modify ChordLab to check the URL for progression data when it mounts.
</description>

<steps>
1. Import `useSearchParams` from `react-router-dom`.
2. Import `decodeProgression` from `../../core/routing/deepLinks`.
3. Add a `useEffect` that:
   - Checks `searchParams` for chords.
   - If found, decodes it.
   - Calls `handleLoadExternalMidi` with the decoded data.
   - Clears params (or keeps them for shareability).
</steps>

<verification>
- [ ] Navigating to `/chordlab?chords=C,Am,F,G` loads the progression.
</verification>
</task>

### Task 2: Update Ear Training to read SearchParams

<task>
<description>
Modify Functional Ear Training to accept external progressions/chords for specific levels.
</description>

<steps>
1. Update `FunctionalEarTraining.tsx` to read `searchParams`.
2. If `chords` or `root/quality` is present:
   - Map it to the appropriate Level (e.g., Progressions or Chord Qualities).
   - Inject the data into the store.
   - Auto-start the level if possible.
</steps>

<verification>
- [ ] Navigating to `/functional-ear-training?chords=C,G,Am,F` starts the Progressions level with those chords.
</verification>
</task>

### Task 3: Standardize "Send To" UI

<task>
<description>
Ensure the `SendToMenu` is consistently available and includes "Share Link" (copy deep link).
</description>

<steps>
1. Update `SendToMenu.tsx` to include an "Copy Link" action.
2. Ensure it uses `createDeepLink` from `core/routing/deepLinks`.
</steps>

<verification>
- [ ] SendToMenu has "Copy Link" option.
- [ ] Link works when pasted in a new tab.
</verification>
</task>
