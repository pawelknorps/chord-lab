---
description: Refresh project status and see what's next
---
// turbo-all
# GSD: Progress Workflow

This workflow provides a summary of the project's current state and intelligently recommends the next action.

## 1. Project Health Check

1. Load the project state and roadmap context.

```bash

node rules/get-shit-done/bin/gsd-tools.cjs init progress --include state,roadmap,project,config

```

## 2. Visualize Progress

1. Generate and display a progress bar.

```bash

node rules/get-shit-done/bin/gsd-tools.cjs progress bar --raw

```

## 3. Summarize Status
1. **Recent Work**: List the 2-3 most recent `SUMMARY.md` files and their one-liners.
2. **Current Position**: State which phase and plan are currently in focus.
3. **Key Decisions**: List any major decisions captured in `STATE.md`.
4. **Blockers**: Highlight any active issues or technical debt.

## 4. Intelligent Routing
Based on the current state, recommend the next GSD command:
- **If plans exist but are not executed**: Suggest `/gsd-execute-phase <N>`.
- **If a phase has no plans**: Suggest `/gsd-discuss-phase <N>` or `/gsd-plan-phase <N>`.
- **If UAT gaps are found**: Suggest `/gsd-plan-phase <N> --gaps`.
- **If a milestone is complete**: Suggest `/gsd-complete-milestone`.

## 5. Session Resumption
Note any active debug sessions or `PAUSED` states in `STATE.md`.
