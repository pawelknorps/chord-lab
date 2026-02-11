# GSD: Execute Phase

Read **`.agent/workflows/gsd-execute-phase.md`** and follow it. The user may specify a phase number in the chat; if not, ask or use current phase from `.planning/STATE.md`. Run `node rules/get-shit-done/bin/gsd-tools.cjs init execute-phase <N>`, then execute plans wave by wave (atomic tasks, commit per task, SUMMARY.md per plan). Handle checkpoints with the user. Create VERIFICATION.md and update ROADMAP.md and STATE.md. Suggest next phase or `/gsd-complete-milestone` when done.
