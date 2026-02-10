#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STANDARDS_DIR = path.join(__dirname, '../public/standards');
const OUTPUT_DIR = path.join(__dirname, '../public/lessons');

const ANALYSIS_PROMPT = `Analyze this jazz standard and provide:
1. Key ii-V-I progressions (measure numbers)
2. Avoid notes for each chord
3. Pro substitutions (tritone subs, modal interchange)
4. One "golden lick" idea (describe in text)

Song: {title}
Chords: {chords}

Return JSON:
{
  "hotspots": [{"type": "ii-V-I", "measures": [1,2,3], "analysis": "..."}],
  "avoidNotes": {"measure": 1, "chord": "Cmaj7", "avoid": ["F"]},
  "substitutions": [{"original": "Dm7-G7", "sub": "Dbm7-Gb7", "measures": [5,6]}],
  "goldenLick": "Approach the 3rd from below, emphasize 9th on V7..."
}`;

async function analyzeStandard(standard) {
    // Placeholder - integrate with Claude/Gemini API
    return {
        hotspots: [],
        avoidNotes: [],
        substitutions: [],
        goldenLick: "Sample lick for " + standard.title
    };
}

async function main() {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const files = await fs.readdir(STANDARDS_DIR);
    const midiFiles = files.filter(f => f.endsWith('.mid'));

    console.log(`Processing ${midiFiles.length} standards...`);

    for (const file of midiFiles.slice(0, 5)) { // Start with 5
        const id = path.basename(file, '.mid');
        const lesson = await analyzeStandard({ title: id, file });
        await fs.writeFile(
            path.join(OUTPUT_DIR, `${id}.json`),
            JSON.stringify(lesson, null, 2)
        );
    }

    console.log('Done.');
}

main();
