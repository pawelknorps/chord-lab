#!/usr/bin/env node
/**
 * AOT (Ahead-of-Time) Lesson Generator — Step 15
 * Reads JazzKiller standards and writes template lesson JSON to public/lessons/.
 * Real AI analysis uses Gemini Nano in Chrome via "Ask Local Agent" in the app.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const STANDARDS_PATH = path.join(ROOT, 'src/modules/JazzKiller/utils/standards.json');
const OUTPUT_DIR = path.join(ROOT, 'public/lessons');

const DEFAULT_LIMIT = 10;
const SLUG_RE = /[^a-z0-9]/gi;

function slug(title) {
  return String(title).replace(SLUG_RE, '-').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Flatten chord progression from standard Sections into a single string.
 */
function getChordSummary(standard) {
  const key = standard.Key || 'C';
  const parts = [];

  for (const section of standard.Sections || []) {
    const seg = section.MainSegment;
    if (!seg?.Chords) continue;
    const measures = seg.Chords.split('|').map((s) => s.trim()).filter(Boolean);
    for (const m of measures) {
      const chords = m.split(',').map((c) => c.trim()).filter(Boolean);
      parts.push(chords.join(', '));
    }
  }

  return { key, chordLine: parts.join(' | ') };
}

function buildTemplateLesson(title, key, chordLine) {
  return {
    meta: { title, source: 'AOT_TEMPLATE', promptUsed: 0 },
    harmonicAnalysis: [
      {
        barRange: '1-4',
        analysis: `Template for "${title}" (key ${key}). Use "Ask Local Agent" in the app for AI analysis (Gemini Nano in Chrome).`,
        function: 'Tonal Center',
      },
    ],
    commonTraps: ['Use "Ask Local Agent" in the app for personalized tips.'],
    proTips: ['Open Smart Lesson and click "Ask Local Agent" for real-time jazz pedagogy (Chrome with Gemini Nano).'],
    goldenLick: {
      notation: 'C E G Bb',
      description: 'Use "Ask Local Agent" in the app for a golden lick tailored to this tune.',
    },
    hotspots: [],
    avoidNotes: [],
    substitutions: [],
    practicePoints: [],
    commonMistakes: [],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 && args[limitIdx + 1] ? parseInt(args[limitIdx + 1], 10) : DEFAULT_LIMIT;
  const dryRun = args.includes('--dry-run');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let standards;
  try {
    const raw = await fs.readFile(STANDARDS_PATH, 'utf8');
    standards = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read standards from', STANDARDS_PATH, e.message);
    process.exit(1);
  }

  const slice = Array.isArray(standards) ? standards.slice(0, limit) : [];
  console.log(`Processing ${slice.length} standards (limit=${limit}${dryRun ? ', dry-run' : ''})...`);

  for (const standard of slice) {
    const title = standard.Title || 'Unknown';
    const { key, chordLine } = getChordSummary(standard);
    const lessonSlug = slug(title);

    if (dryRun) {
      console.log('  [dry-run]', title);
      continue;
    }

    const lesson = buildTemplateLesson(title, key, chordLine);
    const outPath = path.join(OUTPUT_DIR, `${lessonSlug}.json`);
    await fs.writeFile(outPath, JSON.stringify(lesson, null, 2), 'utf8');
    console.log('  wrote', lessonSlug + '.json');
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
