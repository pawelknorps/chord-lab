const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const STANDARDS_PATH = path.join(__dirname, '../src/modules/JazzKiller/JazzStandards-main/JazzStandards.json');
const OUTPUT_DIR = path.join(__dirname, '../public/lessons');
const API_KEY = process.env.AI_API_KEY; // Expecting an API key if running for real
const MOCK_MODE = !API_KEY; // Default to mock mode if no key

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
    console.log('Starting Lesson Generation Pipeline...');
    console.log(`Mode: ${MOCK_MODE ? 'MOCK (No API Cost)' : 'LIVE (Using API)'}`);

    if (!fs.existsSync(STANDARDS_PATH)) {
        console.error(`Error: Standards file not found at ${STANDARDS_PATH}`);
        process.exit(1);
    }

    const standardsData = fs.readFileSync(STANDARDS_PATH, 'utf8');
    const standards = JSON.parse(standardsData);

    console.log(`Found ${standards.length} standards.`);

    // For the prototype, we process a small batch or specific songs
    // In production, this would iterate all 1300
    const batch = standards.slice(0, 5);

    for (const song of batch) {
        console.log(`Processing: ${song.Title}...`);
        try {
            const lesson = await generateLesson(song);

            const safeTitle = song.Title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            const outputPath = path.join(OUTPUT_DIR, `${safeTitle}.json`);

            fs.writeFileSync(outputPath, JSON.stringify(lesson, null, 2));
            console.log(`  -> Saved to public/lessons/${safeTitle}.json`);
        } catch (err) {
            console.error(`  -> Failed to generate lesson for ${song.Title}:`, err.message);
        }
    }

    console.log('Batch processing complete.');
}

async function generateLesson(song) {
    const prompt = constructPrompt(song);

    if (MOCK_MODE) {
        return mockLLMResponse(song, prompt);
    } else {
        return await callLLM(prompt);
    }
}

function constructPrompt(song) {
    const sections = song.Sections.map(s => {
        return `Section ${s.Label || 'Main'}: ${s.MainSegment.Chords}`;
    }).join('\n');

    return `
    You are a world-class jazz educator (like Barry Harris or Hal Galper). 
    Analyze the jazz standard "${song.Title}" in the key of ${song.Key || 'Unknown'}.
    
    The chord progression is:
    ${sections}
    
    Provide a structured lesson in JSON format with the following fields:
    1. "harmonicAnalysis": An array of objects, each with "barRange" (string, e.g. "1-4"), "analysis" (string), and "function" (string).
    2. "commonTraps": A list of common mistakes students make on this tune.
    3. "proTips": Advanced concepts or substitutions.
    4. "goldenLick": A specific lick (in ABC notation) that fits a difficult spot.
    
    Output ONLY valid JSON.
  `;
}

function mockLLMResponse(song, prompt) {
    // Simulate API latency
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                meta: {
                    title: song.Title,
                    source: "MOCK_GENERATOR",
                    promptUsed: prompt.length
                },
                harmonicAnalysis: [
                    {
                        barRange: "1-4",
                        analysis: "The tune opens with a standard ii-V-I progression.",
                        function: "Tonal Center Establishment"
                    },
                    {
                        barRange: "5-8",
                        analysis: "Unexpected modulation to the relative minor.",
                        function: "Modulation"
                    }
                ],
                commonTraps: [
                    "Rushing the tempo during the B section.",
                    "Ignoring the dynamic shift in bar 12."
                ],
                proTips: [
                    "Try tritone substitution on the dominant chords in the A section."
                ],
                goldenLick: {
                    notation: "C D E F G A B c",
                    description: "A scalar run to connect the measure."
                }
            });
        }, 500);
    });
}

// Placeholder for real API call (e.g. OpenAI or Anthropic)
async function callLLM(prompt) {
    // Implementation would go here using fetch or SDK
    // For now, throwing to ensure we don't accidentally try it without keys
    throw new Error("Live API call not implemented yet in prototype.");
}

main();
