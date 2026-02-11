# GSD: Plan Phase

Read **`.agent/workflows/gsd-plan-phase.md`** and follow it. The user may specify a phase number (e.g. "1" or "2.1") in the chat; if not, ask for it or infer from `.planning/ROADMAP.md` and `.planning/STATE.md`. Run `node rules/get-shit-done/bin/gsd-tools.cjs init plan-phase <N> --include state,roadmap,requirements,context,research`, validate the phase, create or update PLAN.md (and RESEARCH.md if needed) in `.planning/phases/XX-name/`. Recommend `/gsd-execute-phase <N>` when done.
