# Phase 7 Summary: Ear Trainer Feedback Loop & Rhythm Scat

- **Goal**: Ear Trainer explains why mistakes happened (diagnostic hints); Rhythm Trainer gets scat phrases for subdivisions. Nano used as Contextual Metadata Generator; no prior context assumed.
- **Waves**: 2 — (1) Ear: diagnoseEarError, getEarHint, Listen Again UI in IntervalsLevel; (2) Rhythm: getScatForSubdivision, display above metronome, askNano guardrail.
- **Key files**: `earDiagnosis.ts`, `earHintService.ts`, `IntervalsLevel.tsx`, `SubdivisionPyramid.tsx`, optional `nanoHelpers.ts`, optional `rhythmScatService.ts`.
- **Success**: Wrong answers in Ear Trainer show AI hint + Listen again + retry; Rhythm shows scat phrase above metronome; all Nano calls re-inject context.
