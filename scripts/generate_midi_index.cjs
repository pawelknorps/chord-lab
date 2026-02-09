
const fs = require('fs');
const path = require('path');

const ROOT_DIR = '/Users/pawelknorps/chord-lab';
const SRC_DIR = path.join(ROOT_DIR, 'src', 'midi_progressions');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const OUTPUT_FILE = path.join(PUBLIC_DIR, 'midi_index.json');

const files = [];

function scanDir(dir, relativePath = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue; // skip hidden

        if (entry.isDirectory()) {
            scanDir(path.join(dir, entry.name), [...relativePath, entry.name]);
        } else if (entry.isFile() && entry.name.endsWith('.mid')) {
            processFile(entry.name, relativePath);
        }
    }
}

function processFile(filename, dirParts) {
    // Reconstruct logic from useMidiLibrary.ts
    // In the original, 'parts' included the full path.
    // Here dirParts are components relative to src/midi_progressions.
    // e.g. ['Major'] or ['Major', 'pop style']

    // logic:
    // let finalCategory = parts[parts.length - 2]; 
    // Wait, in glob it was full path. 
    // Here, if file is at `Major/file.mid`, dirParts is `['Major']`.
    // so category is dirParts[dirParts.length - 1].

    let category = dirParts[dirParts.length - 1] || 'Unknown';
    let style = 'Classic';

    // Handle style folders
    if (category.includes('style')) {
        style = category.replace(' style', '');
        category = dirParts[dirParts.length - 2] || 'Unknown';
    }

    // Filename parsing
    // 1. Remove extension
    const rawName = filename.replace(/\.mid$/i, '');

    // 2. Split by " - "
    const nameParts = rawName.split(' - ');

    // Ensure we have at least Key and Progression
    let key = nameParts[0]?.trim() || 'C';
    key = key.replace('s', '#');

    const progression = nameParts[1]?.trim() || 'Unknown';
    const mood = nameParts.slice(2).join(' - ').trim();

    // specific handling for "flat" files
    // The original code used parts from the glob path.
    // We need to map this carefully.

    // Path for the app to fetch:
    // /midi_progressions/Major/file.mid
    const webPath = '/midi_progressions/' + [...dirParts, filename].join('/');

    files.push({
        name: filename,
        path: webPath,
        category,
        style,
        key,
        progression,
        mood
    });
}

console.log('Scanning...');
scanDir(SRC_DIR);
console.log(`Found ${files.length} MIDI files.`);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(files, null, 2));
console.log(`Wrote index to ${OUTPUT_FILE}`);
