# Research: Mastery Progress Map Visualization

## Objective

To research the best approach for creating a dynamic "Mastery Progress Map" visualization, as described in the `ROADMAP.md` as a "force-directed or Tree layout".

## Findings

1.  **Existing Libraries**: The `package.json` includes `@react-three/drei`, `@react-three/fiber`, and `three`, which are suitable for 3D visualizations. It does not include `d3` or other common 2D charting libraries.

2.  **Existing Implementation**: The component `src/components/MasteryTree/MasteryTreeView.tsx` already implements a static version of the mastery tree using SVG and `framer-motion`. The node positions are hardcoded in a `NODE_POSITIONS` object.

3.  **Roadmap**: The `ROADMAP.md` mentions a "Visual Progress Tree" and a "force-directed or Tree layout".

## Conclusion and Recommendation

The current implementation with hardcoded positions in `MasteryTreeView.tsx` is not scalable and does not fulfill the requirement of a dynamic layout.

While a 3D implementation using the existing `three.js` libraries is possible, it would be a significant departure from the current 2D SVG implementation. A 2D implementation is more consistent with the existing `MasteryTreeView.tsx` component.

To avoid introducing new dependencies (like `d3-force`), a simple physics simulation can be implemented using React hooks to create a force-directed layout. This approach is self-contained and demonstrates a deeper understanding of the mechanics of force-directed graphs.

### Proposed Physics Simulation

The simulation will be implemented within a new React hook (e.g., `useForceLayout`). It will manage the positions of the nodes based on the following forces:

*   **Repulsion Force (Charge)**: All nodes will repel each other, preventing them from overlapping.
*   **Link Force**: Connected nodes will be pulled towards each other, maintaining the structure of the tree.
*   **Centering Force**: All nodes will be gently pulled towards the center of the SVG canvas to keep the graph centered.

The simulation will run for a fixed number of iterations or until the layout stabilizes, and the final node positions will be used to render the SVG. This approach provides a dynamic and visually appealing layout without external dependencies.
