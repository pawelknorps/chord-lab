const fs = require('fs');
const path = require('path');
const STANDARDS_PATH = path.join(__dirname, '..', 'src', 'modules', 'JazzKiller', 'utils', 'standards.json');
const standards = JSON.parse(fs.readFileSync(STANDARDS_PATH, 'utf8'));

let count = 0;
standards.forEach(s => {
    if (s.DefaultLoops == null || s.DefaultLoops === 0) {
        s.DefaultLoops = 2; // Default to 3 choruses total
        count++;
    }
});

fs.writeFileSync(STANDARDS_PATH, JSON.stringify(standards, null, 2) + '\n');
console.log(`Updated DefaultLoops to 2 for ${count} songs.`);
