const fs = require('fs');
const path = require('path');
const unscramble = require('ireal-reader/unscramble');

const STANDARDS_PATH = path.join(__dirname, '..', 'src', 'modules', 'JazzKiller', 'utils', 'standards.json');
const PLAYLIST_PATH = path.join(__dirname, '..', 'src', 'modules', 'JazzKiller', 'JazzStandards-main', 'ireal-jazz-playlist.json');

const standards = JSON.parse(fs.readFileSync(STANDARDS_PATH, 'utf8'));
const playlistRaw = fs.readFileSync(PLAYLIST_PATH, 'utf8');

const musicPrefix = "1r34LbKcu7";

function findSongInPlaylist(title) {
    const search = encodeURIComponent(title).replace(/\(/g, '%28').replace(/\)/g, '%29');
    const regex = new RegExp(search + "[^=]*=[^=]*=[^=]*=[^=]*=[^=]*=[^=]*=[^=]*=[^=]*", "i");
    const match = playlistRaw.match(regex);
    if (!match) return null;
    return decodeURIComponent(match[0]);
}

function parseIRealMusic(musicRaw) {
    const unscrambled = unscramble.ireal(musicRaw);
    let measures = [];
    let currentMeasure = [];
    let state = {
        inRepeat: false,
        repeatStart: -1,
        repeatEnd: -1,
        sections: []
    };

    // Very simplified parser for tokens
    const tokens = unscrambled.split(/([|Z\[\]{}<>*])/);
    let measureIndex = 0;

    for (const token of tokens) {
        if (!token) continue;
        if (token === '{') {
            state.repeatStart = measureIndex;
        } else if (token === '}') {
            state.repeatEnd = measureIndex - 1;
        } else if (token === '|' || token === 'Z' || token === '[' || token === ']') {
            measureIndex++;
        }
    }
    return { repeatStart: state.repeatStart, repeatEnd: state.repeatEnd, totalMeasures: measureIndex };
}

// Actually, I'll just look for the symbols manually in the unscrambled string
function getRepeatInfo(title) {
    const songUrl = findSongInPlaylist(title);
    if (!songUrl) return null;

    const parts = songUrl.split("=");
    let musicPart = parts.find(p => p.includes(musicPrefix));
    if (!musicPart) return null;

    const musicRaw = musicPart.split(musicPrefix)[1];
    const unscrambled = unscramble.ireal(musicRaw);

    // Count bars before { and }
    let barsBefStart = 0;
    let barsBefEnd = 0;

    let chars = unscrambled.split('');
    let barCount = 0;
    for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === '{') barsBefStart = barCount;
        if (c === '}') barsBefEnd = barCount;
        if (c === '|' || c === 'Z' || c === '[' || c === ']') barCount++;
    }

    return { start: barsBefStart, end: barsBefEnd, total: barCount };
}

standards.forEach(song => {
    const info = getRepeatInfo(song.Title);
    if (info && (info.start !== 0 || info.end !== 0)) {
        console.log(`Song: ${song.Title}, Repeat: ${info.start} to ${info.end}`);
        // For simplicity, we can just mark the whole song as having an internal repeat
        // But the current Sections architecture is better.
    }
});
