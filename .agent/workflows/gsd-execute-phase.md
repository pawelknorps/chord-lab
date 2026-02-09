---
description: Execute all plans in a phase using GSD parallel waves
---

# GSD: Execute Phase Workflow

This workflow orchestrates the execution of all plans within a roadmap phase, following the defined waves.

## 1. Initialization

1. Load the phase execution context:

```bash
node rules/get-shit-done/bin/gsd-tools.cjs init execute-phase <PHASE_NUMBER>
```

2. Verify that plans exist in the phase directory.

## 2. Wave Execution

Execute plans in sequential waves. Within a wave, plans can run in parallel.

For each wave:

1. **Define Objectives**: State clearly what this wave will build and why it matters.

2. **Execute Plans**: For each plan in the wave, follow these steps:
    - Perform a "dry run" of the tasks.
    - Execute tasks atomically.
    - Commit each task individually with a clear message.
    - Create a `SUMMARY.md` in the plan's directory upon completion.

3. **Verify results**: Spot-check created files and git commits.

## 3. Handle Checkpoints

1. If a plan requires user guidance or runs into a major decision, it will create a checkpoint.

2. Present the checkpoint to the user, gather a response, and continue execution.

## 4. Phase Verification

1. Once all waves are complete, verify that the overall phase goal (from `ROADMAP.md`) has been achieved.

2. Create `VERIFICATION.md` in the phase directory.

3. Update `ROADMAP.md` and `STATE.md` to reflect phase completion.

## 5. Next Steps

1. Report completion and recommend the next phase or milestone archiving.
