# Scope: Gemini Nano + Augmented Jazz Assistant (2026)

## Summary
- **Browser detection**: Detect Prompt API (Gemini Nano) support; show banner inviting users to use the Augmented Jazz Assistant or switch to a supported browser (Chrome 128+, Edge 130+, Brave with flag, Opera One).
- **Teacher Logic**: System prompt + `generateJazzLesson(song, focusMode)` for high-level jazz pedagogy via `window.ai.languageModel`.
- **Lick Converter**: Map interval/degree templates (e.g. "1 2 b3 5") to notes for any chord symbol using Tonal.js.
- **Progression Transposer Teacher**: Cycle-of-fifths key practice with AI “mental shift” tips.
- **Lick Library**: Save formula templates; apply and display them across any song in the 1,300-song database.

## Browsers (2026)
| Browser | Support | Note |
|---------|---------|------|
| Google Chrome | Native | 128+ |
| Microsoft Edge | Native | 130+ |
| Brave | Experimental | May need #prompt-api-for-gemini-nano flag |
| Opera | Native | Opera One (2026) |
| Safari / Firefox | Not supported | Use Chrome/Edge for AI features |

## Implementation
- `src/components/AiAssistantBanner.tsx` – detection + banner + Learn More (troubleshooting).
- `src/modules/JazzKiller/ai/jazzTeacherLogic.ts` – system prompt + generateJazzLesson.
- `src/modules/JazzKiller/utils/lickConverter.ts` – convertLick(template, chordSymbol).
- `src/modules/JazzKiller/components/MasterKeyTeacher.tsx` – cycle of fifths + AI tips.
- `src/modules/JazzKiller/components/LickLibrary.tsx` – save formulas, apply to current song.
