---
wave: 1
dependencies: [integration-02-infrastructure]
files_to_modify:
  - src/utils/rhythmEngine.ts
  - src/utils/polyrhythmEngine.ts
  - src/modules/RhythmArchitect/components/SyncopationBuilder.tsx
  - src/modules/RhythmArchitect/components/PolyrhythmGenerator.tsx
estimated_time: 4-6 hours
---

# Plan: Rhythm Section Stabilization & Design Adoption [✓ Complete]

## Context

The Rhythm Section modules (Syncopation and Polyrhythm) are currently functional but suffer from:

1. **SYNC-01**: Ghost notes are hard to hear or have a mismatched timbre.
2. **POLY-01**: The circular visualizer can feel laggy or state-stale during rapid parameter changes.
3. **CORE-01**: Missing normalized audio cleanup (using `useAudioCleanup`).
4. **CORE-02**: Layout and styles haven't been migrated to the new "Swiss/Minimalist" design tokens.

## Goal

Stabilize audio playback, fix state synchronization in visualizers, and apply the new design system.

## Tasks

### Task 1: Fix SYNC-01 (Audible Ghost Notes)

<task>
<description>
Improve the `MetronomeEngine` to provide clear, musical ghost notes and accents.
</description>

<steps>

1. Review `src/utils/rhythmEngine.ts`.
2. Adjust `subSynth` (MetalSynth) settings:
   - Increase resonance and adjust frequency to make it sound like a "tight hi-hat".
   - Ensure pitch is distinct from the `clickSynth`.
3. Modify `setPattern` logic to handle velocity more predictably.
4. Test audibility by running the Metronome at various BPMs.

</steps>

<verification>

- [ ] Ghost notes (type 1) are clearly audible but significantly quieter than accents (type 2).
- [ ] No clipping when multiple notes trigger rapidly.

</verification>
</task>

### Task 2: Fix POLY-01 (Visualizer State Staleness)

<task>
<description>
Ensure the circular visualizer in `PolyrhythmGenerator` reacts instantly and smoothly to slider changes.
</description>

<steps>

1. Modify `src/modules/RhythmArchitect/components/PolyrhythmGenerator.tsx`.
2. Ensure `stateRef` is updated *before* the next `draw` call if possible.
3. Optimize the `draw` function:
   - Pre-calculate constants outside the loop.
   - Avoid `import('tone')` inside the animation frame.
4. Handle `Tone.Transport` seconds more robustly to ensure perfect sync with audio.

</steps>

<verification>

- [ ] Dragging the Division sliders reflects the change in the visualizer *immediately* (next frame).
- [ ] No visual jitter or frame drops.

</verification>
</task>

### Task 3: Apply Swiss/Minimalist Design (CORE-02)

<task>
<description>
Migrate both modules to the new design system.
</description>

<steps>

1. Update `SyncopationBuilder.tsx`:
   - Switch `div` classes to use `var(--bg-app)`, `var(--bg-panel)`, and `border-[var(--border-subtle)]`.
   - Apply `text-swiss-xl` or similar for titles.
   - Standardize buttons to match the sidebar/chordlab style.
2. Update `PolyrhythmGenerator.tsx`:
   - Apply same design tokens.
   - Ensure the canvas background matches the new layout.
3. Integrate `useAudioCleanup` to fulfill **CORE-01**.

</steps>

<verification>

- [ ] Layout matches `ChordLab` and `EarTraining` aesthetic.
- [ ] No visual scrolling artifacts.
- [ ] Audio stops correctly when navigating via sidebar.

</verification>
</task>

## Success Criteria

- [ ] Syncopation ghost notes are musical and audible.
- [ ] Polyrhythm visualizer is 100% reactive.
- [ ] Design is consistent with the rest of the application.
- [ ] Audio handles transitions perfectly.
