# Research: Phase 2 Mastery Tree

## Component Mapping
The existing `useMasteryStore` tracks generic module XP. For Phase 2, we need **High-Granularity Skill Tracking**.

### Node Discovery
We can automatically link songs to Tree Nodes by checking the patterns detected in `usePracticeStore`:
- **Node: Major ii-V-I** -> Songs with `ii-V-I` patterns.
- **Node: Secondary Dominants** -> Songs with patterns like `V/II`, `V/V`.
- **Node: Minor ii-V-I** -> Songs in minor keys with `iiø-V7-i`.

### UI Visualization Strategies
1. **SVG Graph**: Low dependency, high control. Use `framer-motion` for layout transitions.
2. **Infinite Canvas**: If the tree grows to 100+ nodes, we may need a pan/zoom component. For Wave 2, a vertical/horizontal scrollable SVG is sufficient.

### Hazards
- **Data Circularity**: We must map patterns to nodes carefully to avoid awarding XP for the same notes to multiple nodes unless intended.
- **State Bloat**: Persistent storage needs to be efficient since we might track 100+ node XP objects.
- **Progression Math**: Leveling should not be linear. Higher-level nodes should require more "Mastery Notes" (3rds/7ths) to unlock.

## API Needs
- **Node to Song Lookup**: A registry that knows "All Of Me" belongs to "Secondary Dominants".
- **Concept Tagging**: AI `jazzTeacherLogic` should be able to identify which node a specific performance belongs to.
