---
description: Initialize a new project or milestone using GSD methodology
---
// turbo-all
# GSD: New Project Workflow

This workflow guides you through project initialization, including questioning, optional research, requirement definition, and roadmap creation.

## 1. Initialization
1. Verify if the project is already initialized.
```bash

node rules/get-shit-done/bin/gsd-tools.cjs init new-project

```
2. If `project_exists` is true, recommend using `/gsd-progress` instead.
3. Ensure git is initialized:
```bash
git rev-parse --is-inside-work-tree || git init
```

## 2. Brownfield Check
1. If the project already has code but no codebase map, suggest running `/gsd-map-codebase` first.

## 3. Deep Questioning
1. Ask the user: "What do you want to build?"
2. Conduct an iterative questioning session to uncover requirements, constraints, and core value.
3. Aim to surface:
    - Target audience and problem solved.
    - Core functionality (The ONE thing that must work).
    - Technical constraints or preferences.
    - Scope boundaries (What's out of scope).

## 4. Project Vision (PROJECT.md)
1. Synthesize the questioning results into `.planning/PROJECT.md`.
2. Include:
    - Vision statement.
    - Core value proposition.
    - High-level requirements (Active/Validated).
    - Out-of-scope items.
    - Key decisions table.
3. Commit the file:
```bash
mkdir -p .planning

node rules/get-shit-done/bin/gsd-tools.cjs commit "docs: initialize project" --files .planning/PROJECT.md

```

## 5. Process Configuration (config.json)
1. Define workflow preferences into `.planning/config.json`:
    - **Mode**: YOLO (auto-approve) vs Interactive.
    - **Depth**: Quick vs Standard vs Comprehensive.
    - **Parallelization**: Parallel vs Sequential execution.
    - **Commit Docs**: Whether to track `.planning/` in git.

## 6. Domain Research (Optional)
1. Offer to perform research on the domain ecosystem.
2. If selected, create `.planning/research/` and generate:
    - **STACK.md**: Best-in-class libraries and versions.
    - **FEATURES.md**: Table stakes vs differentiators.
    - **ARCHITECTURE.md**: Standard patterns for this domain.
    - **PITFALLS.md**: Common mistakes and prevention.
    - **SUMMARY.md**: Synthesized findings.
3. Commit research artifacts.

## 7. Requirement Scoping (REQUIREMENTS.md)
1. Define specific, testable requirements with REQ-IDs (e.g., `AUTH-01`).
2. Categorize into:
    - **v1 Requirements**: Must-haves for the current milestone.
    - **v2/Deferred**: Future features.
    - **Out of Scope**: Explicit exclusions.
3. Commit requirements:
```bash

node rules/get-shit-done/bin/gsd-tools.cjs commit "docs: define v1 requirements" --files .planning/REQUIREMENTS.md

```

## 8. Roadmap Creation (ROADMAP.md)
1. Derive phases from requirements.
2. Map every v1 requirement to a phase.
3. Set success criteria for each phase.
4. Initialize `.planning/STATE.md` to track project progress.
5. Commit the roadmap:
```bash

node rules/get-shit-done/bin/gsd-tools.cjs commit "chore: add project config" --files .planning/config.json .planning/ROADMAP.md .planning/STATE.md .planning/REQUIREMENTS.md

```

## 9. Next Steps
1. Suggest running `/gsd-plan-phase 1` to begin detailed planning for the first phase.
