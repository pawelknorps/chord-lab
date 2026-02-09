
const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const MIDI_DIR = path.join(PUBLIC_DIR, 'midi_progressions');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'midi_library.json');

const progressions = new Map();

function scanDir(dir, relativePath = []) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;

        if (entry.isDirectory()) {
            scanDir(path.join(dir, entry.name), [...relativePath, entry.name]);
        } else if (entry.isFile() && entry.name.endsWith('.mid')) {
            processFile(entry.name, relativePath);
        }
    }
}

function processFile(filename, dirParts) {
    // Category isusually the first folder under midi_progressions
    let category = dirParts[0] || 'Unknown';
    let style = dirParts[dirParts.length - 1] || 'Classic';

    if (style.includes('style')) {
        style = style.replace(' style', '');
    }

    // Filename: "Key - Roman - Roman - ..."
    const rawName = filename.replace(/\.mid$/i, '');
    const nameParts = rawName.split(' - ');

    const key = nameParts[0]?.trim() || 'C';
    const romanParts = nameParts.slice(1).map(p => p.trim());
    const fullProgression = romanParts.join(' - ');

    // Unique ID for de-duplication across keys
    const id = `${category}|${style}|${fullProgression}`;

    if (!progressions.has(id)) {
        progressions.set(id, {
            category,
            style,
            progression: fullProgression,
            name: fullProgression
        });
    }
}

console.log('Scanning MIDI library...');
scanDir(MIDI_DIR);
const optimized = Array.from(progressions.values());
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(optimized, null, 2));
console.log(`Successfully generated optimized library with ${optimized.length} unique progressions.`);
