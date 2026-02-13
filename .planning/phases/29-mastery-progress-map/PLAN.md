---
waves: 3
files:
  - src/hooks/useForceLayout.ts
  - src/components/MasteryTree/MasteryTreeView.tsx
---
# PLAN: Create Mastery Progress Map Visualization

## Objective

Refactor the existing `MasteryTreeView.tsx` to use a dynamic, force-directed layout for the nodes, creating a "Mastery Progress Map" as envisioned in the project roadmap.

## Wave 1: Force-Directed Layout Hook

### Tasks

- <task id="W1-T1">Create a new file `src/hooks/useForceLayout.ts`.</task>
- <task id="W1-T2">Implement the `useForceLayout` hook. This hook will take the nodes and edges of the mastery tree as input.</task>
- <task id="W1-T3">Inside the hook, implement a simple physics simulation with the following forces:
    - **Repulsion Force**: Pushes nodes away from each other.
    - **Link Force**: Pulls connected nodes together.
    - **Centering Force**: Pulls all nodes towards the center.
  </task>
- <task id="W1-T4">The hook will run the simulation for a fixed number of iterations and return the final calculated positions of the nodes.</task>

### Verification

- The `useForceLayout.ts` hook is created.
- The hook correctly calculates and returns node positions.

## Wave 2: Refactor MasteryTreeView

### Tasks

- <task id="W2-T1">Open `src/components/MasteryTree/MasteryTreeView.tsx`.</task>
- <task id="W2-T2">Remove the hardcoded `NODE_POSITIONS` object.</task>
- <task id="W2-T3">Use the `useForceLayout` hook to get the dynamic positions of the nodes.</task>
- <task id="W2-T4">Update the rendering logic to use the new dynamic positions for both the nodes and the connecting lines.</task>

### Verification

- The `MasteryTreeView.tsx` component no longer uses hardcoded positions.
- The component correctly uses the `useForceLayout` hook.
- The mastery tree is rendered with a dynamic layout.

## Wave 3: Verification

### Tasks

- <task id="W3-T1">Manually verify the new dynamic layout in the browser. Check for stability, node distribution, and overall aesthetics.</task>
- <task id="W3-T2">Create a `VERIFICATION.md` file in the phase directory (`.planning/phases/29-mastery-progress-map/`) to document the manual verification steps and the results.</task>

### Verification

- The dynamic layout is visually appealing and functional.
- The `VERIFICATION.md` file is created and contains the verification results.
