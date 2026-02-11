Use GSD workflows and planning context:

1. **Workflows**: Read the right workflow from `.agent/workflows/` before doing any GSD action:
   - **Status**: `.agent/workflows/gsd-progress.md` then run `node rules/get-shit-done/bin/gsd-tools.cjs init progress --include state,roadmap,project,config` and summarize.
   - **Plan phase N**: `.agent/workflows/gsd-plan-phase.md`, then plan phase N.
   - **Execute phase N**: `.agent/workflows/gsd-execute-phase.md`, then execute phase N.
   - **New project**: `.agent/workflows/gsd-new-project.md`.
   - **Map codebase**: `.agent/workflows/gsd-map-codebase.md`.
   - **Help**: `.agent/workflows/gsd-help.md` — show command reference.

2. **Planning**: Use `.planning/` for context: PROJECT.md, ROADMAP.md, STATE.md, REQUIREMENTS.md, config.json, and `.planning/phases/<phase>/` for current phase plans.

Start by running **progress** (status and next step) unless the user asked for something specific (e.g. "plan phase 2", "execute phase 1").
