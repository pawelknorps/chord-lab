---
description: Create executable phase prompts (PLAN.md files) for a roadmap phase
---

# GSD: Plan Phase Workflow

This workflow creates detailed execution plans (PLAN.md files) for a specific phase of your roadmap.

## 1. Initialization

1. Select the phase number to plan (e.g., `1` or `2.1`).

2. Run the initialization tool:

```bash
node rules/get-shit-done/bin/gsd-tools.cjs init plan-phase <PHASE_NUMBER> --include state,roadmap,requirements,context,research
```

## 2. Phase Validation

1. Verify the phase exists in `ROADMAP.md`.

2. Ensure the phase directory exists: `.planning/phases/XX-name/`.

## 3. Handle Research

1. If research is enabled and missing, perform phase-specific research.

2. Answer: "What do I need to know to PLAN this phase well?"

3. Document findings in `.planning/phases/XX-name/RESEARCH.md`.

## 4. Phase Planning

1. Gather all context (STATE.md, ROADMAP.md, REQUIREMENTS.md, CONTEXT.md, RESEARCH.md).

2. Create `PLAN.md` files in the phase directory.

3. Ensure plans include:
    - **Frontmatter**: Waves, dependencies, files likely to be modified.
    - **Tasks**: Specific, actionable steps in XML format.
    - **Verification**: Success criteria for each task and the phase goal.

## 5. Plan Verification

1. Run a "Plan Checker" to verify that the generated plans covers the phase goal and honors all user decisions.

2. If issues are found, revise the plans (up to 3 iterations).

## 6. Next Steps

1. Inform the user that planning is complete.

2. Recommend running `/gsd-execute-phase <PHASE_NUMBER>` to start building.
