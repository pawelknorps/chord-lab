# Phase 7 Verification: Ear Trainer Feedback Loop & Rhythm Scat

## Phase goal (from ROADMAP.md)

Ear Trainer explains why mistakes happened (diagnostic hints); Rhythm Trainer gets scat phrases for subdivisions. Nano narrates Tonal.js ground truth. No Nano call assumes prior context.

## Success criteria

| Criterion | Status | Notes |
|-----------|--------|--------|
| **Step 20**: diagnoseEarError returns correct, guess, errorType, distance, isCommonConfusion | ✅ | `earDiagnosis.ts` implements with NAME_TO_SEMITONES; P4/tritone/P5 common confusion. |
| **Step 21**: getEarHint returns 1-sentence hint without giving interval name; one-shot session, diagnosis as context | ✅ | `earHintService.ts` uses askNano with EAR_HINT_SYSTEM_PROMPT; fallback "Listen for the tension and release." |
| **Step 22**: Ear Trainer wrong answers show "Not quite" + AI hint; "Listen again" replays; retry leads to success; Skip loads next challenge | ✅ | IntervalsLevel: wrong path calls diagnoseEarError + getEarHint; UI shows hint, "Listen again", "Skip"; disabled only on correct. |
| **Step 23**: Rhythm Trainer shows scat phrase above metronome for selected subdivision when Nano available; getScatForSubdivision returns short phrase | ✅ | `rhythmScatService.ts` + SubdivisionPyramid: scat above metronome; fallback to KONNAKOL when Nano off. |
| **Step 24**: All new Nano calls re-inject context (askNano pattern); no reliance on prior turns | ✅ | nanoHelpers.askNano used by getEarHint and getScatForSubdivision; create → prompt with Context JSON → destroy. |

## Deliverables

- **Wave 1**: earDiagnosis.ts, nanoHelpers.ts, earHintService.ts, IntervalsLevel Listen Again UI (commits: e3c4538, c06774a, bf84d96, ff07eac).
- **Wave 2**: rhythmScatService.ts, SubdivisionPyramid scat display (commits: 2398f45, b954dd2).

## Manual verification (recommended)

1. **Ear Trainer**: Open Functional Ear Training → Pure Intervals. Play an interval, choose a wrong answer. Confirm "Not quite.", AI hint (or "Getting hint..." then hint), "Listen again" (replays), "Skip" (next challenge). Retry with correct answer → success and next challenge.
2. **Rhythm Scat**: Open Rhythm Architect → Pyramid Lab. Confirm "Say: …" scat phrase above the Play button/metronome. Change subdivision (e.g. select Triplets) → scat updates when Nano available; when Nano off, Konnakol syllable shown.
3. **Nano guardrail**: All Nano usage in this phase goes through askNano with context JSON; no conversation history assumed.

Phase 7 complete.
