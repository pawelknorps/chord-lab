# Visual Overhaul Requirements

## Global Design Language (The "Swiss" Look)
- **Typography**: heavily standardized. Use `Inter` or system fonts.
  - Headings: Bold, tight letter spacing.
  - Body: High readability, comfortable line heights.
  - Data/Controls: Monospaced or distinctly tabular where needed.
- **Color Palette**:
  - Backgrounds: Deep grays/blacks (not pure black #000 if avoiding high contrast fatigue, but "Ableton Dark").
  - Accents: Single functional color (e.g., a specific blue or orange/amber) used *sparingly* to denote state.
  - Glassmorphism: REMOVE or severely reduce. Replace with solid planes and subtle borders.
- **Spacing**: Strict grid system. Less "floating" elements, more structural "panels".

## App Shell & Navigation
- **Sidebar**:
  - Must be collapsible to icon-only mode.
  - Group items logically (e.g., "Generators", "Analyze", "Ear Training", "Library").
  - "Library" metaphors (Notion sidebar).
- **Workspace**:
  - Maximize center area.
  - Tools/Inspectors should be movable or toggleable panels (right side?) rather than crowding the top.

## Module Specifics
- **General**:
  - Controls should be "dense" (small buttons, tighter grouping) to allow more space for the *visualizer* (piano/staff).
  - Stop using large "Cards" for everything. Use lists, tables, or property grids.
