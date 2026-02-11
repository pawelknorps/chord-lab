# GSD: Progress

Read **`.agent/workflows/gsd-progress.md`** and run the progress workflow. Execute:

```bash
node rules/get-shit-done/bin/gsd-tools.cjs init progress --include state,roadmap,project,config
```

Then:

```bash
node rules/get-shit-done/bin/gsd-tools.cjs progress bar --raw
```

Summarize: recent work (2–3 SUMMARY.md one-liners), current phase/plan, key decisions from STATE.md, any blockers. Recommend the next GSD command (e.g. `/gsd-execute-phase N`, `/gsd-plan-phase N`, `/gsd-complete-milestone`). Note any PAUSED or active debug sessions.
