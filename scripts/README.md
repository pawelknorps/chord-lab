# Lesson Generation Pipeline

## Overview
This script generates AI-powered harmonic analysis lessons for jazz standards.

## Usage

### MOCK Mode (Free, No API)
```bash
node scripts/generate-lessons.cjs
```

### Production Mode (Requires API Key)
```bash
export AI_API_KEY="your-anthropic-or-openai-key"
node scripts/generate-lessons.cjs
```

## Configuration

Edit `scripts/generate-lessons.cjs`:

```javascript
// Change batch size (line 26)
const batch = standards.slice(0, 50); // Generate 50 lessons

// Modify the prompt (line 52-68)
// Customize what the AI analyzes
```

## Output Format

Lessons are saved to `public/lessons/{song-title}.json`:

```json
{
  "meta": {
    "title": "Song Name",
    "source": "MOCK_GENERATOR" or "CLAUDE_3.5",
    "promptUsed": 946
  },
  "harmonicAnalysis": [
    {
      "barRange": "1-4",
      "analysis": "Description of what's happening",
      "function": "Harmonic function (e.g., ii-V-I)"
    }
  ],
  "commonTraps": ["Mistake 1", "Mistake 2"],
  "proTips": ["Advanced tip 1"],
  "goldenLick": {
    "notation": "C D E F G A B c",
    "description": "When to use this lick"
  }
}
```

## Cost Estimation

- **MOCK Mode**: $0
- **Claude 3.5 Sonnet**: ~$0.03-0.08 per song
- **GPT-4**: ~$0.05-0.10 per song
- **1,300 standards**: ~$50-100 total (one-time)

## Roadmap

- [x] MOCK generator
- [ ] Claude 3.5 integration
- [ ] Gemini 1.5 Pro integration
- [ ] Batch processing with rate limiting
- [ ] Quality validation
- [ ] ABC notation for licks
- [ ] Audio examples (future)
