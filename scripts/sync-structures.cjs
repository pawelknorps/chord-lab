const fs = require('fs');
const path = require('path');

const STANDARDS_PATH = path.join(__dirname, '..', 'src', 'modules', 'JazzKiller', 'utils', 'standards.json');
const SOURCE_PATH = path.join(__dirname, '..', 'src', 'modules', 'JazzKiller', 'JazzStandards-main', 'JazzStandards.json');

const target = JSON.parse(fs.readFileSync(STANDARDS_PATH, 'utf8'));
const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));

let updatedCount = 0;

target.forEach(song => {
    const s = source.find(x => x.Title.trim().toLowerCase() === song.Title.trim().toLowerCase());
    if (s && s.Sections) {
        // Compare structural counts
        if (s.Sections.length !== song.Sections.length) {
            // If the source has multiple sections and ours doesn't, or vice-versa
            // We should trust the source if it has more structure (more sections or repeats)
            song.Sections = s.Sections;
            updatedCount++;
        } else {
            // Check if repeats or endings are different
            let diff = false;
            for (let i = 0; i < s.Sections.length; i++) {
                if (Boolean(s.Sections[i].Repeats) !== Boolean(song.Sections[i].Repeats)) diff = true;
                if (s.Sections[i].Repeats !== song.Sections[i].Repeats) diff = true;
                if (Boolean(s.Sections[i].Endings) !== Boolean(song.Sections[i].Endings)) diff = true;
                if (s.Sections[i].Endings && song.Sections[i].Endings && s.Sections[i].Endings.length !== song.Sections[i].Endings.length) diff = true;
            }
            if (diff) {
                song.Sections = s.Sections;
                updatedCount++;
            }
        }
    }
});

if (updatedCount > 0) {
    fs.writeFileSync(STANDARDS_PATH, JSON.stringify(target, null, 2) + '\n');
    console.log(`Updated repeats/sections for ${updatedCount} songs.`);
} else {
    console.log("No structural updates found.");
}
