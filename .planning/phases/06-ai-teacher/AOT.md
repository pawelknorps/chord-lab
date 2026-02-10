# AOT Lesson Generator (Step 15)

Script: `scripts/generate-lessons.js`

## What it does

- **Input**: Reads standards from `src/modules/JazzKiller/utils/standards.json` (Title, Key, Sections → MainSegment.Chords).
- **Output**: Writes **template** lesson JSON to `public/lessons/{slug}.json` (slug from title, e.g. `9-20-special`). Format matches ChordLab SmartLessonPane and JazzKiller lesson schema.

**AI analysis**: We use **Gemini Nano in Chrome-based browsers** only. No cloud API keys (OpenAI/Anthropic). Real lessons come from "Ask Local Agent" in the app, which calls the local model via `window.ai`. The AOT script only produces template lessons so SmartLessonPane can load a valid JSON; users get live AI when they click "Ask Local Agent".

## How to run

```bash
# Dry-run (no writes): list first 3 standards
npm run generate:lessons:dry

# Generate template lessons (default limit 10)
npm run generate:lessons

# Custom limit
node scripts/generate-lessons.js --limit 5

# Dry-run with limit
node scripts/generate-lessons.js --dry-run --limit 20
```

## Output format

Lesson JSON includes: `meta`, `harmonicAnalysis`, `commonTraps`, `proTips`, `goldenLick`, `hotspots`, `avoidNotes`, `substitutions`, `practicePoints`, `commonMistakes`. ChordLab SmartLessonPane uses meta, harmonicAnalysis, commonTraps, proTips, goldenLick; JazzKiller can use hotspots, avoidNotes, substitutions, etc. Template content directs users to "Ask Local Agent" for AI analysis.
